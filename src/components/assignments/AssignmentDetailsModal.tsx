import React from 'react';
import { Calendar, BookOpen, MessageSquare, Mail, FileText, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import type { Assignment, AssignmentSource, AssignmentStatus } from '../../types';

interface AssignmentDetailsModalProps {
    assignment: Assignment | null;
    isOpen: boolean;
    onClose: () => void;
}

const statusBadge: Record<AssignmentStatus, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary'; label: string }> = {
    pending: { variant: 'warning', label: 'Pending' },
    'in-progress': { variant: 'info', label: 'In Progress' },
    completed: { variant: 'success', label: 'Completed' },
    overdue: { variant: 'danger', label: 'Overdue' },
    'needs-review': { variant: 'primary', label: 'Needs Review' },
    archived: { variant: 'default', label: 'Archived' },
};

const sourceIcons: Record<AssignmentSource, React.ReactNode> = {
    whatsapp: <MessageSquare className="w-4 h-4 text-emerald-500" />,
    email: <Mail className="w-3 h-3" />,
    'google-classroom': <BookOpen className="w-3 h-3" />,
    notes: <FileText className="w-3 h-3" />,
    manual: <FileText className="w-3 h-3" />,
    'college-portal': <BookOpen className="w-3 h-3" />,
    lab: <FileText className="w-3 h-3" />,
    project: <FileText className="w-3 h-3" />,
};

export const AssignmentDetailsModal: React.FC<AssignmentDetailsModalProps> = ({ assignment, isOpen, onClose }) => {
    if (!assignment) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Assignment Details" size="md">
            <div className="space-y-6">
                {/* Header Information */}
                <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <h2 className="text-xl font-bold text-surface-800">{assignment.title}</h2>
                        <Badge variant={statusBadge[assignment.status].variant}>
                            {statusBadge[assignment.status].label}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-surface-500">
                        <span className="flex items-center gap-1.5 font-medium text-surface-600">
                            <BookOpen className="w-4 h-4" /> {assignment.subject}
                        </span>
                        <span className="flex items-center gap-1.5 capitalize">
                            {sourceIcons[assignment.source]} {assignment.source.replace('-', ' ')}
                        </span>
                    </div>
                </div>

                {/* Deadlines & Priority */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface-50 rounded-xl p-4 border border-surface-100 flex items-center gap-3">
                        <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-surface-400 font-medium tracking-wide uppercase">Due Date</p>
                            <p className="text-sm font-semibold text-surface-800 mt-0.5">
                                {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'No date set'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-surface-50 rounded-xl p-4 border border-surface-100 flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${assignment.priority === 'high' ? 'bg-red-100 text-red-600' :
                            assignment.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                                'bg-emerald-100 text-emerald-600'
                            }`}>
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-surface-400 font-medium tracking-wide uppercase">Priority</p>
                            <p className="text-sm font-semibold text-surface-800 mt-0.5 capitalize">
                                {assignment.priority}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <h3 className="text-sm font-semibold text-surface-800 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-surface-400" /> Description
                    </h3>
                    <div className="bg-white rounded-xl p-4 border border-surface-200">
                        <p className="text-sm text-surface-600 leading-relaxed whitespace-pre-wrap">
                            {assignment.description || 'No description provided.'}
                        </p>
                    </div>
                </div>

                <div className="pt-4 border-t border-surface-100 flex justify-end gap-3">
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
