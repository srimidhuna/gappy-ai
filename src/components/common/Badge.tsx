import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
    dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-surface-100 text-surface-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    info: 'bg-cyan-50 text-cyan-700',
    primary: 'bg-primary-50 text-primary-700',
};

const dotColors: Record<BadgeVariant, string> = {
    default: 'bg-surface-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-cyan-500',
    primary: 'bg-primary-500',
};

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    className = '',
    dot = false,
}) => {
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
        >
            {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
            {children}
        </span>
    );
};
