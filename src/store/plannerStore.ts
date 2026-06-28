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
}));
