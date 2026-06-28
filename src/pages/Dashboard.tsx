import React from 'react';
import {
    ClipboardList,
    Clock,
    Loader2,
    AlertTriangle,
    Calendar,
    Flag,
    ArrowRight,
    TrendingUp,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useAssignmentStore } from '../store/assignmentStore';
import { usePlannerStore } from '../store/plannerStore';
import { mockStats } from '../utils/mockData';
import type { Assignment, AssignmentStatus, AssignmentPriority } from '../types';

const statusBadge: Record<AssignmentStatus, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary'; label: string }> = {
    pending: { variant: 'warning', label: 'Pending' },
    'in-progress': { variant: 'info', label: 'In Progress' },
    completed: { variant: 'success', label: 'Completed' },
    overdue: { variant: 'danger', label: 'Overdue' },
};

const priorityColors: Record<AssignmentPriority, string> = {
    high: 'text-red-500',
    medium: 'text-amber-500',
    low: 'text-emerald-500',
};

const statCards = [
    { label: 'Total Assignments', value: mockStats.total, icon: ClipboardList, color: 'from-primary-500 to-primary-600', bg: 'bg-primary-50' },
    { label: 'Pending', value: mockStats.pending, icon: Clock, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50' },
    { label: 'In Progress', value: mockStats.inProgress, icon: Loader2, color: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Overdue', value: mockStats.overdue, icon: AlertTriangle, color: 'from-red-500 to-red-600', bg: 'bg-red-50' },
];

const Dashboard: React.FC = () => {
    const { assignments } = useAssignmentStore();
    const { tasks } = usePlannerStore();

    const todayStr = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter((t) => t.date === todayStr);
    const upcoming = [...assignments]
        .filter((a) => a.status !== 'completed')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5);
    const highPriority = assignments.filter((a) => a.priority === 'high' && a.status !== 'completed');

    // Weekly bar chart data (assignments due per day)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekDays = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return dayNames[d.getDay()];
    });

    const weekCounts = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        return assignments.filter((a) => a.dueDate.startsWith(dateStr)).length;
    });
    const maxCount = Math.max(...weekCounts, 1);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-surface-800">Dashboard</h1>
                <p className="text-sm text-surface-500 mt-1">Welcome back! Here's your deadline overview.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white rounded-xl border border-surface-200 p-5 flex items-start gap-4 hover:shadow-md transition-shadow"
                    >
                        <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center`}>
                            <stat.icon className={`w-5 h-5 bg-gradient-to-br ${stat.color} bg-clip-text`} style={{ color: stat.color.includes('primary') ? '#3b82f6' : stat.color.includes('amber') ? '#f59e0b' : stat.color.includes('cyan') ? '#06b6d4' : '#ef4444' }} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-surface-800">{stat.value}</p>
                            <p className="text-xs text-surface-500 mt-0.5">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Deadlines */}
                <div className="lg:col-span-2">
                    <Card title="Upcoming Deadlines" subtitle="Next 5 assignments due" action={
                        <button className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 cursor-pointer">
                            View all <ArrowRight className="w-3 h-3" />
                        </button>
                    }>
                        <div className="space-y-3">
                            {upcoming.map((a: Assignment) => (
                                <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 hover:bg-surface-100 transition-colors">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-1 h-10 rounded-full ${a.priority === 'high' ? 'bg-red-400' : a.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-surface-700 truncate">{a.title}</p>
                                            <p className="text-xs text-surface-400">{a.subject}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <div className="text-right">
                                            <p className="text-xs font-medium text-surface-600">
                                                {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                        <Badge variant={statusBadge[a.status].variant} dot>
                                            {statusBadge[a.status].label}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Today's Tasks */}
                <Card title="Today's Tasks" subtitle={`${todayTasks.filter(t => t.completed).length}/${todayTasks.length} completed`}>
                    <div className="space-y-2">
                        {todayTasks.length === 0 ? (
                            <p className="text-sm text-surface-400 text-center py-6">No tasks for today 🎉</p>
                        ) : (
                            todayTasks.map((task) => (
                                <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-50 transition-colors">
                                    <div
                                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${task.completed
                                            ? 'bg-primary-500 border-primary-500'
                                            : 'border-surface-300'
                                            }`}
                                    >
                                        {task.completed && (
                                            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12">
                                                <path d="M3.5 6L5.5 8L8.5 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-sm ${task.completed ? 'text-surface-400 line-through' : 'text-surface-700'}`}>
                                            {task.title}
                                        </p>
                                        {task.timeSlot && (
                                            <p className="text-xs text-surface-400">{task.timeSlot}</p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Overview */}
                <Card title="Weekly Overview" subtitle="Assignments due this week">
                    <div className="flex items-end justify-between h-40 gap-2 pt-4">
                        {weekDays.map((day, i) => (
                            <div key={day} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full flex flex-col items-center justify-end h-28">
                                    <span className="text-xs font-semibold text-surface-600 mb-1">{weekCounts[i]}</span>
                                    <div
                                        className="w-full max-w-[32px] rounded-t-lg bg-gradient-to-t from-primary-500 to-primary-300 transition-all duration-500"
                                        style={{ height: `${(weekCounts[i] / maxCount) * 100}%`, minHeight: weekCounts[i] > 0 ? '8px' : '3px' }}
                                    />
                                </div>
                                <span className="text-xs text-surface-400 font-medium">{day}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Priority Section */}
                <Card
                    title="High Priority"
                    subtitle={`${highPriority.length} items need attention`}
                    action={
                        <div className="flex items-center gap-1 text-red-500">
                            <Flag className="w-4 h-4" />
                        </div>
                    }
                >
                    <div className="space-y-3">
                        {highPriority.length === 0 ? (
                            <p className="text-sm text-surface-400 text-center py-6">No high priority items! 🎯</p>
                        ) : (
                            highPriority.map((a) => (
                                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl border border-red-100 bg-red-50/50">
                                    <Flag className={`w-4 h-4 flex-shrink-0 ${priorityColors.high}`} />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-surface-700 truncate">{a.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Calendar className="w-3 h-3 text-surface-400" />
                                            <span className="text-xs text-surface-400">
                                                Due {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                    <Badge variant={statusBadge[a.status].variant}>
                                        {statusBadge[a.status].label}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
