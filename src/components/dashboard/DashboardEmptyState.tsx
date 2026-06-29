import React from 'react';
import { ClipboardList, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardEmptyStateProps {
    message?: string;
    description?: string;
}

export const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({
    message = 'No assignments yet',
    description = 'Start by adding your first assignment to see your dashboard come alive.',
}) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-primary-50 flex items-center justify-center">
                    <ClipboardList className="w-10 h-10 text-primary-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-amber-600">0</span>
                </div>
            </div>
            <h3 className="text-lg font-semibold text-surface-700 mb-2">{message}</h3>
            <p className="text-sm text-surface-400 max-w-xs leading-relaxed mb-6">{description}</p>
            <button
                onClick={() => navigate('/assignments')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
                <Plus className="w-4 h-4" />
                Add Your First Assignment
            </button>
        </div>
    );
};
