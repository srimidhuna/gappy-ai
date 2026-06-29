import React, { useState } from 'react';
import {
    Settings as SettingsIcon,
    User,
    Brain,
    Bell,
    Sun,
    Moon,
    Monitor,
    Eye,
    EyeOff,
    KeyRound,
    GraduationCap,
    BookOpen,
    Check,
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ToggleSwitch } from '../components/common/ToggleSwitch';
import { useSettingsStore, type ThemeMode, type AIProvider } from '../store/settingsStore';
import { useUIStore } from '../store/uiStore';
import { useNotificationStore, type ReminderTiming, type NotificationMethod } from '../store/notificationStore';

// ── Zod schemas ────────────────────────────────────────────────────────────────
const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    college: z.string().min(2, 'College name is required'),
    department: z.string().min(2, 'Department is required'),
    semester: z.string().min(1, 'Semester is required'),
});

const aiSchema = z.object({
    provider: z.enum(['gemini', 'openai', 'none']),
    geminiApiKey: z.string().optional(),
    openaiApiKey: z.string().optional(),
    model: z.string().min(1, 'Select a model'),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type AIFormData = z.infer<typeof aiSchema>;

// ── Section header helper ─────────────────────────────────────────────────────
const SectionDivider: React.FC<{ label: string }> = ({ label }) => (
    <div className="flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-surface-100" />
        <span className="text-[10px] font-semibold text-surface-400 uppercase tracking-widest">{label}</span>
        <div className="h-px flex-1 bg-surface-100" />
    </div>
);

// ── Gemini model options ──────────────────────────────────────────────────────
const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'];
const OPENAI_MODELS = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];

const Settings: React.FC = () => {
    const { addToast } = useUIStore();
    const {
        profile, ai, theme, notifications,
        updateProfile, updateAI, updateTheme, updateNotificationPrefs,
    } = useSettingsStore();
    const { reminderSettings, updateReminderSettings } = useNotificationStore();

    const [showGeminiKey, setShowGeminiKey] = useState(false);
    const [showOpenAIKey, setShowOpenAIKey] = useState(false);

    // ── Profile form ────────────────────────────────────────────────────────
    const profileForm = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: profile.name,
            email: profile.email,
            college: profile.college,
            department: profile.department,
            semester: profile.semester,
        },
    });

    const onSaveProfile = (data: ProfileFormData) => {
        updateProfile(data);
        addToast({ message: 'Profile saved successfully!', type: 'success' });
    };

    // ── AI form ────────────────────────────────────────────────────────────
    const aiForm = useForm<AIFormData>({
        resolver: zodResolver(aiSchema),
        defaultValues: {
            provider: ai.provider,
            geminiApiKey: ai.geminiApiKey,
            openaiApiKey: ai.openaiApiKey,
            model: ai.model,
        },
    });

    const watchedProvider = aiForm.watch('provider');

    const onSaveAI = (data: AIFormData) => {
        updateAI(data);
        addToast({ message: 'AI settings saved!', type: 'success' });
    };

    // ── Theme ──────────────────────────────────────────────────────────────
    const themeOptions: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
        { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
        { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
        { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
    ];

    // ── Reminder timings ───────────────────────────────────────────────────
    const timingOptions: { value: ReminderTiming; label: string; desc: string }[] = [
        { value: '1-day', label: '1 Day Before', desc: 'Receive a reminder 24 hours before the deadline' },
        { value: '12-hours', label: '12 Hours Before', desc: 'Half-day advance reminder' },
        { value: '6-hours', label: '6 Hours Before', desc: 'Same-day reminder in the afternoon' },
        { value: '1-hour', label: '1 Hour Before', desc: 'Last-minute alert before the deadline' },
    ];

    const methodOptions: { value: NotificationMethod; label: string; desc: string }[] = [
        { value: 'in-app', label: 'In-App', desc: 'Notification bell in the top navigation bar' },
        { value: 'email', label: 'Email', desc: 'Reminders sent to your registered email' },
        { value: 'push', label: 'Push Notifications', desc: 'Browser push notifications (requires permission)' },
    ];

    const toggleTiming = (timing: ReminderTiming) => {
        const current = reminderSettings.timings;
        const updated = current.includes(timing)
            ? current.filter((t) => t !== timing)
            : [...current, timing];
        updateReminderSettings({ timings: updated });
        addToast({ message: 'Reminder timing updated', type: 'info' });
    };

    const toggleMethod = (method: NotificationMethod) => {
        const current = reminderSettings.methods;
        const updated = current.includes(method)
            ? current.filter((m) => m !== method)
            : [...current, method];
        updateReminderSettings({ methods: updated });
        addToast({ message: 'Notification method updated', type: 'info' });
    };

    const aiProviders: { value: AIProvider; label: string; color: string; description: string }[] = [
        { value: 'gemini', label: 'Google Gemini', color: 'border-blue-200 bg-blue-50', description: 'Best for multi-modal tasks and long context' },
        { value: 'openai', label: 'OpenAI GPT', color: 'border-emerald-200 bg-emerald-50', description: 'Industry-leading language models' },
        { value: 'none', label: 'No AI', color: 'border-surface-200 bg-surface-50', description: 'Disable AI extraction features' },
    ];

    return (
        <div className="space-y-6 max-w-3xl mx-auto pb-10">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-surface-800 flex items-center gap-2">
                    <SettingsIcon className="w-7 h-7 text-primary-500" />
                    Settings
                </h1>
                <p className="text-sm text-surface-500 mt-1">
                    Manage your profile, AI integrations, theme, and notification preferences.
                </p>
            </div>

            {/* ── Profile ───────────────────────────────────────────────────────── */}
            <Card
                title="Profile"
                subtitle="Your personal and academic information"
                action={<User className="w-4 h-4 text-surface-400" />}
            >
                <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-5">
                    {/* Avatar row */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-50 border border-surface-100">
                        <img
                            src={profile.avatar}
                            alt={profile.name}
                            className="w-16 h-16 rounded-2xl bg-primary-100 border border-surface-200"
                        />
                        <div>
                            <p className="text-base font-semibold text-surface-800">{profile.name}</p>
                            <p className="text-sm text-surface-500">{profile.email}</p>
                            <p className="text-xs text-surface-400 mt-0.5">{profile.college} · {profile.department}</p>
                        </div>
                    </div>

                    <SectionDivider label="Personal Info" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Full Name"
                            placeholder="Alex Johnson"
                            error={profileForm.formState.errors.name?.message}
                            {...profileForm.register('name')}
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="you@university.edu"
                            error={profileForm.formState.errors.email?.message}
                            {...profileForm.register('email')}
                        />
                    </div>

                    <SectionDivider label="Academic Info" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="College / University"
                            placeholder="State University"
                            icon={<GraduationCap className="w-4 h-4" />}
                            error={profileForm.formState.errors.college?.message}
                            {...profileForm.register('college')}
                        />
                        <Input
                            label="Department"
                            placeholder="Computer Science"
                            icon={<BookOpen className="w-4 h-4" />}
                            error={profileForm.formState.errors.department?.message}
                            {...profileForm.register('department')}
                        />
                    </div>
                    <Input
                        label="Semester / Term"
                        placeholder="Fall 2026"
                        error={profileForm.formState.errors.semester?.message}
                        helperText="Shown in the top navigation bar as your workspace name"
                        {...profileForm.register('semester')}
                    />

                    <div className="flex justify-end pt-2">
                        <Button type="submit" loading={profileForm.formState.isSubmitting}>
                            Save Profile
                        </Button>
                    </div>
                </form>
            </Card>

            {/* ── Theme ─────────────────────────────────────────────────────────── */}
            <Card
                title="Appearance"
                subtitle="Choose your preferred theme"
                action={<Monitor className="w-4 h-4 text-surface-400" />}
            >
                <div className="grid grid-cols-3 gap-3">
                    {themeOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => {
                                updateTheme(opt.value);
                                addToast({ message: `Theme set to ${opt.label}`, type: 'info' });
                            }}
                            className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                theme === opt.value
                                    ? 'border-primary-400 bg-primary-50 text-primary-700'
                                    : 'border-surface-200 bg-white text-surface-500 hover:border-surface-300'
                            }`}
                        >
                            {opt.icon}
                            <span className="text-xs font-semibold">{opt.label}</span>
                            {theme === opt.value && (
                                <span className="w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center">
                                    <Check className="w-2.5 h-2.5 text-white" />
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </Card>

            {/* ── AI Provider ───────────────────────────────────────────────────── */}
            <Card
                title="AI Provider"
                subtitle="Configure your AI extraction engine for inbox messages"
                action={<Brain className="w-4 h-4 text-surface-400" />}
            >
                <form onSubmit={aiForm.handleSubmit(onSaveAI)} className="space-y-5">
                    {/* Provider selector */}
                    <div>
                        <p className="text-xs font-medium text-surface-600 mb-2">Select Provider</p>
                        <Controller
                            control={aiForm.control}
                            name="provider"
                            render={({ field }) => (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {aiProviders.map((p) => (
                                        <button
                                            key={p.value}
                                            type="button"
                                            onClick={() => field.onChange(p.value)}
                                            className={`flex flex-col items-start gap-1.5 p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                                                field.value === p.value
                                                    ? `${p.color} border-opacity-100`
                                                    : 'border-surface-200 bg-white hover:border-surface-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 w-full">
                                                <span className={`text-xs font-semibold ${field.value === p.value ? 'text-surface-800' : 'text-surface-600'}`}>
                                                    {p.label}
                                                </span>
                                                {field.value === p.value && (
                                                    <span className="ml-auto w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center">
                                                        <Check className="w-2.5 h-2.5 text-white" />
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-surface-400 leading-relaxed">{p.description}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        />
                    </div>

                    {/* API Keys — only shown when provider is selected */}
                    {watchedProvider !== 'none' && (
                        <>
                            <SectionDivider label="API Configuration" />

                            {watchedProvider === 'gemini' && (
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Input
                                            label="Gemini API Key"
                                            type={showGeminiKey ? 'text' : 'password'}
                                            placeholder="AIzaSy..."
                                            icon={<KeyRound className="w-4 h-4" />}
                                            helperText="Get your key from Google AI Studio"
                                            error={aiForm.formState.errors.geminiApiKey?.message}
                                            {...aiForm.register('geminiApiKey')}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowGeminiKey((v) => !v)}
                                            className="absolute right-3 top-8 text-surface-400 hover:text-surface-600 cursor-pointer"
                                        >
                                            {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-surface-700 mb-1.5">Model</label>
                                        <select
                                            className="w-full px-3 py-2.5 rounded-lg border border-surface-300 text-sm text-surface-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                            {...aiForm.register('model')}
                                        >
                                            {GEMINI_MODELS.map((m) => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {watchedProvider === 'openai' && (
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Input
                                            label="OpenAI API Key"
                                            type={showOpenAIKey ? 'text' : 'password'}
                                            placeholder="sk-..."
                                            icon={<KeyRound className="w-4 h-4" />}
                                            helperText="Get your key from platform.openai.com"
                                            error={aiForm.formState.errors.openaiApiKey?.message}
                                            {...aiForm.register('openaiApiKey')}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowOpenAIKey((v) => !v)}
                                            className="absolute right-3 top-8 text-surface-400 hover:text-surface-600 cursor-pointer"
                                        >
                                            {showOpenAIKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-surface-700 mb-1.5">Model</label>
                                        <select
                                            className="w-full px-3 py-2.5 rounded-lg border border-surface-300 text-sm text-surface-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                                            {...aiForm.register('model')}
                                        >
                                            {OPENAI_MODELS.map((m) => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div className="flex justify-end pt-1">
                        <Button type="submit" loading={aiForm.formState.isSubmitting}>
                            Save AI Settings
                        </Button>
                    </div>
                </form>
            </Card>

            {/* ── Notification Preferences ──────────────────────────────────────── */}
            <Card
                title="Notification Preferences"
                subtitle="Control when and how you receive reminders"
                action={<Bell className="w-4 h-4 text-surface-400" />}
            >
                <div className="space-y-6">
                    {/* Notification Methods */}
                    <div>
                        <SectionDivider label="Notification Methods" />
                        <div className="mt-3 space-y-3">
                            {methodOptions.map((opt) => (
                                <div key={opt.value} className="flex items-center justify-between p-3.5 rounded-xl bg-surface-50 border border-surface-100">
                                    <div>
                                        <p className="text-sm font-medium text-surface-700">{opt.label}</p>
                                        <p className="text-xs text-surface-400 mt-0.5">{opt.desc}</p>
                                    </div>
                                    <ToggleSwitch
                                        checked={reminderSettings.methods.includes(opt.value)}
                                        onChange={() => toggleMethod(opt.value)}
                                        id={`method-${opt.value}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reminder Timings */}
                    <div>
                        <SectionDivider label="Reminder Timings" />
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {timingOptions.map((opt) => {
                                const active = reminderSettings.timings.includes(opt.value);
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => toggleTiming(opt.value)}
                                        className={`flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                                            active
                                                ? 'border-primary-300 bg-primary-50'
                                                : 'border-surface-200 bg-white hover:border-surface-300'
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                                            active ? 'border-primary-500 bg-primary-500' : 'border-surface-300'
                                        }`}>
                                            {active && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium ${active ? 'text-primary-700' : 'text-surface-700'}`}>
                                                {opt.label}
                                            </p>
                                            <p className="text-xs text-surface-400 mt-0.5">{opt.desc}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick toggles */}
                    <div>
                        <SectionDivider label="Alert Types" />
                        <div className="mt-3 space-y-3">
                            {[
                                { key: 'emailEnabled' as const, label: 'Due Today Alert', desc: 'Notify when an assignment is due today' },
                                { key: 'pushEnabled' as const, label: 'Overdue Alert', desc: 'Notify when an assignment becomes overdue' },
                                { key: 'inAppEnabled' as const, label: 'High Priority Alert', desc: 'Notify for high priority unfinished assignments' },
                                { key: 'remindDayBefore' as const, label: 'Due Tomorrow Alert', desc: 'Notify one day before the deadline' },
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between p-3.5 rounded-xl bg-surface-50 border border-surface-100">
                                    <div>
                                        <p className="text-sm font-medium text-surface-700">{item.label}</p>
                                        <p className="text-xs text-surface-400 mt-0.5">{item.desc}</p>
                                    </div>
                                    <ToggleSwitch
                                        checked={notifications[item.key]}
                                        onChange={(v) => updateNotificationPrefs({ [item.key]: v })}
                                        id={`alert-${item.key}`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Badge variant="success">Settings auto-saved</Badge>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Settings;
