import React from 'react';
import type { Assignment, AssignmentStatus } from '../../types';

interface CalendarCellProps {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    assignments: Assignment[];
    onAssignmentClick: (a: Assignment) => void;
}

const statusDotColor: Record<AssignmentStatus, string> = {
    completed: 'bg-emerald-500',
    'in-progress': 'bg-blue-500',
    pending: 'bg-amber-400',
    overdue: 'bg-red-500',
    'needs-review': 'bg-violet-400',
};

const statusChipColor: Record<AssignmentStatus, string> = {
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    'in-progress': 'border-blue-200 bg-blue-50 text-blue-700',
    pending: 'border-amber-200 bg-amber-50 text-amber-700',
    overdue: 'border-red-200 bg-red-50 text-red-700',
    'needs-review': 'border-violet-200 bg-violet-50 text-violet-700',
};

export const CalendarCell: React.FC<CalendarCellProps> = ({
    date,
    isCurrentMonth,
    isToday,
    assignments,
    onAssignmentClick,
}) => {
    const MAX_VISIBLE = 2;
    const visible = assignments.slice(0, MAX_VISIBLE);
    const overflow = assignments.length - MAX_VISIBLE;

    return (
        <div
            className={`min-h-[100px] p-1.5 border-b border-r border-surface-100 transition-colors ${
                !isCurrentMonth ? 'bg-surface-50/50' : 'bg-white hover:bg-surface-50/30'
            }`}
        >
            {/* Date number */}
            <div className="flex justify-end mb-1">
                <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                        isToday
                            ? 'bg-primary-500 text-white'
                            : isCurrentMonth
                            ? 'text-surface-700'
                            : 'text-surface-300'
                    }`}
                >
                    {date.getDate()}
                </span>
            </div>

            {/* Assignment chips */}
            <div className="space-y-0.5">
                {visible.map((a) => (
                    <button
                        key={a.id}
                        onClick={() => onAssignmentClick(a)}
                        title={a.title}
                        className={`w-full text-left flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors cursor-pointer truncate ${statusChipColor[a.status]}`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDotColor[a.status]}`} />
                        <span className="truncate">{a.title}</span>
                    </button>
                ))}
                {overflow > 0 && (
                    <p className="text-[10px] font-medium text-surface-400 px-1.5">
                        +{overflow} more
                    </p>
                )}
            </div>
        </div>
    );
};
