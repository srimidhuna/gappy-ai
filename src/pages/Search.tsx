import React, { useState, useEffect } from 'react';
import {
    Search as SearchIcon, SlidersHorizontal, X, BookOpen,
    Calendar, Tag, Flag, Sparkles, Loader2, Brain,
} from 'lucide-react';
import { useAssignmentStore } from '../store/assignmentStore';
import { AdvancedFilters } from '../components/search/AdvancedFilters';
import { parseNaturalLanguageSearch } from '../services/aiService';
import type { AssignmentStatus, AssignmentPriority, AssignmentSource } from '../types';

const statusColor: Record<AssignmentStatus, string> = {
    pending: 'text-amber-700 bg-amber-50 border-amber-200',
    'in-progress': 'text-blue-700 bg-blue-50 border-blue-200',
    completed: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    overdue: 'text-red-700 bg-red-50 border-red-200',
    'needs-review': 'text-violet-700 bg-violet-50 border-violet-200',
};

const priorityBar: Record<AssignmentPriority, string> = {
    high: 'bg-red-400',
    medium: 'bg-amber-400',
    low: 'bg-emerald-400',
};

const priorityColor: Record<AssignmentPriority, string> = {
    high: 'text-red-600',
    medium: 'text-amber-600',
    low: 'text-emerald-600',
};

const NL_EXAMPLES = [
    'Assignments due tomorrow',
    'Pending AI assignments',
    'Assignments from WhatsApp',
    'High priority overdue',
    'Completed this week',
];

