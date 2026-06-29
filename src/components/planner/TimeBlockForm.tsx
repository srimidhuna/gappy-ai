import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { usePlannerStore } from '../../store/plannerStore';
import { useUIStore } from '../../store/uiStore';
import type { StudyBlock } from '../../types';

const SUBJECT_OPTIONS = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'English',
    'History',
    'Philosophy',
    'Other',
];

const COLOR_OPTIONS = [
    { label: 'Blue', value: '#3b82f6' },
    { label: 'Violet', value: '#8b5cf6' },
    { label: 'Emerald', value: '#10b981' },
    { label: 'Amber', value: '#f59e0b' },
    { label: 'Rose', value: '#f43f5e' },
    { label: 'Cyan', value: '#06b6d4' },
    { label: 'Orange', value: '#f97316' },
    { label: 'Indigo', value: '#6366f1' },
];

interface TimeBlockFormProps {
    editBlock?: StudyBlock | null;
    onClose: () => void;
}

// Check if two time ranges overlap
const timeToMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
};

const hasOverlap = (
    blocks: StudyBlock[],
    startTime: string,
    endTime: string,
    excludeId?: string
): boolean => {
    const newStart = timeToMinutes(startTime);
    const newEnd = timeToMinutes(endTime);
    return blocks.some((b) => {
        if (b.id === excludeId) return false;
        const bStart = timeToMinutes(b.startTime);
        const bEnd = timeToMinutes(b.endTime);
        return newStart < bEnd && newEnd > bStart;
    });
};

export const TimeBlockForm: React.FC<TimeBlockFormProps> = ({ editBlock, onClose }) => {
    const { studyBlocks, addStudyBlock, updateStudyBlock } = usePlannerStore();
    const { addToast } = useUIStore();

    const [form, setForm] = useState({
        subject: editBlock?.subject ?? SUBJECT_OPTIONS[0],
        title: editBlock?.title ?? '',
        startTime: editBlock?.startTime ?? '09:00',
        endTime: editBlock?.endTime ?? '10:00',
        color: editBlock?.color ?? COLOR_OPTIONS[0].value,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!form.title.trim()) errs.title = 'Task name is required';
        if (form.startTime >= form.endTime) errs.time = 'End time must be after start time';
        if (hasOverlap(studyBlocks, form.startTime, form.endTime, editBlock?.id)) {
            errs.time = 'This time slot overlaps with an existing session';
        }
        return errs;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            if (errs.time) {
                addToast({ message: errs.time, type: 'error' });
            }
            return;
        }

        if (editBlock) {
            updateStudyBlock(editBlock.id, form);
            addToast({ message: 'Study block updated!', type: 'success' });
        } else {
            addStudyBlock(form);
            addToast({ message: 'Study block added!', type: 'success' });
        }
        onClose();
    };

    return (
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
                <h3 className="text-sm font-semibold text-surface-800 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-primary-500" />
                    {editBlock ? 'Edit Study Block' : 'New Study Block'}
                </h3>
                <button
                    onClick={onClose}
                    className="p-1 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Subject */}
                <div>
                    <label className="block text-xs font-medium text-surface-600 mb-1.5">Subject</label>
                    <select
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm text-surface-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all"
                    >
                        {SUBJECT_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                {/* Task name */}
                <div>
                    <label className="block text-xs font-medium text-surface-600 mb-1.5">Task / Session Name</label>
                    <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g., Data Structures Study"
                        className={`w-full px-3 py-2 rounded-lg border text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all ${
                            errors.title ? 'border-red-300 focus:ring-red-200' : 'border-surface-200 focus:border-primary-400'
                        }`}
                    />
                    {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                </div>

                {/* Time range */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-surface-600 mb-1.5">Start Time</label>
                        <input
                            type="time"
                            value={form.startTime}
                            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-surface-600 mb-1.5">End Time</label>
                        <input
                            type="time"
                            value={form.endTime}
                            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all"
                        />
                    </div>
                </div>
                {errors.time && (
                    <p className="text-xs text-red-500 -mt-2">{errors.time}</p>
                )}

                {/* Color picker */}
                <div>
                    <label className="block text-xs font-medium text-surface-600 mb-2">Block Color</label>
                    <div className="flex flex-wrap gap-2">
                        {COLOR_OPTIONS.map((c) => (
                            <button
                                key={c.value}
                                type="button"
                                title={c.label}
                                onClick={() => setForm({ ...form, color: c.value })}
                                className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                                    form.color === c.value ? 'scale-125 ring-2 ring-offset-2 ring-surface-400' : 'hover:scale-110'
                                }`}
                                style={{ backgroundColor: c.value }}
                            />
                        ))}
                    </div>
                </div>

                {/* Preview */}
                <div
                    className="rounded-lg p-3 border-l-4 text-sm font-medium text-surface-700"
                    style={{ borderLeftColor: form.color, backgroundColor: `${form.color}15` }}
                >
                    <p>{form.title || 'Session preview'}</p>
                    <p className="text-xs text-surface-500 mt-0.5">{form.subject} · {form.startTime} – {form.endTime}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 rounded-lg border border-surface-200 text-sm font-medium text-surface-600 hover:bg-surface-50 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors cursor-pointer"
                    >
                        {editBlock ? 'Save Changes' : 'Add Block'}
                    </button>
                </div>
            </form>
        </div>
    );
};
