import React from 'react';
import { FileText, Calendar, BookOpen, Sparkles, Loader2 } from 'lucide-react';
import { Badge } from '../common/Badge';

interface ExtractionCardProps {
    title?: string;
    subject?: string;
    dueDate?: string;
    source?: string;
    confidence?: number;
    loading?: boolean;
    onAccept?: () => void;
    onDismiss?: () => void;
}

export const ExtractionCard: React.FC<ExtractionCardProps> = ({
    title = 'Assignment Title',
    subject = 'Subject',
    dueDate = 'Not detected',
    source = 'Unknown',
    confidence = 0,
    loading = false,
    onAccept,
    onDismiss,
}) => {
    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-surface-200 p-5 flex flex-col items-center justify-center gap-3 min-h-[180px]">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                <span className="text-sm text-surface-500 font-medium">AI is extracting assignment details...</span>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-surface-200 p-5 relative overflow-hidden">
            {/* AI confidence glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary-100/50 to-transparent rounded-bl-full" />

            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary-500" />
                    <span className="text-xs font-medium text-primary-600">AI Extracted</span>
                </div>
                <Badge variant="primary">{confidence}% match</Badge>
            </div>

            <h4 className="text-sm font-semibold text-surface-800 mb-3">{title}</h4>

            <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-surface-500">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{subject}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-surface-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{dueDate}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-surface-500">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Source: {source}</span>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-surface-100 flex gap-2">
                <button
                    onClick={onAccept}
                    className="flex-1 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors cursor-pointer"
                >
                    ✓ Save Assignment
                </button>
                <button
                    onClick={onDismiss}
                    className="flex-1 py-1.5 text-xs font-medium text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                >
                    ✕ Dismiss
                </button>
            </div>
        </div>
    );
};
