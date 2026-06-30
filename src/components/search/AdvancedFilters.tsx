import React from 'react';
import { X, SlidersHorizontal, RotateCcw, ChevronDown } from 'lucide-react';
import { useAssignmentStore } from '../../store/assignmentStore';
import type { AssignmentStatus, AssignmentPriority, AssignmentSource } from '../../types';

const STATUS_OPTIONS: { value: AssignmentStatus | 'all'; label: string; dot: string }[] = [
    { value: 'all', label: 'All Status', dot: 'bg-surface-300' },
    { value: 'pending', label: 'Pending', dot: 'bg-amber-400' },
    { value: 'in-progress', label: 'In Progress', dot: 'bg-blue-500' },
    { value: 'completed', label: 'Completed', dot: 'bg-emerald-500' },
    { value: 'overdue', label: 'Overdue', dot: 'bg-red-500' },
    { value: 'needs-review', label: 'Needs Review', dot: 'bg-violet-400' },
];

const PRIORITY_OPTIONS: { value: AssignmentPriority | 'all'; label: string; color: string }[] = [
    { value: 'all', label: 'All', color: 'text-surface-500' },
    { value: 'high', label: 'High', color: 'text-red-600' },
    { value: 'medium', label: 'Medium', color: 'text-amber-600' },
    { value: 'low', label: 'Low', color: 'text-emerald-600' },
];

const SOURCE_OPTIONS: { value: AssignmentSource | 'all'; label: string }[] = [
    { value: 'all', label: 'All Sources' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'email', label: 'Email' },
    { value: 'google-classroom', label: 'Google Classroom' },
    { value: 'notes', label: 'Notes' },
    { value: 'manual', label: 'Manual' },
];

interface AdvancedFiltersProps {
    className?: string;
}

// Count active (non-default) filters
const countActiveFilters = (filters: any): number => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.priority !== 'all') count++;
    if (filters.source !== 'all') count++;
    if (filters.subject) count++;
    if (filters.dueDateFrom) count++;
    if (filters.dueDateTo) count++;
    return count;
};

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ className = '' }) => {
    const {
        filters, assignments,
        setStatusFilter, setPriorityFilter, setSourceFilter,
        setSubjectFilter, setDueDateFrom, setDueDateTo, resetFilters,
    } = useAssignmentStore();

    const subjects = [...new Set(assignments.map((a) => a.subject))].sort();
    const activeCount = countActiveFilters(filters);

    return (
        <div className={`bg-white rounded-xl border border-surface-200 shadow-sm ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-primary-500" />
                    <span className="text-sm font-semibold text-surface-800">Filters</span>
                    {activeCount > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-500 text-white text-[10px] font-bold">
                            {activeCount}
                        </span>
                    )}
                </div>
                {activeCount > 0 && (
                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-1 text-xs font-medium text-surface-500 hover:text-red-500 transition-colors cursor-pointer"
                    >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                    </button>
                )}
            </div>

            <div className="p-4 space-y-5">
                {/* Status */}
                <div>
                    <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">
                        Status
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                        {STATUS_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setStatusFilter(opt.value as AssignmentStatus | 'all')}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                                    filters.status === opt.value
                                        ? 'bg-primary-50 border-primary-300 text-primary-700 shadow-sm'
                                        : 'border-surface-200 text-surface-600 hover:border-surface-300 hover:bg-surface-50'
                                }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Priority */}
                <div>
                    <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">
                        Priority
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                        {PRIORITY_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setPriorityFilter(opt.value as AssignmentPriority | 'all')}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer capitalize ${
                                    filters.priority === opt.value
                                        ? 'bg-primary-50 border-primary-300 text-primary-700'
                                        : `border-surface-200 ${opt.color} hover:border-surface-300 hover:bg-surface-50`
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Subject */}
                <div>
                    <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">
                        Subject
                    </label>
                    <div className="relative">
                        <select
                            value={filters.subject}
                            onChange={(e) => setSubjectFilter(e.target.value)}
                            className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg border border-surface-200 text-sm text-surface-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all cursor-pointer"
                        >
                            <option value="">All Subjects</option>
                            {subjects.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400 pointer-events-none" />
                    </div>
                    {/* Subject chips */}
                    {filters.subject && (
                        <button
                            onClick={() => setSubjectFilter('')}
                            className="mt-1.5 flex items-center gap-1 px-2 py-1 rounded-full bg-primary-50 border border-primary-200 text-xs text-primary-700 font-medium cursor-pointer hover:bg-primary-100 transition-colors"
                        >
                            {filters.subject}
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>

                {/* Source */}
                <div>
                    <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">
                        Source
                    </label>
                    <div className="relative">
                        <select
                            value={filters.source}
                            onChange={(e) => setSourceFilter(e.target.value as AssignmentSource | 'all')}
                            className="w-full appearance-none pl-3 pr-8 py-2 rounded-lg border border-surface-200 text-sm text-surface-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all cursor-pointer"
                        >
                            {SOURCE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400 pointer-events-none" />
                    </div>
                </div>

                {/* Due Date Range */}
                <div>
                    <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">
                        Due Date Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[10px] text-surface-400 mb-1 block">From</label>
                            <input
                                type="date"
                                value={filters.dueDateFrom}
                                onChange={(e) => setDueDateFrom(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-surface-200 text-xs text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-surface-400 mb-1 block">To</label>
                            <input
                                type="date"
                                value={filters.dueDateTo}
                                onChange={(e) => setDueDateTo(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-surface-200 text-xs text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all"
                            />
                        </div>
                    </div>
                    {(filters.dueDateFrom || filters.dueDateTo) && (
                        <button
                            onClick={() => { setDueDateFrom(''); setDueDateTo(''); }}
                            className="mt-1.5 flex items-center gap-1 text-xs text-surface-400 hover:text-red-500 cursor-pointer transition-colors"
                        >
                            <X className="w-3 h-3" />
                            Clear date range
                        </button>
                    )}
                </div>

                {/* Active filter summary chips */}
                {activeCount > 0 && (
                    <div className="pt-3 border-t border-surface-100">
                        <div className="flex flex-wrap gap-1.5">
                            {filters.status !== 'all' && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[11px] text-blue-700 font-medium">
                                    Status: {filters.status}
                                    <button onClick={() => setStatusFilter('all')} className="cursor-pointer"><X className="w-3 h-3" /></button>
                                </span>
                            )}
                            {filters.priority !== 'all' && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[11px] text-amber-700 font-medium capitalize">
                                    Priority: {filters.priority}
                                    <button onClick={() => setPriorityFilter('all')} className="cursor-pointer"><X className="w-3 h-3" /></button>
                                </span>
                            )}
                            {filters.source !== 'all' && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-[11px] text-violet-700 font-medium">
                                    Source: {filters.source}
                                    <button onClick={() => setSourceFilter('all')} className="cursor-pointer"><X className="w-3 h-3" /></button>
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
