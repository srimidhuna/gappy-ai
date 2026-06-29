import React, { useEffect, useRef } from 'react';
import { Bell, X, CheckCheck, Trash2, AlertTriangle, Calendar, Clock, Flag } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useNotificationStore, type AppNotification, type NotificationType } from '../../store/notificationStore';
import { useAssignmentStore } from '../../store/assignmentStore';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    anchorRef: React.RefObject<HTMLButtonElement | null>;
}

const typeConfig: Record<NotificationType, { icon: React.ReactNode; bg: string; border: string; dot: string }> = {
    'overdue': {
        icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
        bg: 'bg-red-50',
        border: 'border-red-100',
        dot: 'bg-red-500',
    },
    'due-today': {
        icon: <Calendar className="w-4 h-4 text-amber-500" />,
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        dot: 'bg-amber-500',
    },
    'due-tomorrow': {
        icon: <Clock className="w-4 h-4 text-blue-500" />,
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        dot: 'bg-blue-500',
    },
    'high-priority': {
        icon: <Flag className="w-4 h-4 text-violet-500" />,
        bg: 'bg-violet-50',
        border: 'border-violet-100',
        dot: 'bg-violet-500',
    },
};

const formatTime = (iso: string): string => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const h = Math.floor(diffMins / 60);
    if (h < 24) return `${h}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const NotificationItem: React.FC<{
    notification: AppNotification;
    onRead: (id: string) => void;
    onClear: (id: string) => void;
}> = ({ notification: n, onRead, onClear }) => {
    const cfg = typeConfig[n.type];
    return (
        <div
            className={`relative flex items-start gap-3 p-3 rounded-xl border transition-colors group cursor-pointer ${
                n.read ? 'bg-white border-surface-100' : `${cfg.bg} ${cfg.border}`
            }`}
            onClick={() => onRead(n.id)}
        >
            {/* Unread dot */}
            {!n.read && (
                <span className={`absolute top-3 right-3 w-2 h-2 rounded-full ${cfg.dot}`} />
            )}

            {/* Icon */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${n.read ? 'bg-surface-100' : cfg.bg}`}>
                {cfg.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-4">
                <p className={`text-xs font-semibold ${n.read ? 'text-surface-500' : 'text-surface-800'}`}>
                    {n.title}
                </p>
                <p className={`text-xs mt-0.5 leading-relaxed ${n.read ? 'text-surface-400' : 'text-surface-600'}`}>
                    {n.message}
                </p>
                <p className="text-[10px] text-surface-400 mt-1">{formatTime(n.createdAt)}</p>
            </div>

            {/* Clear button */}
            <button
                onClick={(e) => { e.stopPropagation(); onClear(n.id); }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded text-surface-300 hover:text-red-400 transition-all cursor-pointer"
                title="Dismiss"
            >
                <X className="w-3 h-3" />
            </button>
        </div>
    );
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, anchorRef }) => {
    const { notifications, markAsRead, markAllAsRead, clearNotification, clearAll } = useNotificationStore();
    const { assignments } = useAssignmentStore();
    const { generateNotifications } = useNotificationStore();
    const panelRef = useRef<HTMLDivElement>(null);

    // Generate notifications from current assignments on open
    useEffect(() => {
        if (isOpen) generateNotifications(assignments);
    }, [isOpen, assignments, generateNotifications]);

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(e.target as Node) &&
                anchorRef.current &&
                !anchorRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen, onClose, anchorRef]);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const unread = notifications.filter((n) => !n.read).length;
    const sortedNotifs = [...notifications].sort((a, b) => {
        // Unread first, then by time
        if (a.read !== b.read) return a.read ? 1 : -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return createPortal(
        <div
            ref={panelRef}
            className="fixed top-16 right-4 w-[360px] max-h-[calc(100vh-80px)] bg-white rounded-2xl shadow-2xl border border-surface-200 z-50 flex flex-col"
            style={{ animation: 'fadeInDown 0.2s ease-out' }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
                <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary-500" />
                    <span className="text-sm font-semibold text-surface-800">Notifications</span>
                    {unread > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                            {unread}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {unread > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer"
                            title="Mark all as read"
                        >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Mark all read
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button
                            onClick={clearAll}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-surface-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                            title="Clear all"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Notification list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {sortedNotifs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-14 h-14 rounded-full bg-surface-100 flex items-center justify-center mb-3">
                            <Bell className="w-7 h-7 text-surface-300" />
                        </div>
                        <p className="text-sm font-medium text-surface-600">All caught up!</p>
                        <p className="text-xs text-surface-400 mt-1">No new notifications.</p>
                    </div>
                ) : (
                    sortedNotifs.map((n) => (
                        <NotificationItem
                            key={n.id}
                            notification={n}
                            onRead={markAsRead}
                            onClear={clearNotification}
                        />
                    ))
                )}
            </div>

            {/* Footer legend */}
            <div className="px-4 py-3 border-t border-surface-100 bg-surface-50/50 rounded-b-2xl">
                <div className="flex flex-wrap items-center gap-3">
                    {Object.entries(typeConfig).map(([type, cfg]) => (
                        <div key={type} className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                            <span className="text-[10px] text-surface-400 capitalize">
                                {type.replace(/-/g, ' ')}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>,
        document.body
    );
};
