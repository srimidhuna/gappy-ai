import { create } from 'zustand';
import type { Task, WeeklyDay, StudyBlock } from '../types';
import { mockTasks, mockWeeklyDays, mockStudyBlocks } from '../utils/mockData';

interface PlannerStore {
    tasks: Task[];
    weeklyDays: WeeklyDay[];
    studyBlocks: StudyBlock[];
    toggleTask: (id: string) => void;
    addTask: (task: Task) => void;
    getTodayTasks: () => Task[];
    addStudyBlock: (block: Omit<StudyBlock, 'id'>) => void;
    updateStudyBlock: (id: string, updates: Partial<StudyBlock>) => void;
    deleteStudyBlock: (id: string) => void;
    reorderStudyBlocks: (blocks: StudyBlock[]) => void;
}

export const usePlannerStore = create<PlannerStore>((set, get) => ({
    tasks: mockTasks,
    weeklyDays: mockWeeklyDays,
    studyBlocks: mockStudyBlocks,

    toggleTask: (id) =>
        set((state) => ({
            tasks: state.tasks.map((t) =>
                t.id === id ? { ...t, completed: !t.completed } : t
            ),
        })),

    addTask: (task) =>
        set((state) => ({ tasks: [...state.tasks, task] })),

    getTodayTasks: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().tasks.filter((t) => t.date === today);
    },

    addStudyBlock: (block) =>
        set((state) => ({
            studyBlocks: [
                ...state.studyBlocks,
                { ...block, id: `sb-${Date.now()}` },
            ].sort((a, b) => a.startTime.localeCompare(b.startTime)),
        })),

    updateStudyBlock: (id, updates) =>
        set((state) => ({
            studyBlocks: state.studyBlocks
                .map((b) => (b.id === id ? { ...b, ...updates } : b))
                .sort((a, b) => a.startTime.localeCompare(b.startTime)),
        })),

    deleteStudyBlock: (id) =>
        set((state) => ({
            studyBlocks: state.studyBlocks.filter((b) => b.id !== id),
        })),

    reorderStudyBlocks: (blocks) =>
        set({ studyBlocks: blocks }),
}));
