import { create } from 'zustand';
import type { Assignment } from '../types';

export type NotificationType = 'due-today' | 'due-tomorrow' | 'high-priority' | 'overdue';

export interface AppNotification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    assignmentId: string;
    createdAt: string;
    read: boolean;
}

export type ReminderTiming = '1-day' | '12-hours' | '6-hours' | '1-hour';
export type NotificationMethod = 'email' | 'push' | 'in-app';

export interface ReminderSettings {
    timings: ReminderTiming[];
    methods: NotificationMethod[];
}

interface NotificationStore {
    notifications: AppNotification[];
    reminderSettings: ReminderSettings;
    unreadCount: () => number;
    generateNotifications: (assignments: Assignment[]) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotification: (id: string) => void;
    clearAll: () => void;
    updateReminderSettings: (settings: Partial<ReminderSettings>) => void;
}

const buildNotifications = (assignments: Assignment[]): AppNotification[] => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const tomorrowStr = (() => {
        const d = new Date(now);
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    })();

    const notes: AppNotification[] = [];

    assignments.forEach((a) => {
        const dueDateStr = a.dueDate.split('T')[0];

        if (a.status === 'overdue') {
            notes.push({
                id: `n-overdue-${a.id}`,
                type: 'overdue',
                title: '⚠️ Assignment Overdue',
                message: `"${a.title}" is past its deadline and still incomplete.`,
                assignmentId: a.id,
                createdAt: new Date().toISOString(),
                read: false,
            });
        } else if (dueDateStr === todayStr && a.status !== 'completed') {
            notes.push({
                id: `n-today-${a.id}`,
                type: 'due-today',
                title: '📅 Due Today',
                message: `"${a.title}" is due today — make sure to finish it!`,
                assignmentId: a.id,
                createdAt: new Date().toISOString(),
                read: false,
            });
        } else if (dueDateStr === tomorrowStr && a.status !== 'completed') {
            notes.push({
                id: `n-tomorrow-${a.id}`,
                type: 'due-tomorrow',
                title: '🔔 Due Tomorrow',
                message: `"${a.title}" is due tomorrow. Start now to stay ahead!`,
                assignmentId: a.id,
                createdAt: new Date().toISOString(),
                read: false,
            });
        } else if (a.priority === 'high' && a.status !== 'completed' && (a.status as string) !== 'overdue') {
            notes.push({
                id: `n-high-${a.id}`,
                type: 'high-priority',
                title: '🚩 High Priority',
                message: `"${a.title}" is high priority — don't let it slip!`,
                assignmentId: a.id,
                createdAt: new Date().toISOString(),
                read: false,
            });
        }
    });

    return notes;
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
    notifications: [],
    reminderSettings: {
        timings: ['1-day', '1-hour'],
        methods: ['in-app'],
    },

    unreadCount: () => get().notifications.filter((n) => !n.read).length,

    generateNotifications: (assignments) => {
        const fresh = buildNotifications(assignments);
        set((state) => {
            // Merge: preserve read state of existing notifications
            const existingReadIds = new Set(
                state.notifications.filter((n) => n.read).map((n) => n.id)
            );
            const merged = fresh.map((n) => ({
                ...n,
                read: existingReadIds.has(n.id),
            }));
            return { notifications: merged };
        });
    },

    markAsRead: (id) =>
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
            ),
        })),

    markAllAsRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

    clearNotification: (id) =>
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        })),

    clearAll: () => set({ notifications: [] }),

    updateReminderSettings: (settings) =>
        set((state) => ({
            reminderSettings: { ...state.reminderSettings, ...settings },
        })),
}));
