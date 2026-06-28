import React from 'react';
import { Lightbulb, ArrowRight } from 'lucide-react';

interface Suggestion {
    id: string;
    text: string;
    type: 'deadline' | 'priority' | 'schedule';
}

interface SuggestionCardProps {
    suggestions?: Suggestion[];
}

const defaultSuggestions: Suggestion[] = [
    { id: 's1', text: 'You have 3 assignments due this week. Consider prioritizing the Data Structures report.', type: 'priority' },
    { id: 's2', text: 'Block 2 hours tomorrow morning for Calculus problem set — it\'s due in 2 days.', type: 'schedule' },
    { id: 's3', text: 'The Physics lab write-up is overdue. Submit as soon as possible.', type: 'deadline' },
];

const typeColors = {
    deadline: 'bg-red-50 text-red-600 border-red-100',
    priority: 'bg-amber-50 text-amber-600 border-amber-100',
    schedule: 'bg-emerald-50 text-emerald-600 border-emerald-100',
};

const typeLabels = {
    deadline: '⏰ Deadline',
    priority: '🔥 Priority',
    schedule: '📅 Schedule',
};

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
    suggestions = defaultSuggestions,
}) => {
    return (
        <div className="bg-white rounded-xl border border-surface-200 p-5">
            <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-semibold text-surface-800">AI Suggestions</h3>
                <span className="ml-auto text-[10px] font-medium text-surface-400 bg-surface-100 px-2 py-0.5 rounded-full">
                    Coming Soon
                </span>
            </div>

            <div className="space-y-3">
                {suggestions.map((suggestion) => (
                    <div
                        key={suggestion.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border ${typeColors[suggestion.type]} transition-all hover:shadow-sm`}
                    >
                        <div className="flex-1">
                            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-75">
                                {typeLabels[suggestion.type]}
                            </span>
                            <p className="text-xs mt-1 leading-relaxed opacity-90">{suggestion.text}</p>
                        </div>
                        <button className="mt-1 p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer">
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
