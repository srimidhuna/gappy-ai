import React from 'react';

interface LoaderProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
};

export const Loader: React.FC<LoaderProps> = ({ size = 'md', className = '' }) => {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div
                className={`${sizeClasses[size]} border-3 border-surface-200 border-t-primary-600 rounded-full animate-spin`}
            />
        </div>
    );
};
