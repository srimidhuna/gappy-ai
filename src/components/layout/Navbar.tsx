import React, { useRef, useState, useEffect } from 'react';
import { Search, Bell, Command } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useAssignmentStore } from '../../store/assignmentStore';
import { NotificationPanel } from '../notifications/NotificationPanel';
import { GlobalSearch } from '../search/GlobalSearch';

export const Navbar: React.FC = () => {
    const { sidebarCollapsed } = useUIStore();
    const { profile } = useSettingsStore();
    const { assignments } = useAssignmentStore();
    const { unreadCount, generateNotifications } = useNotificationStore();
    const [notifOpen, setNotifOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const bellRef = useRef<HTMLButtonElement>(null);

    // Generate notifications on mount + whenever assignments change
    useEffect(() => {
        generateNotifications(assignments);
    }, [assignments, generateNotifications]);

    // Global shortcut: Ctrl+K / Cmd+K to open search
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    const count = unreadCount();

    return (
        <>
            <header
                className={`fixed top-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-surface-200 flex items-center justify-between px-6 z-30 transition-all duration-300 ${
                    sidebarCollapsed ? 'left-[72px]' : 'left-[240px]'
                }`}
            >
                {/* Workspace Name */}
                <div>
                    <h1 className="text-sm font-semibold text-surface-800">{profile.semester}</h1>
                    <p className="text-xs text-surface-400">Stay on track with your deadlines</p>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-3">
                    {/* Search trigger */}
                    <button
                        onClick={() => setSearchOpen(true)}
                        className="hidden md:flex items-center gap-2 w-60 pl-4 pr-3 py-2 rounded-xl bg-surface-50 border border-surface-200 text-sm text-surface-400 hover:border-primary-300 hover:bg-primary-50/50 transition-all cursor-pointer group"
                    >
                        <Search className="w-4 h-4 group-hover:text-primary-500 transition-colors" />
                        <span className="flex-1 text-left text-sm">Search anything…</span>
                        <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-surface-200 text-[10px] font-mono text-surface-300 bg-white">
                            <Command className="w-2.5 h-2.5" />K
                        </kbd>
                    </button>

                    {/* Mobile search icon */}
                    <button
                        onClick={() => setSearchOpen(true)}
                        className="md:hidden p-2 rounded-xl text-surface-400 hover:bg-surface-50 hover:text-surface-600 transition-colors cursor-pointer"
                        title="Search"
                    >
                        <Search className="w-5 h-5" />
                    </button>

                    {/* Notifications bell */}
                    <button
                        ref={bellRef}
                        onClick={() => setNotifOpen((o) => !o)}
                        className={`relative p-2 rounded-xl transition-colors cursor-pointer ${
                            notifOpen
                                ? 'bg-primary-50 text-primary-600'
                                : 'text-surface-400 hover:bg-surface-50 hover:text-surface-600'
                        }`}
                        title="Notifications"
                    >
                        <Bell className="w-5 h-5" />
                        {count > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold px-1 leading-none">
                                {count > 9 ? '9+' : count}
                            </span>
                        )}
                    </button>

                    {/* Avatar */}
                    <div className="flex items-center gap-3 pl-3 border-l border-surface-200">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-surface-700">{profile.name}</p>
                            <p className="text-xs text-surface-400">{profile.email}</p>
                        </div>
                        <img
                            src={profile.avatar}
                            alt={profile.name}
                            className="w-9 h-9 rounded-xl bg-primary-100 object-cover"
                        />
                    </div>
                </div>
            </header>

            {/* Global search overlay */}
            <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

            {/* Notification panel dropdown */}
            <NotificationPanel
                isOpen={notifOpen}
                onClose={() => setNotifOpen(false)}
                anchorRef={bellRef}
            />
        </>
    );
};
