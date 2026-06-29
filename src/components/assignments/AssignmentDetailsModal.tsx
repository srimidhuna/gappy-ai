import React, { useState } from 'react';
import { Calendar, BookOpen, MessageSquare, Mail, FileText, AlertCircle, Clock, User, ExternalLink, Brain, CheckCircle, Edit, Sparkles, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useAssignmentStore } from '../../store/assignmentStore';
import { useUIStore } from '../../store/uiStore';
import { generateSummary } from '../../services/aiService';
import type { Assignment, AssignmentSource, AssignmentStatus, AssignmentPriority } from '../../types';

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

function getDaysLeft(dueDate: string | undefined): { label: string; color: string; bgColor: string } {
    if (!dueDate) return { label: 'No deadline', color: 'text-surface-400', bgColor: 'bg-surface-50' };
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { label: 'Overdue', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200' };
    if (diff === 0) return { label: 'Due Today', color: 'text-amber-600', bgColor: 'bg-amber-50 border-amber-200' };
    return { label: `${diff} Day${diff !== 1 ? 's' : ''} Left`, color: 'text-emerald-600', bgColor: 'bg-emerald-50 border-emerald-200' };
}

export const AssignmentDetailsModal: React.FC<AssignmentDetailsModalProps> = ({ assignment, isOpen, onClose }) => {
    const { updateAssignment } = useAssignmentStore();
    const { addToast } = useUIStore();

    const [isEditing, setIsEditing] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [editForm, setEditForm] = useState<{
        title: string;
        subject: string;
        description: string;
        dueDate: string;
        priority: AssignmentPriority;
    }>({ title: '', subject: '', description: '', dueDate: '', priority: 'medium' });

    if (!assignment) return null;

    const daysLeft = getDaysLeft(assignment.dueDate);

    const priorityStyles: Record<string, string> = {
        high: 'bg-red-100 text-red-700 border-red-200',
        medium: 'bg-orange-100 text-orange-700 border-orange-200',
        low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };

    const priorityIconStyles: Record<string, string> = {
        high: 'bg-red-100 text-red-600',
        medium: 'bg-orange-100 text-orange-600',
        low: 'bg-emerald-100 text-emerald-600',
    };

    // ── Mark Complete ──────────────────────────────────────────────────
    const handleMarkComplete = () => {
        updateAssignment(assignment.id, { status: 'completed' });
        addToast({ type: 'success', message: `"${assignment.title}" marked as completed!` });
        onClose();
    };

    // ── Generate Study Plan (AI Summary) ──────────────────────────────
    const handleGenerateStudyPlan = async () => {
        setIsGenerating(true);
        try {
            const result = await generateSummary({
                title: assignment.title,
                subject: assignment.subject,
                description: assignment.description,
                dueDate: assignment.dueDate,
                priority: assignment.priority,
                professor: assignment.professor,
            });
            updateAssignment(assignment.id, {
                summary: result.summary,
                estimatedHours: result.estimatedHours,
            });
            addToast({ type: 'success', message: 'Study plan generated successfully!' });
        } catch (error) {
            console.error('Study plan generation failed:', error);
            addToast({ type: 'error', message: 'Failed to generate study plan. Is the AI backend running?' });
        } finally {
            setIsGenerating(false);
        }
    };

    // ── Edit Assignment ───────────────────────────────────────────────
    const startEditing = () => {
        setEditForm({
            title: assignment.title,
            subject: assignment.subject,
            description: assignment.description || '',
            dueDate: assignment.dueDate ? assignment.dueDate.slice(0, 16) : '',
            priority: assignment.priority,
        });
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        updateAssignment(assignment.id, {
            title: editForm.title,
            subject: editForm.subject,
            description: editForm.description,
            dueDate: editForm.dueDate ? new Date(editForm.dueDate).toISOString() : assignment.dueDate,
            priority: editForm.priority,
        });
        setIsEditing(false);
        addToast({ type: 'success', message: 'Assignment updated successfully!' });
        onClose();
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    // ── EDIT MODE ─────────────────────────────────────────────────────
    if (isEditing) {
        return (
            <Modal isOpen={isOpen} onClose={() => { setIsEditing(false); onClose(); }} title="Edit Assignment" size="lg">
                <div className="space-y-4">
                    <Input
                        label="Title"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Subject"
                            value={editForm.subject}
                            onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                        />
                        <Input
                            label="Due Date"
                            type="datetime-local"
                            value={editForm.dueDate}
                            onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">Description</label>
                        <textarea
                            className="w-full rounded-lg border border-surface-300 bg-white p-3 text-sm text-surface-700 placeholder-surface-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 h-24"
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">Priority</label>
                        <select
                            className="w-full px-3 py-2.5 rounded-lg border border-surface-300 text-sm text-surface-600 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={editForm.priority}
                            onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as AssignmentPriority })}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" onClick={handleCancelEdit}>Cancel</Button>
                        <Button onClick={handleSaveEdit}>Save Changes</Button>
                    </div>
                </div>
            </Modal>
        );
    }

    // ── VIEW MODE (default) ───────────────────────────────────────────
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Assignment Details" size="lg">
            <div className="space-y-6">
                {/* Header Information */}
                <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <h2 className="text-xl font-bold text-surface-800">{assignment.title}</h2>
                        <Badge variant={statusBadge[assignment.status]?.variant || 'default'}>
                            {statusBadge[assignment.status]?.label || assignment.status}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-surface-500">
                        <span className="flex items-center gap-1.5 font-medium text-surface-600">
                            <BookOpen className="w-4 h-4" /> {assignment.subject || 'Not available'}
                        </span>
                        <span className="flex items-center gap-1.5 capitalize">
                            {sourceIcons[assignment.source]} {(assignment.source || 'unknown').replace('-', ' ')}
                        </span>
                    </div>
                </div>

                {/* Due Date, Days Left & Priority Cards */}
                <div className="grid grid-cols-3 gap-3">
                    {/* Due Date */}
                    <div className="bg-surface-50 rounded-xl p-4 border border-surface-100 flex items-center gap-3">
                        <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-surface-400 font-medium tracking-wide uppercase">Due Date</p>
                            <p className="text-sm font-semibold text-surface-800 mt-0.5">
                                {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'No date set'}
                            </p>
                            {assignment.dueTime && (
                                <p className="text-xs text-surface-400 mt-0.5 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {assignment.dueTime}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Days Left */}
                    <div className={`rounded-xl p-4 border flex items-center gap-3 ${daysLeft.bgColor}`}>
                        <div className={`p-2 rounded-lg ${daysLeft.color === 'text-red-600' ? 'bg-red-100 text-red-600' : daysLeft.color === 'text-amber-600' ? 'bg-amber-100 text-amber-600' : daysLeft.color === 'text-emerald-600' ? 'bg-emerald-100 text-emerald-600' : 'bg-surface-100 text-surface-400'}`}>
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-surface-400 font-medium tracking-wide uppercase">Deadline</p>
                            <p className={`text-sm font-bold mt-0.5 ${daysLeft.color}`}>{daysLeft.label}</p>
                        </div>
                    </div>

                    {/* Priority */}
                    <div className="bg-surface-50 rounded-xl p-4 border border-surface-100 flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${priorityIconStyles[assignment.priority] || 'bg-surface-100 text-surface-500'}`}>
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-surface-400 font-medium tracking-wide uppercase">Priority</p>
                            <span className={`inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${priorityStyles[assignment.priority] || 'bg-surface-100 text-surface-600 border-surface-200'}`}>
                                {(assignment.priority || 'medium').toUpperCase()}
                            </span>
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

                {/* AI Summary */}
                <div>
                    <h3 className="text-sm font-semibold text-surface-800 mb-2 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-violet-500" /> AI Summary
                    </h3>
                    <div className="bg-violet-50 rounded-xl p-4 border border-violet-200">
                        <p className="text-sm text-violet-700 leading-relaxed">
                            {assignment.summary || 'AI summary not generated yet.'}
                        </p>
                        {assignment.estimatedHours && (
                            <p className="text-xs text-violet-500 mt-2 font-medium">
                                ⏱️ Estimated study time: {assignment.estimatedHours} hour{assignment.estimatedHours !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                </div>

                {/* Professor & Submission */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Professor */}
                    <div>
                        <h3 className="text-sm font-semibold text-surface-800 mb-2 flex items-center gap-2">
                            <User className="w-4 h-4 text-surface-400" /> Professor
                        </h3>
                        <div className="bg-white rounded-xl p-4 border border-surface-200">
                            <p className="text-sm text-surface-600">
                                {assignment.professor || 'Not specified'}
                            </p>
                        </div>
                    </div>

                    {/* Submission */}
                    <div>
                        <h3 className="text-sm font-semibold text-surface-800 mb-2 flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 text-surface-400" /> Submission
                        </h3>
                        <div className="bg-white rounded-xl p-4 border border-surface-200 space-y-2">
                            <p className="text-sm text-surface-600 capitalize">
                                {assignment.submissionMode || 'Not specified'}
                            </p>
                            {assignment.submissionLink && (
                                <a
                                    href={assignment.submissionLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" /> Open Assignment
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notes (only if present) */}
                {assignment.notes && (
                    <div>
                        <h3 className="text-sm font-semibold text-surface-800 mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-surface-400" /> Notes
                        </h3>
                        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                            <p className="text-sm text-amber-800 leading-relaxed whitespace-pre-wrap">
                                {assignment.notes}
                            </p>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 border-t border-surface-100 flex flex-wrap justify-end gap-3">
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                    <Button
                        variant="secondary"
                        icon={<Edit className="w-4 h-4" />}
                        onClick={startEditing}
                    >
                        Edit Assignment
                    </Button>
                    <Button
                        variant="secondary"
                        icon={isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        onClick={handleGenerateStudyPlan}
                        disabled={isGenerating}
                    >
                        {isGenerating ? 'Generating...' : 'Generate Study Plan'}
                    </Button>
                    <Button
                        icon={<CheckCircle className="w-4 h-4" />}
                        onClick={handleMarkComplete}
                    >
                        Mark Complete
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
