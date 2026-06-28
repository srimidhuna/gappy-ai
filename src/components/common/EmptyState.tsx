import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    actionLabel?: string;
    onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    icon,
    actionLabel,
    onAction,
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-400 mb-4">
                {icon || <Inbox className="w-8 h-8" />}
            </div>
            <h3 className="text-base font-semibold text-surface-700 mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-surface-500 text-center max-w-sm mb-4">
                    {description}
                </p>
            )}
            {actionLabel && onAction && (
                <Button onClick={onAction} size="sm">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};
