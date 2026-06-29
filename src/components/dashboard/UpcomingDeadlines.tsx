import React from 'react';
import { Calendar, Flag, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge';
import type { Assignment, AssignmentStatus, AssignmentPriority } from '../../types';
import { useNavigate } from 'react-router-dom';

interface UpcomingDeadlinesProps {
    assignments: Assignment[];
    isLoading?: boolean;
}

const statusConfig: Record<AssignmentStatus, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary'; label: string }> = {
    pending: { variant: 'warning', label: 'Pending' },
    'in-progress': { variant: 'info', label: 'In Progress' },
    completed: { variant: 'success', label: 'Completed' },
    overdue: { variant: 'danger', label: 'Overdue' },
    'needs-review': { variant: 'primary', label: 'Needs Review' },
};

const priorityBorderColor: Record<AssignmentPriority, string> = {
    high: 'bg-red-400',
    medium: 'bg-amber-400',
    low: 'bg-emerald-400',
};

const priorityIconColor: Record<AssignmentPriority, string> = {
    high: 'text-red-500',
    medium: 'text-amber-500',
    low: 'text-emerald-500',
};

const formatDueDate = (dateStr: string): { text: string; isOverdue: boolean; isSoon: boolean } => {
    const due = new Date(dateStr);
    const now = new Date();
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, isOverdue: true, isSoon: false };
    if (diffDays === 0) return { text: 'Due today', isOverdue: false, isSoon: true };
    if (diffDays === 1) return { text: 'Due tomorrow', isOverdue: false, isSoon: true };
    return {
        text: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isOverdue: false,
        isSoon: diffDays <= 3,
    };
};

const SkeletonRow: React.FC = () => (
    <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 animate-pulse">
        <div className="flex items-center gap-3 flex-1">
            <div className="w-1 h-10 rounded-full bg-surface-200" />
            <div className="space-y-1.5 flex-1">
                <div className="h-3.5 w-40 bg-surface-200 rounded" />
                <div className="h-3 w-20 bg-surface-100 rounded" />
            </div>
        </div>
        <div className="flex items-center gap-3">
            <div className="h-3 w-16 bg-surface-100 rounded" />
            <div className="h-5 w-16 bg-surface-100 rounded-full" />
        </div>
    </div>
);

const EmptyUpcoming: React.FC = () => (
    <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
            <Calendar className="w-7 h-7 text-emerald-400" />
        </div>
        <p className="text-sm font-medium text-surface-600">All caught up!</p>
        <p className="text-xs text-surface-400 mt-1">No upcoming deadlines at the moment.</p>
    </div>
);

export const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({ assignments, isLoading }) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-3">
            {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : assignments.length === 0 ? (
                <EmptyUpcoming />
            ) : (
                assignments.map((a) => {
                    const due = formatDueDate(a.dueDate);
                    return (
                        <div
                            key={a.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-surface-50 hover:bg-surface-100 transition-colors cursor-pointer group"
                            onClick={() => navigate('/assignments')}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-1 h-10 rounded-full flex-shrink-0 ${priorityBorderColor[a.priority]}`} />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-surface-700 truncate group-hover:text-primary-600 transition-colors">
                                        {a.title}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Flag className={`w-3 h-3 ${priorityIconColor[a.priority]}`} />
                                        <span className="text-xs text-surface-400">{a.subject}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                                <div className="text-right hidden sm:block">
                                    <p className={`text-xs font-medium ${due.isOverdue ? 'text-red-500' : due.isSoon ? 'text-amber-600' : 'text-surface-500'}`}>
                                        {due.text}
                                    </p>
                                    <p className="text-xs text-surface-400 capitalize mt-0.5">{a.priority} priority</p>
                                </div>
                                <Badge variant={statusConfig[a.status].variant} dot>
                                    {statusConfig[a.status].label}
                                </Badge>
                                <ArrowRight className="w-3.5 h-3.5 text-surface-300 group-hover:text-primary-400 transition-colors hidden sm:block" />
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};
