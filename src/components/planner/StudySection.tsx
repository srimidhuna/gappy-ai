import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Assignment } from '../../types';
import { StudyTaskCard } from './StudyTaskCard';

interface StudySectionProps {
    title: string;
    subtitle?: string;
    assignments: Assignment[];
    defaultOpen?: boolean;
    emptyMessage?: string;
    icon?: React.ReactNode;
    accentColor?: string;
}

export const StudySection: React.FC<StudySectionProps> = ({
    title,
    subtitle,
    assignments,
    defaultOpen = true,
    emptyMessage = 'No assignments here.',
    icon,
    accentColor = 'bg-primary-500',
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-sm">
            {/* Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-50 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className={`w-2 h-8 rounded-full ${accentColor}`} />
                    )}
                    <div className="text-left">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-surface-800">{title}</h3>
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-surface-100 text-xs font-bold text-surface-600">
                                {assignments.length}
                            </span>
                        </div>
                        {subtitle && (
                            <p className="text-xs text-surface-400 mt-0.5">{subtitle}</p>
                        )}
                    </div>
                </div>
                {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-surface-400 flex-shrink-0" />
                ) : (
                    <ChevronRight className="w-4 h-4 text-surface-400 flex-shrink-0" />
                )}
            </button>

            {/* Body */}
            {isOpen && (
                <div className="px-5 pb-5 space-y-3 border-t border-surface-100">
                    {assignments.length === 0 ? (
                        <div className="py-8 text-center">
                            <p className="text-sm text-surface-400">{emptyMessage}</p>
                        </div>
                    ) : (
                        <div className="pt-3 space-y-3">
                            {assignments.map((a) => (
                                <StudyTaskCard key={a.id} assignment={a} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
