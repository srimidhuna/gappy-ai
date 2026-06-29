import React from 'react';

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    description?: string;
    disabled?: boolean;
    id?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    checked,
    onChange,
    label,
    description,
    disabled = false,
    id,
}) => {
    const switchId = id ?? `toggle-${Math.random().toString(36).slice(2)}`;
    return (
        <div className="flex items-center justify-between gap-4">
            {(label || description) && (
                <div className="flex-1 min-w-0">
                    {label && (
                        <label
                            htmlFor={switchId}
                            className={`text-sm font-medium cursor-pointer ${disabled ? 'text-surface-400' : 'text-surface-700'}`}
                        >
                            {label}
                        </label>
                    )}
                    {description && (
                        <p className="text-xs text-surface-400 mt-0.5">{description}</p>
                    )}
                </div>
            )}
            <button
                id={switchId}
                role="switch"
                aria-checked={checked}
                onClick={() => !disabled && onChange(!checked)}
                disabled={disabled}
                className={`relative inline-flex w-10 h-6 rounded-full transition-colors duration-200 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 ${
                    disabled
                        ? 'opacity-40 cursor-not-allowed'
                        : 'cursor-pointer'
                } ${checked ? 'bg-primary-500' : 'bg-surface-200'}`}
            >
                <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                        checked ? 'translate-x-4' : 'translate-x-0'
                    }`}
                />
            </button>
        </div>
    );
};
