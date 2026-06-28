import { create } from 'zustand';
import type { Assignment, AssignmentStatus, AssignmentSource } from '../types';
import { mockAssignments } from '../utils/mockData';

interface AssignmentFilters {
    search: string;
    status: AssignmentStatus | 'all';
    source: AssignmentSource | 'all';
    subject: string;
}

interface AssignmentStore {
    assignments: Assignment[];
    filters: AssignmentFilters;
    setSearch: (search: string) => void;
    setStatusFilter: (status: AssignmentStatus | 'all') => void;
    setSourceFilter: (source: AssignmentSource | 'all') => void;
    setSubjectFilter: (subject: string) => void;
    addAssignment: (assignment: Assignment) => void;
    updateAssignment: (id: string, updates: Partial<Assignment>) => void;
    deleteAssignment: (id: string) => void;
    getFilteredAssignments: () => Assignment[];
}

export const useAssignmentStore = create<AssignmentStore>((set, get) => ({
    assignments: mockAssignments,
    filters: {
        search: '',
        status: 'all',
        source: 'all',
        subject: '',
    },

    setSearch: (search) => set((state) => ({ filters: { ...state.filters, search } })),
    setStatusFilter: (status) => set((state) => ({ filters: { ...state.filters, status } })),
    setSourceFilter: (source) => set((state) => ({ filters: { ...state.filters, source } })),
    setSubjectFilter: (subject) => set((state) => ({ filters: { ...state.filters, subject } })),

    addAssignment: (assignment) =>
        set((state) => ({ assignments: [assignment, ...state.assignments] })),

    updateAssignment: (id, updates) =>
        set((state) => ({
            assignments: state.assignments.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        })),

    deleteAssignment: (id) =>
        set((state) => ({ assignments: state.assignments.filter((a) => a.id !== id) })),

    getFilteredAssignments: () => {
        const { assignments, filters } = get();
        return assignments.filter((a) => {
            const matchesSearch =
                !filters.search ||
                a.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                a.subject.toLowerCase().includes(filters.search.toLowerCase());
            const matchesStatus = filters.status === 'all' || a.status === filters.status;
            const matchesSource = filters.source === 'all' || a.source === filters.source;
            const matchesSubject = !filters.subject || a.subject === filters.subject;
            return matchesSearch && matchesStatus && matchesSource && matchesSubject;
        });
    },
}));
