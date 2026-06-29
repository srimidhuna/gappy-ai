import { create } from 'zustand';
import type { Assignment, AssignmentStatus, AssignmentSource, AssignmentPriority } from '../types';
import { mockAssignments } from '../utils/mockData';

export interface AssignmentFilters {
    search: string;
    status: AssignmentStatus | 'all';
    priority: AssignmentPriority | 'all';
    source: AssignmentSource | 'all';
    subject: string;
    dueDateFrom: string;
    dueDateTo: string;
}

interface AssignmentStore {
    assignments: Assignment[];
    filters: AssignmentFilters;
    setSearch: (search: string) => void;
    setStatusFilter: (status: AssignmentStatus | 'all') => void;
    setPriorityFilter: (priority: AssignmentPriority | 'all') => void;
    setSourceFilter: (source: AssignmentSource | 'all') => void;
    setSubjectFilter: (subject: string) => void;
    setDueDateFrom: (date: string) => void;
    setDueDateTo: (date: string) => void;
    resetFilters: () => void;
    addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt'>) => void;
    updateAssignment: (id: string, updates: Partial<Assignment>) => void;
    deleteAssignment: (id: string) => void;
    getFilteredAssignments: () => Assignment[];
}

const defaultFilters: AssignmentFilters = {
    search: '',
    status: 'all',
    priority: 'all',
    source: 'all',
    subject: '',
    dueDateFrom: '',
    dueDateTo: '',
};

export const useAssignmentStore = create<AssignmentStore>((set, get) => ({
    assignments: mockAssignments,
    filters: { ...defaultFilters },

    setSearch: (search) => set((state) => ({ filters: { ...state.filters, search } })),
    setStatusFilter: (status) => set((state) => ({ filters: { ...state.filters, status } })),
    setPriorityFilter: (priority) => set((state) => ({ filters: { ...state.filters, priority } })),
    setSourceFilter: (source) => set((state) => ({ filters: { ...state.filters, source } })),
    setSubjectFilter: (subject) => set((state) => ({ filters: { ...state.filters, subject } })),
    setDueDateFrom: (dueDateFrom) => set((state) => ({ filters: { ...state.filters, dueDateFrom } })),
    setDueDateTo: (dueDateTo) => set((state) => ({ filters: { ...state.filters, dueDateTo } })),
    resetFilters: () => set({ filters: { ...defaultFilters } }),

    addAssignment: (data) =>
        set((state) => ({
            assignments: [
                { ...data, id: `a-${Date.now()}`, createdAt: new Date().toISOString() },
                ...state.assignments,
            ],
        })),

    updateAssignment: (id, updates) =>
        set((state) => ({
            assignments: state.assignments.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),

    deleteAssignment: (id) =>
        set((state) => ({ assignments: state.assignments.filter((a) => a.id !== id) })),

    getFilteredAssignments: () => {
        const { assignments, filters } = get();
        const searchLower = filters.search.toLowerCase();

        return assignments.filter((a) => {
            // Search across title, subject, source, status, description
            const matchesSearch =
                !filters.search ||
                a.title.toLowerCase().includes(searchLower) ||
                a.subject.toLowerCase().includes(searchLower) ||
                a.source.toLowerCase().includes(searchLower) ||
                a.status.toLowerCase().includes(searchLower) ||
                (a.description && a.description.toLowerCase().includes(searchLower));

            const matchesStatus = filters.status === 'all' || a.status === filters.status;
            const matchesPriority = filters.priority === 'all' || a.priority === filters.priority;
            const matchesSource = filters.source === 'all' || a.source === filters.source;
            const matchesSubject = !filters.subject || a.subject === filters.subject;

            const dueDateOnly = a.dueDate.split('T')[0];
            const matchesDueDateFrom = !filters.dueDateFrom || dueDateOnly >= filters.dueDateFrom;
            const matchesDueDateTo = !filters.dueDateTo || dueDateOnly <= filters.dueDateTo;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority &&
                matchesSource &&
                matchesSubject &&
                matchesDueDateFrom &&
                matchesDueDateTo
            );
        });
    },
}));
