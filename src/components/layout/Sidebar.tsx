import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Inbox,
    ClipboardList,
    CalendarRange,
    Settings,
    Rocket,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/inbox', label: 'Inbox', icon: Inbox },
    { to: '/assignments', label: 'Assignments', icon: ClipboardList },
    { to: '/planner', label: 'Planner', icon: CalendarRange },
    { to: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
    const { sidebarCollapsed, toggleSidebar } = useUIStore();

    return (
        <aside
            className={`fixed left-0 top-0 h-screen bg-white border-r border-surface-200 flex flex-col transition-all duration-300 z-40 ${sidebarCollapsed ? 'w-[72px]' : 'w-[240px]'
                }`}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 h-16 border-b border-surface-100">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
                    <Rocket className="w-4.5 h-4.5 text-white" />
                </div>
                {!sidebarCollapsed && (
                    <span className="text-base font-bold text-surface-800 tracking-tight">
                        DeadlinePilot
                    </span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                ? 'bg-primary-50 text-primary-700'
                                : 'text-surface-500 hover:bg-surface-50 hover:text-surface-700'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Collapse Toggle */}
            <div className="px-3 py-4 border-t border-surface-100">
                <button
                    onClick={toggleSidebar}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-surface-400 hover:bg-surface-50 hover:text-surface-600 transition-colors cursor-pointer"
                >
                    {sidebarCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <>
                            <ChevronLeft className="w-4 h-4" />
                            <span>Collapse</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
};
