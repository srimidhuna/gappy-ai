import React from 'react';
import { Settings as SettingsIcon, User, Brain, Bell, ExternalLink } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { mockUser } from '../utils/mockData';
import { useForm } from 'react-hook-form';
import { useUIStore } from '../store/uiStore';

interface ProfileFormData {
    name: string;
    email: string;
    workspace: string;
}

const Settings: React.FC = () => {
    const { addToast } = useUIStore();

    const { register, handleSubmit } = useForm<ProfileFormData>({
        defaultValues: {
            name: mockUser.name,
            email: mockUser.email,
            workspace: mockUser.workspace,
        },
    });

    const onSubmit = (_data: ProfileFormData) => {
        addToast({ message: 'Profile updated successfully!', type: 'success' });
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-surface-800 flex items-center gap-2">
                    <SettingsIcon className="w-7 h-7 text-primary-500" />
                    Settings
                </h1>
                <p className="text-sm text-surface-500 mt-1">Manage your profile and preferences.</p>
            </div>

            {/* Profile */}
            <Card title="Profile" subtitle="Your personal information">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex items-center gap-4 mb-4 p-4 rounded-xl bg-surface-50">
                        <img
                            src={mockUser.avatar}
                            alt={mockUser.name}
                            className="w-16 h-16 rounded-2xl bg-primary-100"
                        />
                        <div>
                            <p className="text-base font-semibold text-surface-800">{mockUser.name}</p>
                            <p className="text-sm text-surface-500">{mockUser.email}</p>
                            <button className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-1 cursor-pointer">
                                Change avatar
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Full Name"
                            {...register('name')}
                        />
                        <Input
                            label="Email"
                            type="email"
                            {...register('email')}
                        />
                    </div>
                    <Input
                        label="Workspace Name"
                        {...register('workspace')}
                        helperText="This appears in your top navigation bar"
                    />
                    <div className="flex justify-end">
                        <Button type="submit">Save Changes</Button>
                    </div>
                </form>
            </Card>

            {/* AI Provider Placeholder */}
            <Card
                title="AI Provider"
                subtitle="Configure your AI extraction engine"
                action={<Badge variant="warning">Coming Soon</Badge>}
            >
                <div className="space-y-4">
                    <div className="p-6 rounded-xl border-2 border-dashed border-surface-200 bg-surface-50 text-center">
                        <Brain className="w-10 h-10 text-surface-300 mx-auto mb-3" />
                        <h4 className="text-sm font-semibold text-surface-600 mb-1">AI Integration</h4>
                        <p className="text-xs text-surface-400 max-w-sm mx-auto">
                            Connect your preferred AI provider (OpenAI, Google Gemini, Claude) to automatically extract assignment details from pasted messages.
                        </p>
                        <div className="flex justify-center gap-3 mt-4">
                            <div className="px-3 py-1.5 rounded-lg bg-white border border-surface-200 text-xs font-medium text-surface-500">
                                OpenAI
                            </div>
                            <div className="px-3 py-1.5 rounded-lg bg-white border border-surface-200 text-xs font-medium text-surface-500">
                                Gemini
                            </div>
                            <div className="px-3 py-1.5 rounded-lg bg-white border border-surface-200 text-xs font-medium text-surface-500">
                                Claude
                            </div>
                        </div>
                    </div>
                    <Input
                        label="API Key"
                        type="password"
                        placeholder="sk-..."
                        disabled
                        helperText="Your API key will be stored securely"
                    />
                </div>
            </Card>

            {/* Notification Placeholder */}
            <Card
                title="Notifications"
                subtitle="Configure how you get reminded"
                action={<Badge variant="warning">Coming Soon</Badge>}
            >
                <div className="space-y-4">
                    <div className="p-6 rounded-xl border-2 border-dashed border-surface-200 bg-surface-50 text-center">
                        <Bell className="w-10 h-10 text-surface-300 mx-auto mb-3" />
                        <h4 className="text-sm font-semibold text-surface-600 mb-1">Smart Notifications</h4>
                        <p className="text-xs text-surface-400 max-w-sm mx-auto">
                            Get reminded about upcoming deadlines via email, push notifications, or in-app alerts.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {[
                            { label: 'Email Reminders', desc: 'Get an email 24 hours before deadlines' },
                            { label: 'Push Notifications', desc: 'Browser push notifications for urgent items' },
                            { label: 'Daily Digest', desc: 'Morning summary of today\'s tasks and deadlines' },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-surface-50">
                                <div>
                                    <p className="text-sm font-medium text-surface-600">{item.label}</p>
                                    <p className="text-xs text-surface-400">{item.desc}</p>
                                </div>
                                <div className="w-10 h-6 rounded-full bg-surface-200 relative cursor-not-allowed opacity-50">
                                    <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Settings;
