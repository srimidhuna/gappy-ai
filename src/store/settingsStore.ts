import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AIProvider = 'gemini' | 'openai' | 'none';

export interface UserProfile {
    name: string;
    college: string;
    department: string;
    semester: string;
    email: string;
    avatar: string;
}

export interface AISettings {
    provider: AIProvider;
    geminiApiKey: string;
    openaiApiKey: string;
    model: string;
}

export interface NotificationPreferences {
    emailEnabled: boolean;
    pushEnabled: boolean;
    inAppEnabled: boolean;
    remindDayBefore: boolean;
    remind12HoursBefore: boolean;
    remind6HoursBefore: boolean;
    remind1HourBefore: boolean;
}

export interface SettingsState {
    profile: UserProfile;
    ai: AISettings;
    theme: ThemeMode;
    notifications: NotificationPreferences;
    updateProfile: (profile: Partial<UserProfile>) => void;
    updateAI: (ai: Partial<AISettings>) => void;
    updateTheme: (theme: ThemeMode) => void;
    updateNotificationPrefs: (prefs: Partial<NotificationPreferences>) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            profile: {
                name: 'Alex Johnson',
                college: 'State University',
                department: 'Computer Science',
                semester: 'Fall 2026',
                email: 'alex.johnson@university.edu',
                avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Alex',
            },
            ai: {
                provider: 'gemini',
                geminiApiKey: '',
                openaiApiKey: '',
                model: 'gemini-pro',
            },
            theme: 'system',
            notifications: {
                emailEnabled: false,
                pushEnabled: false,
                inAppEnabled: true,
                remindDayBefore: true,
                remind12HoursBefore: false,
                remind6HoursBefore: false,
                remind1HourBefore: true,
            },
            updateProfile: (profile) =>
                set((state) => ({ profile: { ...state.profile, ...profile } })),
            updateAI: (ai) =>
                set((state) => ({ ai: { ...state.ai, ...ai } })),
            updateTheme: (theme) => set({ theme }),
            updateNotificationPrefs: (prefs) =>
                set((state) => ({
                    notifications: { ...state.notifications, ...prefs },
                })),
        }),
        { name: 'deadline-pilot-settings' }
    )
);
