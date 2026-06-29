import React from 'react';
import { X, Calendar, BookOpen, Flag, Tag, FileText, Clock, AlertCircle } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Badge } from '../common/Badge';
import type { Assignment, AssignmentStatus, AssignmentPriority, AssignmentSource } from '../../types';

interface AssignmentDrawerProps {
    assignment: Assignment | null;
    isOpen: boolean;
    onClose: () => void;
}

const statusConfig: Record<AssignmentStatus, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary'; label: string }> = {
    pending: { variant: 'warning', label: 'Pending' },
    'in-progress': { variant: 'info', label: 'In Progress' },
    completed: { variant: 'success', label: 'Completed' },
    overdue: { variant: 'danger', label: 'Overdue' },
    'needs-review': { variant: 'primary', label: 'Needs Review' },
};

const priorityConfig: Record<AssignmentPriority, { color: string; bg: string; label: string }> = {
    high: { color: 'text-red-600', bg: 'bg-red-50 border-red-100', label: 'High Priority' },
    medium: { color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', label: 'Medium Priority' },
    low: { color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', label: 'Low Priority' },
};

const sourceLabels: Record<AssignmentSource, string> = {
    whatsapp: 'WhatsApp',
    email: 'Email',
    'google-classroom': 'Google Classroom',
    notes: 'Notes',
    manual: 'Manual',
    'college-portal': 'College Portal',
    lab: 'Lab',
    project: 'Project',
};

const DetailRow: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 py-3 border-b border-surface-100 last:border-0">
        <div className="w-4 h-4 mt-0.5 text-surface-400 flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-0.5">{label}</p>
            <div className="text-sm text-surface-700">{value}</div>
        </div>
    </div>
);

export const AssignmentDrawer: React.FC<AssignmentDrawerProps> = ({ assignment, isOpen, onClose }) => {
    // Close on Escape key
    React.useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
                onClick={onClose}
            />

            {/* Drawer panel */}
            <div
                className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full"
                style={{ animation: 'slideInRight 0.25s ease-out' }}
            >
                {/* Header */}
                <div className="flex items-start justify-between px-6 py-5 border-b border-surface-100 bg-gradient-to-r from-primary-50 to-white">
                    <div className="flex-1 min-w-0 pr-4">
                        <p className="text-xs font-medium text-primary-500 uppercase tracking-wider mb-1">Assignment Details</p>
                        <h2 className="text-lg font-bold text-surface-800 leading-tight">
                            {assignment?.title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-surface-400 hover:text-surface-600 hover:bg-white transition-colors flex-shrink-0 cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Status + Priority badges */}
                {assignment && (
                    <div className="px-6 py-3 flex items-center gap-2 border-b border-surface-100 flex-wrap">
                        <Badge variant={statusConfig[assignment.status].variant} dot>
                            {statusConfig[assignment.status].label}
                        </Badge>
                        <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityConfig[assignment.priority].bg} ${priorityConfig[assignment.priority].color}`}
                        >
                            <Flag className="w-3 h-3" />
                            {priorityConfig[assignment.priority].label}
                        </span>
                    </div>
                )}

                {/* Details */}
                <div className="flex-1 overflow-y-auto px-6 py-2">
                    {assignment && (
                        <div>
                            <DetailRow
                                icon={<BookOpen className="w-4 h-4" />}
                                label="Subject"
                                value={<span className="font-medium">{assignment.subject}</span>}
                            />
                            <DetailRow
                                icon={<AlertCircle className="w-4 h-4" />}
                                label="Priority"
                                value={
                                    <span className={`font-semibold capitalize ${priorityConfig[assignment.priority].color}`}>
                                        {assignment.priority}
                                    </span>
                                }
                            />
                            <DetailRow
                                icon={<Calendar className="w-4 h-4" />}
                                label="Due Date"
                                value={
                                    <span className={assignment.status === 'overdue' ? 'text-red-600 font-semibold' : ''}>
                                        {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                        <span className="text-xs text-surface-400 ml-2">
                                            {new Date(assignment.dueDate).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </span>
                                }
                            />
                            <DetailRow
                                icon={<Tag className="w-4 h-4" />}
                                label="Source"
                                value={sourceLabels[assignment.source]}
                            />
                            <DetailRow
                                icon={<FileText className="w-4 h-4" />}
                                label="Notes / Description"
                                value={
                                    <p className="text-sm text-surface-600 leading-relaxed whitespace-pre-wrap">
                                        {assignment.description || 'No notes provided.'}
                                    </p>
                                }
                            />
                            <DetailRow
                                icon={<Clock className="w-4 h-4" />}
                                label="Created Date"
                                value={new Date(assignment.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-surface-100 bg-surface-50">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-surface-600 hover:bg-white transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>,
        document.body
    );
};
