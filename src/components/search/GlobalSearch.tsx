import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, BookOpen, Calendar, Tag, Zap, Clock } from 'lucide-react';
import { useAssignmentStore } from '../../store/assignmentStore';
import { useNavigate } from 'react-router-dom';
import type { Assignment, AssignmentStatus, AssignmentPriority } from '../../types';

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

const statusColor: Record<AssignmentStatus, string> = {
    pending: 'text-amber-600 bg-amber-50 border-amber-200',
    'in-progress': 'text-blue-600 bg-blue-50 border-blue-200',
    completed: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    overdue: 'text-red-600 bg-red-50 border-red-200',
    'needs-review': 'text-violet-600 bg-violet-50 border-violet-200',
};

const priorityDot: Record<AssignmentPriority, string> = {
    high: 'bg-red-500',
    medium: 'bg-amber-400',
    low: 'bg-emerald-500',
};

const highlight = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
        regex.test(part) ? (
            <mark key={i} className="bg-primary-100 text-primary-800 rounded px-0.5">{part}</mark>
        ) : part
    );
};

const ResultItem: React.FC<{
    assignment: Assignment;
    query: string;
    isSelected: boolean;
    onClick: () => void;
}> = ({ assignment, query, isSelected, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
            isSelected ? 'bg-primary-50' : 'hover:bg-surface-50'
        }`}
    >
        {/* Priority dot */}
        <div className="mt-1.5 flex-shrink-0">
            <span className={`inline-block w-2 h-2 rounded-full ${priorityDot[assignment.priority]}`} />
        </div>

        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-800 truncate">
                {highlight(assignment.title, query)}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="flex items-center gap-1 text-xs text-surface-500">
                    <BookOpen className="w-3 h-3" />
                    {highlight(assignment.subject, query)}
                </span>
                <span className="flex items-center gap-1 text-xs text-surface-400">
                    <Calendar className="w-3 h-3" />
                    {new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="flex items-center gap-1 text-xs text-surface-400">
                    <Tag className="w-3 h-3" />
                    {highlight(assignment.source.replace(/-/g, ' '), query)}
                </span>
            </div>
        </div>

        <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${statusColor[assignment.status]}`}>
            {assignment.status.replace('-', ' ')}
        </span>
    </button>
);

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
    const { assignments } = useAssignmentStore();
    const [query, setQuery] = useState('');
    const [selectedIdx, setSelectedIdx] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const results = useMemo(() => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();
        return assignments.filter((a) =>
            a.title.toLowerCase().includes(q) ||
            a.subject.toLowerCase().includes(q) ||
            a.source.toLowerCase().includes(q) ||
            a.status.toLowerCase().includes(q) ||
            (a.description && a.description.toLowerCase().includes(q)) ||
            a.dueDate.includes(q)
        ).slice(0, 8);
    }, [query, assignments]);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIdx(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { onClose(); return; }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIdx((i) => Math.min(i + 1, results.length - 1));
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIdx((i) => Math.max(i - 1, 0));
            }
            if (e.key === 'Enter' && results[selectedIdx]) {
                navigate('/assignments');
                onClose();
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, results, selectedIdx, navigate, onClose]);

    // Reset selection on results change
    useEffect(() => { setSelectedIdx(0); }, [results]);

    if (!isOpen) return null;

    const recentSubjects = [...new Set(assignments.map((a) => a.subject))].slice(0, 5);

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[10vh] px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-surface-200 overflow-hidden"
                style={{ animation: 'searchFadeIn 0.15s ease-out' }}
            >
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-surface-100">
                    <Search className="w-5 h-5 text-surface-400 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search assignments, subjects, sources, status…"
                        className="flex-1 text-sm text-surface-800 placeholder-surface-400 focus:outline-none bg-transparent"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="p-1 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 cursor-pointer transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded border border-surface-200 text-[10px] font-mono text-surface-400">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                {query.trim() ? (
                    <div className="max-h-[420px] overflow-y-auto">
                        {results.length > 0 ? (
                            <>
                                <div className="px-4 pt-2 pb-1">
                                    <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">
                                        {results.length} result{results.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="divide-y divide-surface-50">
                                    {results.map((a, idx) => (
                                        <ResultItem
                                            key={a.id}
                                            assignment={a}
                                            query={query}
                                            isSelected={idx === selectedIdx}
                                            onClick={() => { navigate('/assignments'); onClose(); }}
                                        />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="py-12 text-center">
                                <Search className="w-10 h-10 text-surface-200 mx-auto mb-3" />
                                <p className="text-sm font-medium text-surface-500">No results for "{query}"</p>
                                <p className="text-xs text-surface-400 mt-1">Try searching by subject, status, or source</p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Empty state — quick hints */
                    <div className="p-4 space-y-4">
                        <div>
                            <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-2">Subjects</p>
                            <div className="flex flex-wrap gap-2">
                                {recentSubjects.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setQuery(s)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-50 border border-surface-200 text-xs font-medium text-surface-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-colors cursor-pointer"
                                    >
                                        <BookOpen className="w-3 h-3" />
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-2">Status</p>
                            <div className="flex flex-wrap gap-2">
                                {(['pending', 'in-progress', 'completed', 'overdue'] as AssignmentStatus[]).map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setQuery(s)}
                                        className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold capitalize transition-colors cursor-pointer ${statusColor[s]}`}
                                    >
                                        {s.replace('-', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-4 pt-2 border-t border-surface-100">
                            <span className="flex items-center gap-1.5 text-[10px] text-surface-400">
                                <Zap className="w-3 h-3" /> Instant search
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] text-surface-400">
                                <Clock className="w-3 h-3" /> ↑↓ to navigate
                            </span>
                            <span className="text-[10px] text-surface-400">↵ to open assignments</span>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes searchFadeIn {
                    from { opacity: 0; transform: scale(0.97) translateY(-8px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>,
        document.body
    );
};
