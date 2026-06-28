import React from 'react';

interface CardProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    action?: React.ReactNode;
    className?: string;
    noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    title,
    subtitle,
    action,
    className = '',
    noPadding = false,
}) => {
    return (
        <div
            className={`bg-white rounded-xl border border-surface-200 shadow-sm transition-shadow hover:shadow-md ${className}`}
        >
            {(title || action) && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
                    <div>
                        {title && <h3 className="text-base font-semibold text-surface-800">{title}</h3>}
                        {subtitle && <p className="text-sm text-surface-500 mt-0.5">{subtitle}</p>}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className={noPadding ? '' : 'p-6'}>{children}</div>
        </div>
    );
};