const Search: React.FC = () => {
    const {
        filters, setSearch, setStatusFilter, setSourceFilter,
        setPriorityFilter, setSubjectFilter, setDueDateFrom, setDueDateTo,
        getFilteredAssignments, resetFilters, assignments,
    } = useAssignmentStore();

    const [showFilters, setShowFilters] = useState(false);
    const [nlQuery, setNlQuery] = useState('');
    const [nlLoading, setNlLoading] = useState(false);
    const [nlIntent, setNlIntent] = useState<string | null>(null);
    const [mode, setMode] = useState<'keyword' | 'ai'>('keyword');

    const results = getFilteredAssignments();

    const activeFilterCount = [
        filters.status !== 'all',
        filters.priority !== 'all',
        filters.source !== 'all',
        !!filters.subject,
        !!filters.dueDateFrom,
        !!filters.dueDateTo,
    ].filter(Boolean).length;

    useEffect(() => () => { resetFilters(); }, []);

    const hasQuery = !!filters.search.trim();
    const hasFilters = activeFilterCount > 0;
    const isFiltering = hasQuery || hasFilters || !!nlIntent;

    const handleNLSearch = async (q = nlQuery) => {
        if (!q.trim()) return;
        setNlLoading(true);
        setNlIntent(null);
        try {
            resetFilters();
            const parsed = await parseNaturalLanguageSearch(q);
            if (parsed.status) setStatusFilter(parsed.status as AssignmentStatus | 'all');
            if (parsed.priority) setPriorityFilter(parsed.priority as AssignmentPriority | 'all');
            if (parsed.source) setSourceFilter(parsed.source as AssignmentSource | 'all');
            if (parsed.subject) setSubjectFilter(parsed.subject);
            if (parsed.searchTerms?.length) setSearch(parsed.searchTerms.join(' '));
            if (parsed.dueToday) {
                const today = new Date().toISOString().split('T')[0];
                setDueDateFrom(today);
                setDueDateTo(today);
            } else if (parsed.dueTomorrow) {
                const tom = new Date();
                tom.setDate(tom.getDate() + 1);
                const tStr = tom.toISOString().split('T')[0];
                setDueDateFrom(tStr);
                setDueDateTo(tStr);
            }
            setNlIntent(parsed.intent ?? q);
        } catch {
            // Fallback: plain text search
            setSearch(q);
            setNlIntent(q);
        } finally {
            setNlLoading(false);
        }
    };

    const clearAll = () => {
        resetFilters();
        setSearch('');
        setNlQuery('');
        setNlIntent(null);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Page header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-800 flex items-center gap-2">
                        <SearchIcon className="w-7 h-7 text-primary-500" />
                        Search & Filters
                    </h1>
                    <p className="text-sm text-surface-500 mt-1">
                        Instantly search across all assignments or use AI natural language queries.
                    </p>
                </div>
            </div>

            {/* Mode toggle */}
            <div className="flex items-center gap-1 p-1 bg-surface-100 rounded-xl w-fit">
                <button
                    onClick={() => setMode('keyword')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                        mode === 'keyword' ? 'bg-white text-surface-800 shadow-sm' : 'text-surface-500 hover:text-surface-700'
                    }`}
                >
                    <SearchIcon className="w-3.5 h-3.5" />
                    Keyword Search
                </button>
                <button
                    onClick={() => setMode('ai')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                        mode === 'ai' ? 'bg-white text-surface-800 shadow-sm' : 'text-surface-500 hover:text-surface-700'
                    }`}
                >
                    <Brain className="w-3.5 h-3.5" />
                    AI Natural Language
                </button>
            </div>

            {/* ── Keyword search mode ── */}
            {mode === 'keyword' && (
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by title, subject, status, source, description…"
                            className="w-full pl-12 pr-10 py-3 rounded-xl border border-surface-200 bg-white text-sm text-surface-700 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 shadow-sm transition-all"
                            autoFocus
                        />
                        {filters.search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 cursor-pointer transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                            showFilters || activeFilterCount > 0
                                ? 'bg-primary-50 border-primary-300 text-primary-700'
                                : 'bg-white border-surface-200 text-surface-600 hover:border-surface-300'
                        }`}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary-500 text-white text-[10px] font-bold">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>
            )}

            {/* ── AI Natural Language search mode ── */}
            {mode === 'ai' && (
                <div className="space-y-3">
                    <div className="relative">
                        <Brain className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-400" />
                        <input
                            type="text"
                            value={nlQuery}
                            onChange={(e) => setNlQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleNLSearch()}
                            placeholder='Ask in natural language: "assignments due tomorrow", "pending from WhatsApp"…'
                            className="w-full pl-12 pr-36 py-3.5 rounded-xl border border-violet-200 bg-white text-sm text-surface-700 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 shadow-sm transition-all"
                            autoFocus
                        />
                        <button
                            onClick={() => handleNLSearch()}
                            disabled={nlLoading || !nlQuery.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-violet-500 text-white rounded-lg text-xs font-semibold hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                            {nlLoading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Sparkles className="w-3.5 h-3.5" />
                            )}
                            {nlLoading ? 'Thinking…' : 'AI Search'}
                        </button>
                    </div>

                    {/* Example queries */}
                    <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-surface-400 font-medium self-center">Try:</span>
                        {NL_EXAMPLES.map((ex) => (
                            <button
                                key={ex}
                                onClick={() => { setNlQuery(ex); handleNLSearch(ex); }}
                                className="px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-xs font-medium text-violet-700 hover:bg-violet-100 transition-colors cursor-pointer"
                            >
                                {ex}
                            </button>
                        ))}
                    </div>

                    {/* Intent badge */}
                    {nlIntent && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-50 border border-violet-200 w-fit">
                            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                            <span className="text-xs font-semibold text-violet-700">AI interpreted: "{nlIntent}"</span>
                            <button onClick={clearAll} className="ml-1 text-violet-400 hover:text-violet-700 cursor-pointer">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ── Results grid ── */}
            <div className={`grid gap-6 ${showFilters && mode === 'keyword' ? 'lg:grid-cols-[300px_1fr]' : 'grid-cols-1'}`}>
                {showFilters && mode === 'keyword' && (
                    <div className="lg:col-span-1">
                        <AdvancedFilters />
                    </div>
                )}

                <div className="space-y-4">
                    {/* Results header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-surface-700">
                                {isFiltering
                                    ? `${results.length} result${results.length !== 1 ? 's' : ''}`
                                    : `All ${assignments.length} assignments`}
                            </p>
                            {nlIntent && (
                                <span className="flex items-center gap-1 text-xs text-violet-500">
                                    <Brain className="w-3 h-3" />
                                    AI filtered
                                </span>
                            )}
                            {hasQuery && !nlIntent && (
                                <span className="text-xs text-surface-400">for "{filters.search}"</span>
                            )}
                        </div>
                        {isFiltering && (
                            <button
                                onClick={clearAll}
                                className="text-xs text-surface-400 hover:text-red-500 flex items-center gap-1 cursor-pointer transition-colors"
                            >
                                <X className="w-3 h-3" /> Clear all
                            </button>
                        )}
                    </div>

                    {/* Results list */}
                    {results.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-surface-200">
                            <SearchIcon className="w-12 h-12 text-surface-200 mb-3" />
                            <p className="text-sm font-medium text-surface-500">No assignments found</p>
                            <p className="text-xs text-surface-400 mt-1">
                                {mode === 'ai' ? 'Try a different query' : 'Try adjusting your search or filters'}
                            </p>
                            <button
                                onClick={clearAll}
                                className="mt-4 px-4 py-2 rounded-lg bg-primary-50 border border-primary-200 text-sm text-primary-700 font-medium hover:bg-primary-100 cursor-pointer transition-colors"
                            >
                                Clear & show all
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {results.map((a) => (
                                <div
                                    key={a.id}
                                    className="relative bg-white rounded-xl border border-surface-200 hover:shadow-md transition-all duration-200 overflow-hidden"
                                >
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${priorityBar[a.priority]}`} />
                                    <div className="pl-4 pr-5 py-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-surface-800 truncate">{a.title}</p>
                                                {a.description && (
                                                    <p className="text-xs text-surface-500 mt-0.5 line-clamp-1">{a.description}</p>
                                                )}
                                            </div>
                                            <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${statusColor[a.status]}`}>
                                                {a.status.replace(/-/g, ' ')}
                                            </span>
                                        </div>

                                        <div className="mt-2.5 flex flex-wrap items-center gap-3">
                                            <span className="flex items-center gap-1 text-xs text-surface-500">
                                                <BookOpen className="w-3 h-3" />
                                                {a.subject}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-surface-500">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(a.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-surface-500">
                                                <Tag className="w-3 h-3" />
                                                {a.source.replace(/-/g, ' ')}
                                            </span>
                                            <span className={`flex items-center gap-1 text-xs font-medium capitalize ${priorityColor[a.priority]}`}>
                                                <Flag className="w-3 h-3" />
                                                {a.priority}
                                            </span>
                                            {a.estimatedHours && (
                                                <span className="text-xs text-surface-400">⏱ {a.estimatedHours}h est.</span>
                                            )}
                                            {a.professor && (
                                                <span className="text-xs text-surface-400">👤 {a.professor}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Search;
