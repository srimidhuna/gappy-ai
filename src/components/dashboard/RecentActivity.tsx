import React from 'react';
import { Clock, Mail, Plus, FileText, BookOpen, Smartphone } from 'lucide-react';
import type { Assignment, AssignmentSource } from '../../types';

interface RecentActivityProps {
    assignments: Assignment[];
    isLoading?: boolean;
}

const sourceConfig: Record<AssignmentSource, { icon: React.FC<{ className?: string }>; label: string; color: string; bg: string }> = {
    'whatsapp': {
        icon: Smartphone,
        label: 'WhatsApp',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
    },
    'google-classroom': {
        icon: BookOpen,
        label: 'Classroom',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
    },
    'email': {
        icon: Mail,
        label: 'Email',
        color: 'text-blue-500',
        bg: 'bg-blue-50',
    },
    'manual': {
        icon: Plus,
        label: 'Manual Entry',
        color: 'text-surface-500',
        bg: 'bg-surface-50',
    },
    'notes': {
        icon: FileText,
        label: 'Notes',
        color: 'text-amber-500',
        bg: 'bg-amber-50',
    },
    'college-portal': {
        icon: BookOpen,
        label: 'College Portal',
        color: 'text-violet-500',
        bg: 'bg-violet-50',
    },
    'lab': {
        icon: FileText,
        label: 'Lab',
        color: 'text-cyan-500',
        bg: 'bg-cyan-50',
    },
    'project': {
        icon: FileText,
        label: 'Project',
        color: 'text-indigo-500',
        bg: 'bg-indigo-50',
    },
};

const formatRelativeTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const SkeletonActivity: React.FC = () => (
    <div className="flex items-start gap-3 animate-pulse">
        <div className="w-8 h-8 rounded-lg bg-surface-100 flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1.5 py-1">
            <div className="h-3.5 w-48 bg-surface-100 rounded" />
            <div className="h-3 w-28 bg-surface-50 rounded" />
        </div>
        <div className="h-3 w-10 bg-surface-100 rounded mt-1" />
    </div>
);

const EmptyActivity: React.FC = () => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mb-3">
            <Clock className="w-6 h-6 text-surface-400" />
        </div>
        <p className="text-sm font-medium text-surface-600">No recent activity</p>
        <p className="text-xs text-surface-400 mt-1">Assignments you add will appear here.</p>
    </div>
);

export const RecentActivity: React.FC<RecentActivityProps> = ({ assignments, isLoading }) => {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => <SkeletonActivity key={i} />)}
            </div>
        );
    }

    if (assignments.length === 0) return <EmptyActivity />;

    return (
        <div className="space-y-3">
            {assignments.map((a, idx) => {
                const src = sourceConfig[a.source];
                const SourceIcon = src.icon;
                return (
                    <div key={a.id} className="flex items-start gap-3 group">
                        {/* Timeline line */}
                        <div className="relative flex flex-col items-center flex-shrink-0">
                            <div className={`w-8 h-8 rounded-lg ${src.bg} flex items-center justify-center`}>
                                <SourceIcon className={`w-4 h-4 ${src.color}`} />
                            </div>
                            {idx < assignments.length - 1 && (
                                <div className="w-px h-full bg-surface-100 mt-1 absolute top-8 bottom-0 left-1/2 -translate-x-1/2 min-h-[12px]" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0 pb-3">
                            <p className="text-sm font-medium text-surface-700 truncate group-hover:text-primary-600 transition-colors">
                                {a.title}
                            </p>
                            <p className="text-xs text-surface-400 mt-0.5">
                                Added via {src.label} · {a.subject}
                            </p>
                        </div>
                        <p className="text-xs text-surface-400 flex-shrink-0 mt-1 tabular-nums">
                            {formatRelativeTime(a.createdAt)}
                        </p>
                    </div>
                );
            })}
        </div>
    );
};
