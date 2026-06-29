import React, { useState } from 'react';
import { ChevronDown, Calendar, BookOpen, Flag, Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from '../common/Badge';
import { useAssignmentStore } from '../../store/assignmentStore';
import type { Assignment, AssignmentStatus, AssignmentPriority } from '../../types';

interface StudyTaskCardProps {
    assignment: Assignment;
}

const priorityConfig: Record<AssignmentPriority, { color: string; bg: string; label: string }> = {
    high: { color: 'text-red-600', bg: 'bg-red-50', label: 'High' },
    medium: { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Medium' },
    low: { color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Low' },
};

const statusConfig: Record<AssignmentStatus, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary'; label: string }> = {
    pending: { variant: 'warning', label: 'Pending' },
    'in-progress': { variant: 'info', label: 'In Progress' },
    completed: { variant: 'success', label: 'Completed' },
    overdue: { variant: 'danger', label: 'Overdue' },
    'needs-review': { variant: 'primary', label: 'Needs Review' },
};

// Status options for the dropdown (student-facing labels)
const statusOptions: { value: AssignmentStatus; label: string }[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'overdue', label: 'Overdue' },
];

const estimatedTime: Record<AssignmentPriority, string> = {
    high: '3h',
    medium: '2h',
    low: '1h',
};

const priorityBarColor: Record<AssignmentPriority, string> = {
    high: 'bg-red-400',
    medium: 'bg-amber-400',
    low: 'bg-emerald-400',
};

export const StudyTaskCard: React.FC<StudyTaskCardProps> = ({ assignment }) => {
    const { updateAssignment } = useAssignmentStore();
    const [showStatusMenu, setShowStatusMenu] = useState(false);

    const priority = priorityConfig[assignment.priority];
    const status = statusConfig[assignment.status];
    const isCompleted = assignment.status === 'completed';

    const handleStatusChange = (newStatus: AssignmentStatus) => {
        updateAssignment(assignment.id, { status: newStatus });
        setShowStatusMenu(false);
    };

    const formattedDue = new Date(assignment.dueDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });

    return (
        <div
            className={`relative bg-white rounded-xl border transition-all duration-200 hover:shadow-md group overflow-hidden ${
                isCompleted ? 'border-emerald-100 opacity-75' : 'border-surface-200'
            }`}
        >
            {/* Priority indicator bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${priorityBarColor[assignment.priority]}`} />

            <div className="pl-4 pr-4 py-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        {/* Title */}
                        <p className={`text-sm font-semibold truncate ${isCompleted ? 'text-surface-400 line-through' : 'text-surface-800'}`}>
                            {assignment.title}
                        </p>

                        {/* Subject */}
                        <div className="flex items-center gap-1.5 mt-1">
                            <BookOpen className="w-3 h-3 text-surface-400 flex-shrink-0" />
                            <span className="text-xs text-surface-500 truncate">{assignment.subject}</span>
                        </div>
                    </div>

                    {/* Status dropdown */}
                    <div className="relative flex-shrink-0">
                        <button
                            onClick={() => setShowStatusMenu(!showStatusMenu)}
                            className="flex items-center gap-1 cursor-pointer"
                            title="Change status"
                        >
                            <Badge variant={status.variant} dot>
                                {status.label}
                            </Badge>
                            <ChevronDown className="w-3 h-3 text-surface-400" />
                        </button>

                        {showStatusMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowStatusMenu(false)}
                                />
                                <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-surface-200 rounded-xl shadow-lg py-1 min-w-[130px]">
                                    {statusOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => handleStatusChange(opt.value)}
                                            className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-surface-50 transition-colors flex items-center gap-2 ${
                                                assignment.status === opt.value ? 'text-primary-600 bg-primary-50' : 'text-surface-600'
                                            }`}
                                        >
                                            {assignment.status === opt.value && (
                                                <CheckCircle2 className="w-3 h-3 text-primary-500" />
                                            )}
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Meta row */}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                    {/* Due date */}
                    <div className="flex items-center gap-1 text-xs text-surface-500">
                        <Calendar className="w-3 h-3" />
                        <span>{formattedDue}</span>
                    </div>

                    {/* Est. study time */}
                    <div className="flex items-center gap-1 text-xs text-surface-500">
                        <Clock className="w-3 h-3" />
                        <span>~{estimatedTime[assignment.priority]} est.</span>
                    </div>

                    {/* Priority */}
                    <div className={`flex items-center gap-1 text-xs font-medium ${priority.color}`}>
                        <Flag className="w-3 h-3" />
                        <span>{priority.label}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
