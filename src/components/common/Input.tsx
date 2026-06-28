import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, helperText, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`w-full rounded-lg border bg-white text-surface-800 placeholder-surface-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-surface-100 disabled:cursor-not-allowed ${icon ? 'pl-10' : 'pl-4'
                            } pr-4 py-2.5 text-sm ${error ? 'border-danger' : 'border-surface-300'
                            } ${className}`}
                        {...props}
                    />
                </div>
                {error && <p className="mt-1 text-xs text-danger">{error}</p>}
                {helperText && !error && (
                    <p className="mt-1 text-xs text-surface-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
