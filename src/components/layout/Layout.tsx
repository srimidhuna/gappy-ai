import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { ToastContainer } from '../common/Toast';
import { useUIStore } from '../../store/uiStore';

export const Layout: React.FC = () => {
    const { sidebarCollapsed, toasts, removeToast } = useUIStore();

    return (
        <div className="min-h-screen bg-surface-50">
            <Sidebar />
            <Navbar />
            <main
                className={`pt-16 transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[240px]'
                    }`}
            >
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
            <ToastContainer toasts={toasts} onDismiss={removeToast} />
        </div>
    );
};
