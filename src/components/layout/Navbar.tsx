import React from 'react';
import { Search, Bell } from 'lucide-react';
import { mockUser } from '../../utils/mockData';
import { useUIStore } from '../../store/uiStore';

export const Navbar: React.FC = () => {
    const { sidebarCollapsed } = useUIStore();

    return (
        <header
            className={`fixed top-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-surface-200 flex items-center justify-between px-6 z-30 transition-all duration-300 ${sidebarCollapsed ? 'left-[72px]' : 'left-[240px]'
                }`}
        >
            {/* Workspace Name */}
            <div>
                <h1 className="text-sm font-semibold text-surface-800">{mockUser.workspace}</h1>
                <p className="text-xs text-surface-400">Stay on track with your deadlines</p>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="w-64 pl-10 pr-4 py-2 rounded-xl bg-surface-50 border border-surface-200 text-sm text-surface-700 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 rounded-xl text-surface-400 hover:bg-surface-50 hover:text-surface-600 transition-colors cursor-pointer">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
                </button>

                {/* Avatar */}
                <div className="flex items-center gap-3 pl-3 border-l border-surface-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-surface-700">{mockUser.name}</p>
                        <p className="text-xs text-surface-400">{mockUser.email}</p>
                    </div>
                    <img
                        src={mockUser.avatar}
                        alt={mockUser.name}
                        className="w-9 h-9 rounded-xl bg-primary-100 object-cover"
                    />
                </div>
            </div>
        </header>
    );
};
