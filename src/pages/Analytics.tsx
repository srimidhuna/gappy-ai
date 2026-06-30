import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area,
    RadialBarChart, RadialBar,
} from 'recharts';
import {
    BarChart2, Target, Clock, BookOpen,
    AlertTriangle, CheckCircle2, Flame, Trophy,
} from 'lucide-react';
import { useAssignmentStore } from '../store/assignmentStore';
import { ProductivityInsightsCard } from '../components/ai/ProductivityInsightsCard';
import type { Assignment, AssignmentStatus } from '../types';

// ── Color palettes ──────────────────────────────────────────────────────────
const SUBJECT_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#ec4899'];
const SOURCE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e'];
const STATUS_COLORS: Record<AssignmentStatus, string> = {
    pending: '#f59e0b',
    'in-progress': '#3b82f6',
    completed: '#10b981',
    overdue: '#f43f5e',
    'needs-review': '#8b5cf6',
};

// ── Stat card ───────────────────────────────────────────────────────────────
const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    sub?: string;
    accent: string;
    bg: string;
}> = ({ icon, label, value, sub, accent, bg }) => (
    <div className={`bg-white rounded-xl border border-surface-200 p-5 shadow-sm hover:shadow-md transition-shadow`}>
        <div className="flex items-start justify-between">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <div className={accent}>{icon}</div>
            </div>
            {sub && <span className="text-xs text-surface-400 bg-surface-50 px-2 py-1 rounded-lg">{sub}</span>}
        </div>
        <p className={`text-2xl font-bold mt-3 ${accent}`}>{value}</p>
        <p className="text-xs text-surface-500 mt-0.5 font-medium">{label}</p>
    </div>
);

// ── Custom tooltip ──────────────────────────────────────────────────────────
const CustomTooltip: React.FC<{ active?: boolean; payload?: { name: string; value: number; color?: string }[]; label?: string }> = ({
    active, payload, label,
}) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-surface-200 rounded-xl shadow-lg px-3 py-2.5 text-xs">
            {label && <p className="font-semibold text-surface-700 mb-1">{label}</p>}
            {payload.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color ?? '#6366f1' }} />
                    <span className="text-surface-600">{p.name}:</span>
                    <span className="font-bold text-surface-800">{p.value}</span>
                </div>
            ))}
        </div>
    );
};

// ── Section header ──────────────────────────────────────────────────────────
const ChartSection: React.FC<{ title: string; subtitle?: string; children: React.ReactNode; className?: string }> = ({
    title, subtitle, children, className = '',
}) => (
    <div className={`bg-white rounded-xl border border-surface-200 shadow-sm p-6 ${className}`}>
        <div className="mb-4">
            <h3 className="text-sm font-semibold text-surface-800">{title}</h3>
            {subtitle && <p className="text-xs text-surface-400 mt-0.5">{subtitle}</p>}
        </div>
        {children}
    </div>
);

// ── Compute weekly productivity data ────────────────────────────────────────
const getWeeklyData = (assignments: Assignment[]) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - 6 + i);
        const key = d.toISOString().split('T')[0];
        const dayAssignments = assignments.filter((a) => a.dueDate.startsWith(key));
        return {
            day: days[d.getDay()],
            date: key,
            total: dayAssignments.length,
            completed: dayAssignments.filter((a) => a.status === 'completed').length,
            pending: dayAssignments.filter((a) => a.status === 'pending').length,
        };
    });
};

