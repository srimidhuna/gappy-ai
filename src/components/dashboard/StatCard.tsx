import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: number;
    icon: LucideIcon;
    iconColor: string;
    iconBg: string;
    trend?: string;
    trendUp?: boolean;
    isLoading?: boolean;
}

export const StatCardSkeleton: React.FC = () => (
    <div className="bg-white rounded-xl border border-surface-200 p-5 animate-pulse">
        <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-surface-100 flex-shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
                <div className="h-7 w-12 bg-surface-100 rounded" />
                <div className="h-3 w-24 bg-surface-100 rounded" />
            </div>
        </div>
    </div>
);

export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    icon: Icon,
    iconColor,
    iconBg,
    isLoading = false,
}) => {
    if (isLoading) return <StatCardSkeleton />;

    return (
        <div className="bg-white rounded-xl border border-surface-200 p-5 flex items-start gap-4 hover:shadow-md transition-all duration-200 group">
            <div
                className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}
            >
                <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div>
                <p className="text-2xl font-bold text-surface-800 tabular-nums">{value}</p>
                <p className="text-xs text-surface-500 mt-0.5 font-medium">{label}</p>
            </div>
        </div>
    );
};
