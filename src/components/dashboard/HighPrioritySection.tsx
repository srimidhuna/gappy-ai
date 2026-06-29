import React from 'react';
import { Flag, Calendar, AlertTriangle } from 'lucide-react';
import { Badge } from '../common/Badge';
import type { Assignment, AssignmentStatus } from '../../types';

interface HighPrioritySectionProps {
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

const SkeletonItem: React.FC = () => (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-surface-100 animate-pulse">
        <div className="w-4 h-4 bg-surface-100 rounded flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-44 bg-surface-100 rounded" />
            <div className="h-3 w-24 bg-surface-50 rounded" />
        </div>
        <div className="h-5 w-16 bg-surface-100 rounded-full" />
    </div>
);

const EmptyHighPriority: React.FC = () => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
            <Flag className="w-6 h-6 text-emerald-400" />
        </div>
        <p className="text-sm font-medium text-surface-600">All clear!</p>
        <p className="text-xs text-surface-400 mt-1">No high priority items needing attention.</p>
    </div>
);

export const HighPrioritySection: React.FC<HighPrioritySectionProps> = ({ assignments, isLoading }) => {
    if (isLoading) {
        return (
            <div className="space-y-2.5">
                {Array.from({ length: 3 }).map((_, i) => <SkeletonItem key={i} />)}
            </div>
        );
    }

    if (assignments.length === 0) return <EmptyHighPriority />;

    return (
        <div className="space-y-2.5">
            {assignments.map((a) => {
                const isOverdue = a.status === 'overdue';
                const dueDate = new Date(a.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                });

                return (
                    <div
                        key={a.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                            isOverdue
                                ? 'border-red-200 bg-red-50/60'
                                : 'border-red-100 bg-red-50/30 hover:bg-red-50/60'
                        }`}
                    >
                        <div className="flex-shrink-0">
                            {isOverdue ? (
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                            ) : (
                                <Flag className="w-4 h-4 text-red-400" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-surface-700 truncate">{a.title}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <Calendar className="w-3 h-3 text-surface-400" />
                                <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-surface-400'}`}>
                                    {isOverdue ? `Overdue since ${dueDate}` : `Due ${dueDate}`}
                                </span>
                                <span className="text-xs text-surface-300">·</span>
                                <span className="text-xs text-surface-400 truncate">{a.subject}</span>
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            <Badge variant={statusConfig[a.status].variant}>
                                {statusConfig[a.status].label}
                            </Badge>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
