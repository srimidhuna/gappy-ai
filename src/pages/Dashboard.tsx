import React, { useMemo } from 'react';
import {
    ClipboardList,
    Clock,
    Loader2,
    AlertTriangle,
    CheckCircle2,
    Flag,
    ArrowRight,
    Activity,
    BarChart2,
    Calendar,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../components/common/Card';
import { StatCard, StatCardSkeleton } from '../components/dashboard/StatCard';
import { WeeklyWorkloadChart } from '../components/dashboard/WeeklyWorkloadChart';
import { UpcomingDeadlines } from '../components/dashboard/UpcomingDeadlines';
import { HighPrioritySection } from '../components/dashboard/HighPrioritySection';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { DashboardEmptyState } from '../components/dashboard/DashboardEmptyState';
import { useAssignmentStore } from '../store/assignmentStore';
import { useNavigate } from 'react-router-dom';
import type { Assignment } from '../types';

// ─── Data hook (React Query wrapping Zustand store) ─────────────────────────
const useDashboardData = (assignments: Assignment[]) => {
    return useQuery({
        queryKey: ['dashboard', assignments.length, assignments.map((a) => `${a.id}-${a.status}`).join(',')],
        queryFn: async () => {
            // Simulate a brief async fetch (mimics real API latency; remove in production)
            await new Promise((r) => setTimeout(r, 600));

            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];

            // ── Stats ──────────────────────────────────────────────────────
            const stats = {
                total: assignments.length,
                pending: assignments.filter((a) => a.status === 'pending').length,
                inProgress: assignments.filter((a) => a.status === 'in-progress').length,
                completed: assignments.filter((a) => a.status === 'completed').length,
                overdue: assignments.filter((a) => a.status === 'overdue').length,
            };

            // ── Weekly workload (Mon–Sun, fixed week order) ────────────────
            const weekDayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const weekData = weekDayNames.map((day, idx) => {
                const d = new Date();
                // Start from the Monday of the current week
                const dayOfWeek = d.getDay(); // 0=Sun,1=Mon...
                const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                d.setDate(d.getDate() + mondayOffset + idx);
                const dateStr = d.toISOString().split('T')[0];
                const count = assignments.filter((a) => a.dueDate.startsWith(dateStr)).length;
                return { day, count, isToday: dateStr === todayStr };
            });

            // ── Upcoming deadlines (next 5, non-completed, sorted by date) ─
            const upcoming = [...assignments]
                .filter((a) => a.status !== 'completed')
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .slice(0, 5);

            // ── High priority (not completed), overdue first ────────────────
            const highPriority = [...assignments]
                .filter((a) => a.priority === 'high' && a.status !== 'completed')
                .sort((a) => (a.status === 'overdue' ? -1 : 1));

            // ── Recent activity (sorted by createdAt desc, last 6) ─────────
            const recentActivity = [...assignments]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 6);

            return { stats, weekData, upcoming, highPriority, recentActivity };
        },
        staleTime: 0,
        gcTime: 0,
    });
};