// ── Compute monthly data (last 6 months) ────────────────────────────────────
const getMonthlyData = (assignments: Assignment[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    return Array.from({ length: 6 }).map((_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        const yr = d.getFullYear();
        const mo = d.getMonth();
        const monthAssignments = assignments.filter((a) => {
            const due = new Date(a.dueDate);
            return due.getFullYear() === yr && due.getMonth() === mo;
        });
        return {
            month: months[mo],
            total: monthAssignments.length,
            completed: monthAssignments.filter((a) => a.status === 'completed').length,
            overdue: monthAssignments.filter((a) => a.status === 'overdue').length,
        };
    });
};

const Analytics: React.FC = () => {
    const { assignments } = useAssignmentStore();

    const stats = useMemo(() => {
        const total = assignments.length;
        const completed = assignments.filter((a) => a.status === 'completed').length;
        const pending = assignments.filter((a) => a.status === 'pending').length;
        const overdue = assignments.filter((a) => a.status === 'overdue').length;
        const inProgress = assignments.filter((a) => a.status === 'in-progress').length;

        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        const lateRate = total > 0 ? Math.round((overdue / total) * 100) : 0;

        // Average completion time (days from createdAt to dueDate for completed)
        const completedAssignments = assignments.filter((a) => a.status === 'completed');
        const avgDays = completedAssignments.length > 0
            ? Math.round(
                completedAssignments.reduce((acc, a) => {
                    const created = new Date(a.createdAt).getTime();
                    const due = new Date(a.dueDate).getTime();
                    return acc + (due - created) / (1000 * 60 * 60 * 24);
                }, 0) / completedAssignments.length
            )
            : 0;

        // By subject
        const subjectMap: Record<string, { total: number; completed: number; pending: number }> = {};
        assignments.forEach((a) => {
            if (!subjectMap[a.subject]) subjectMap[a.subject] = { total: 0, completed: 0, pending: 0 };
            subjectMap[a.subject].total++;
            if (a.status === 'completed') subjectMap[a.subject].completed++;
            if (a.status === 'pending') subjectMap[a.subject].pending++;
        });

        const bySubject = Object.entries(subjectMap)
            .map(([subject, d]) => ({ subject, ...d }))
            .sort((a, b) => b.total - a.total);

        const mostActive = bySubject[0]?.subject ?? 'N/A';
        const mostPending = [...bySubject].sort((a, b) => b.pending - a.pending)[0]?.subject ?? 'N/A';

        // By source
        const sourceMap: Record<string, number> = {};
        assignments.forEach((a) => {
            sourceMap[a.source] = (sourceMap[a.source] ?? 0) + 1;
        });
        const bySource = Object.entries(sourceMap)
            .map(([name, value]) => ({ name: name.replace(/-/g, ' '), value }))
            .sort((a, b) => b.value - a.value);

        // By status
        const byStatus = Object.entries(STATUS_COLORS).map(([status, color]) => ({
            name: status.replace('-', ' '),
            value: assignments.filter((a) => a.status === status).length,
            fill: color,
        }));

        return {
            total, completed, pending, overdue, inProgress,
            completionRate, lateRate, avgDays,
            bySubject, bySource, byStatus,
            mostActive, mostPending,
        };
    }, [assignments]);

    const weeklyData = useMemo(() => getWeeklyData(assignments), [assignments]);
    const monthlyData = useMemo(() => getMonthlyData(assignments), [assignments]);

    const completionRadial = [
        { name: 'Completion', value: stats.completionRate, fill: '#10b981' },
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-surface-800 flex items-center gap-2">
                    <BarChart2 className="w-7 h-7 text-primary-500" />
                    Analytics
                </h1>
                <p className="text-sm text-surface-500 mt-1">
                    Visual insights from your assignment data — track productivity and performance.
                </p>
            </div>

            {/* ── KPI stat cards ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <StatCard
                    icon={<Target className="w-5 h-5" />}
                    label="Total Assignments"
                    value={stats.total}
                    accent="text-primary-600"
                    bg="bg-primary-50"
                />
                <StatCard
                    icon={<CheckCircle2 className="w-5 h-5" />}
                    label="Completion Rate"
                    value={`${stats.completionRate}%`}
                    sub={`${stats.completed} done`}
                    accent="text-emerald-600"
                    bg="bg-emerald-50"
                />
                <StatCard
                    icon={<AlertTriangle className="w-5 h-5" />}
                    label="Late Submission Rate"
                    value={`${stats.lateRate}%`}
                    sub={`${stats.overdue} overdue`}
                    accent="text-red-600"
                    bg="bg-red-50"
                />
                <StatCard
                    icon={<Clock className="w-5 h-5" />}
                    label="Avg. Completion Time"
                    value={`${stats.avgDays}d`}
                    sub="from creation"
                    accent="text-blue-600"
                    bg="bg-blue-50"
                />
                <StatCard
                    icon={<Trophy className="w-5 h-5" />}
                    label="In Progress"
                    value={stats.inProgress}
                    accent="text-violet-600"
                    bg="bg-violet-50"
                />
            </div>

            {/* ── Highlight cards ────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-primary-500 to-violet-600 rounded-xl p-5 text-white shadow-md">
                    <div className="flex items-center gap-2 mb-3">
                        <Flame className="w-5 h-5 text-yellow-300" />
                        <span className="text-xs font-semibold uppercase tracking-wide text-primary-100">Most Active Subject</span>
                    </div>
                    <p className="text-xl font-bold">{stats.mostActive}</p>
                    <p className="text-xs text-primary-200 mt-1">
                        {stats.bySubject.find((s) => s.subject === stats.mostActive)?.total ?? 0} assignments total
                    </p>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-red-500 rounded-xl p-5 text-white shadow-md">
                    <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-5 h-5 text-yellow-200" />
                        <span className="text-xs font-semibold uppercase tracking-wide text-amber-100">Most Pending Subject</span>
                    </div>
                    <p className="text-xl font-bold">{stats.mostPending}</p>
                    <p className="text-xs text-amber-200 mt-1">
                        {stats.bySubject.find((s) => s.subject === stats.mostPending)?.pending ?? 0} assignments pending
                    </p>
                </div>
            </div>

            {/* ── Row 1: by subject + by source ─────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Assignments by Subject — bar chart */}
                <ChartSection
                    title="Assignments by Subject"
                    subtitle="Total, completed, and pending per subject"
                    className="lg:col-span-3"
                >
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={stats.bySubject} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis
                                dataKey="subject"
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                tickFormatter={(v) => v.split(' ')[0]}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="total" name="Total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartSection>

                {/* Assignments by Source — donut */}
                <ChartSection
                    title="By Source"
                    subtitle="Where assignments come from"
                    className="lg:col-span-2"
                >
                    <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie
                                data={stats.bySource}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                innerRadius={48}
                                paddingAngle={3}
                                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                    const angle = midAngle || 0;
                                    const x = cx + radius * Math.cos(-angle * Math.PI / 180);
                                    const y = cy + radius * Math.sin(-angle * Math.PI / 180);
                                    const p = percent || 0;
                                    if (p < 0.05) return null;
                                    return (
                                        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-medium">
                                            {`${(p * 100).toFixed(0)}%`}
                                        </text>
                                    );
                                }}
                                labelLine={false}
                            >
                                {stats.bySource.map((_, idx) => (
                                    <Cell key={idx} fill={SOURCE_COLORS[idx % SOURCE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartSection>
            </div>

            {/* ── Row 2: Weekly + Status distribution ────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Weekly productivity area chart */}
                <ChartSection
                    title="Weekly Productivity"
                    subtitle="Assignments due in the last 7 days"
                    className="lg:col-span-3"
                >
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={weeklyData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                            <defs>
                                <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Area type="monotone" dataKey="total" name="Total" stroke="#6366f1" fill="url(#totalGrad)" strokeWidth={2} dot={{ r: 3, fill: '#6366f1' }} />
                            <Area type="monotone" dataKey="completed" name="Completed" stroke="#10b981" fill="url(#completedGrad)" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartSection>

                {/* Status distribution — radial bar + completion rate */}
                <ChartSection
                    title="Status Distribution"
                    subtitle="Breakdown by current status"
                    className="lg:col-span-2"
                >
                    <div className="space-y-2">
                        {stats.byStatus.map((s) => {
                            const pct = stats.total > 0 ? Math.round((s.value / stats.total) * 100) : 0;
                            return (
                                <div key={s.name} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium text-surface-600 capitalize">{s.name}</span>
                                        <span className="font-bold" style={{ color: s.fill }}>{s.value} ({pct}%)</span>
                                    </div>
                                    <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${pct}%`, backgroundColor: s.fill }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Completion Rate radial */}
                    <div className="mt-4 flex justify-center">
                        <div className="relative">
                            <ResponsiveContainer width={120} height={120}>
                                <RadialBarChart
                                    innerRadius="60%"
                                    outerRadius="90%"
                                    data={completionRadial}
                                    startAngle={90}
                                    endAngle={90 - 360 * (stats.completionRate / 100)}
                                >
                                    <RadialBar dataKey="value" cornerRadius={8} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-lg font-bold text-emerald-600">{stats.completionRate}%</span>
                                <span className="text-[10px] text-surface-400">done</span>
                            </div>
                        </div>
                    </div>
                </ChartSection>
            </div>

            {/* ── Row 3: Monthly productivity ─────────────────────────────────── */}
            <ChartSection
                title="Monthly Productivity"
                subtitle="Assignment volume over the last 6 months"
            >
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={monthlyData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="total" name="Total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="overdue" name="Overdue" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartSection>

            {/* ── Row 4: AI Productivity Insights ──────────────────────────── */}
            <ProductivityInsightsCard />

            {/* ── Row 5: Subject detail table ────────────────────────────────── */}
            <ChartSection
                title="Subject Breakdown"
                subtitle="Detailed stats per subject"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-surface-100">
                                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wide pb-3">Subject</th>
                                <th className="text-center text-xs font-semibold text-surface-500 uppercase tracking-wide pb-3">Total</th>
                                <th className="text-center text-xs font-semibold text-surface-500 uppercase tracking-wide pb-3">Completed</th>
                                <th className="text-center text-xs font-semibold text-surface-500 uppercase tracking-wide pb-3">Pending</th>
                                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wide pb-3">Progress</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-50">
                            {stats.bySubject.map((s, idx) => {
                                const rate = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
                                return (
                                    <tr key={s.subject} className="hover:bg-surface-50 transition-colors">
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: SUBJECT_COLORS[idx % SUBJECT_COLORS.length] }}
                                                />
                                                <span className="font-medium text-surface-700">{s.subject}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 text-center font-bold text-surface-700">{s.total}</td>
                                        <td className="py-3 text-center text-emerald-600 font-semibold">{s.completed}</td>
                                        <td className="py-3 text-center text-amber-600 font-semibold">{s.pending}</td>
                                        <td className="py-3 pr-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${rate}%`,
                                                            backgroundColor: SUBJECT_COLORS[idx % SUBJECT_COLORS.length],
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs font-semibold text-surface-500 w-8 text-right">{rate}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </ChartSection>
        </div>
    );
};

export default Analytics;