// ─── Dashboard Component ──────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
    const { assignments } = useAssignmentStore();
    const navigate = useNavigate();
    const { data, isLoading } = useDashboardData(assignments);

    const statCards = useMemo(() => [
        {
            label: 'Total Assignments',
            value: data?.stats.total ?? 0,
            icon: ClipboardList,
            iconColor: 'text-primary-600',
            iconBg: 'bg-primary-50',
        },
        {
            label: 'Pending',
            value: data?.stats.pending ?? 0,
            icon: Clock,
            iconColor: 'text-amber-600',
            iconBg: 'bg-amber-50',
        },
        {
            label: 'In Progress',
            value: data?.stats.inProgress ?? 0,
            icon: Loader2,
            iconColor: 'text-cyan-600',
            iconBg: 'bg-cyan-50',
        },
        {
            label: 'Completed',
            value: data?.stats.completed ?? 0,
            icon: CheckCircle2,
            iconColor: 'text-emerald-600',
            iconBg: 'bg-emerald-50',
        },
        {
            label: 'Overdue',
            value: data?.stats.overdue ?? 0,
            icon: AlertTriangle,
            iconColor: 'text-red-500',
            iconBg: 'bg-red-50',
        },
    ], [data?.stats]);

    const isEmpty = !isLoading && assignments.length === 0;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-8">
            {/* ── Page header ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-800">Dashboard</h1>
                    <p className="text-sm text-surface-500 mt-1">
                        {isLoading
                            ? 'Loading your overview…'
                            : isEmpty
                            ? 'Get started by adding your first assignment.'
                            : `You have ${data?.stats.overdue ?? 0} overdue and ${data?.stats.pending ?? 0} pending assignments.`}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/assignments')}
                    className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                    <ArrowRight className="w-4 h-4" />
                    View All
                </button>
            </div>

            {/* ── Empty state ─────────────────────────────────────────────── */}
            {isEmpty && (
                <Card>
                    <DashboardEmptyState />
                </Card>
            )}

            {/* ── Stat Cards ──────────────────────────────────────────────── */}
            {!isEmpty && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {isLoading
                        ? Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
                        : statCards.map((card) => (
                              <StatCard key={card.label} {...card} isLoading={isLoading} />
                          ))}
                </div>
            )}

            {/* ── Main grid: Upcoming + High Priority ─────────────────────── */}
            {!isEmpty && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Upcoming Deadlines */}
                    <div className="lg:col-span-2">
                        <Card
                            title="Upcoming Deadlines"
                            subtitle="Next 5 assignments sorted by due date"
                            action={
                                <button
                                    onClick={() => navigate('/assignments')}
                                    className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                    <Calendar className="w-3 h-3" />
                                    View all
                                    <ArrowRight className="w-3 h-3" />
                                </button>
                            }
                        >
                            <UpcomingDeadlines
                                assignments={data?.upcoming ?? []}
                                isLoading={isLoading}
                            />
                        </Card>
                    </div>

                    {/* High Priority */}
                    <Card
                        title="High Priority"
                        subtitle={
                            isLoading
                                ? 'Loading…'
                                : `${data?.highPriority.length ?? 0} item${(data?.highPriority.length ?? 0) !== 1 ? 's' : ''} need attention`
                        }
                        action={
                            <div className="flex items-center gap-1 text-red-500">
                                <Flag className="w-4 h-4" />
                            </div>
                        }
                    >
                        <HighPrioritySection
                            assignments={data?.highPriority ?? []}
                            isLoading={isLoading}
                        />
                    </Card>
                </div>
            )}

            {/* ── Bottom grid: Weekly Chart + Recent Activity ──────────────── */}
            {!isEmpty && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Weekly Workload Chart */}
                    <Card
                        title="Weekly Workload"
                        subtitle="Assignments due Mon – Sun this week"
                        action={
                            <div className="flex items-center gap-1 text-primary-400">
                                <BarChart2 className="w-4 h-4" />
                            </div>
                        }
                    >
                        <div className="pt-2">
                            <WeeklyWorkloadChart
                                data={data?.weekData ?? []}
                                isLoading={isLoading}
                            />
                        </div>
                        {!isLoading && (
                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-surface-100">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded bg-primary-500" />
                                    <span className="text-xs text-surface-500">Today</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded bg-blue-200" />
                                    <span className="text-xs text-surface-500">Other days</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded bg-surface-200" />
                                    <span className="text-xs text-surface-500">No assignments</span>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Recent Activity */}
                    <Card
                        title="Recent Activity"
                        subtitle="Latest assignments added to your workspace"
                        action={
                            <div className="flex items-center gap-1 text-surface-400">
                                <Activity className="w-4 h-4" />
                            </div>
                        }
                    >
                        <RecentActivity
                            assignments={data?.recentActivity ?? []}
                            isLoading={isLoading}
                        />
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
