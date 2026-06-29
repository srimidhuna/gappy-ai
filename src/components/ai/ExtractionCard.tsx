import React from 'react';
import {
    FileText, Calendar, BookOpen, Sparkles, Loader2, User,
    Link, Clock, AlertTriangle, CheckCircle2, Info, Tag, Copy,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import type { ExtractedData } from '../../services/aiService';
import type { Assignment } from '../../types';

interface ExtractionCardProps {
    extracted?: ExtractedData | null;
    duplicates?: Assignment[];
    loading?: boolean;
    onAccept?: () => void;
    onDismiss?: () => void;
    onSaveAsReview?: () => void;
    // Legacy flat props fallback
    title?: string;
    subject?: string;
    dueDate?: string;
    source?: string;
    confidence?: number;
}

const ConfidenceBar: React.FC<{ score: number }> = ({ score }) => {
    const color =
        score >= 80 ? 'bg-emerald-500' :
        score >= 60 ? 'bg-amber-400' :
        'bg-red-400';
    const label =
        score >= 80 ? 'High confidence' :
        score >= 60 ? 'Medium — review recommended' :
        'Low — needs manual review';

    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-surface-500 uppercase tracking-wide">AI Confidence</span>
                <span className={`text-xs font-bold ${score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                    {score}%
                </span>
            </div>
            <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${score}%` }} />
            </div>
            <p className={`text-[10px] mt-1 ${score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                {label}
            </p>
        </div>
    );
};

const FieldRow: React.FC<{ icon: React.ReactNode; label: string; value?: string | null }> = ({ icon, label, value }) => {
    if (!value) return null;
    return (
        <div className="flex items-start gap-2 text-xs">
            <span className="text-surface-400 mt-0.5 flex-shrink-0">{icon}</span>
            <span className="text-surface-400 font-medium w-20 flex-shrink-0">{label}</span>
            <span className="text-surface-700 font-medium break-all">{value}</span>
        </div>
    );
};

export const ExtractionCard: React.FC<ExtractionCardProps> = ({
    extracted,
    duplicates = [],
    loading = false,
    onAccept,
    onDismiss,
    onSaveAsReview,
    // legacy
    title: legacyTitle,
    subject: legacySubject,
    dueDate: legacyDate,
    source: legacySource,
    confidence: legacyConf,
}) => {
    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-surface-200 p-5 flex flex-col items-center justify-center gap-3 min-h-[220px]">
                <div className="relative">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                    <Sparkles className="w-3 h-3 text-amber-400 absolute -top-1 -right-1" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-surface-700">AI is analysing your message…</p>
                    <p className="text-xs text-surface-400 mt-1">Extracting title, subject, deadline, professor & more</p>
                </div>
            </div>
        );
    }

    // Use extracted object if present, else fall back to legacy flat props
    const data = extracted ?? null;
    const title = data?.title ?? legacyTitle ?? 'Assignment Title';
    const subject = data?.subject ?? legacySubject ?? 'Subject';
    const dueDate = data?.dueDate
        ? new Date(data.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
        : (legacyDate ?? 'No deadline detected');
    const source = data?.source ?? legacySource ?? 'unknown';
    const confidence = data?.confidence ?? legacyConf ?? 80;
    const isLowConfidence = confidence < 60;

    const formattedDueTime = data?.dueTime ? ` at ${data.dueTime}` : '';

    return (
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-5 pb-4 relative">
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-primary-100/40 to-transparent rounded-bl-full pointer-events-none" />

                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary-500" />
                        <span className="text-xs font-semibold text-primary-600">AI Extracted</span>
                    </div>
                    <Badge variant={confidence >= 80 ? 'success' : confidence >= 60 ? 'warning' : 'danger'}>
                        {confidence}% confidence
                    </Badge>
                </div>

                <h4 className="text-sm font-bold text-surface-800 leading-snug">{title}</h4>
                {data?.summary && (
                    <p className="text-xs text-surface-500 mt-1.5 leading-relaxed italic">{data.summary}</p>
                )}
            </div>

            {/* Confidence bar */}
            <div className="px-5 pb-3">
                <ConfidenceBar score={confidence} />
            </div>

            {/* Low confidence warning */}
            {isLowConfidence && (
                <div className="mx-5 mb-3 flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-semibold text-red-700">Low Confidence</p>
                        <p className="text-xs text-red-600 mt-0.5">The AI was uncertain about some fields. Consider saving as "Needs Review" and editing manually.</p>
                    </div>
                </div>
            )}

            {/* Duplicate warning */}
            {duplicates.length > 0 && (
                <div className="mx-5 mb-3 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <Copy className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-semibold text-amber-700">Possible Duplicate Detected</p>
                        <p className="text-xs text-amber-600 mt-0.5">
                            Similar assignment already exists: <strong>"{duplicates[0].title}"</strong>
                        </p>
                    </div>
                </div>
            )}

            {/* Extracted fields */}
            <div className="px-5 pb-4 space-y-2.5">
                <FieldRow icon={<BookOpen className="w-3.5 h-3.5" />} label="Subject" value={subject} />
                <FieldRow icon={<Calendar className="w-3.5 h-3.5" />} label="Due Date" value={`${dueDate}${formattedDueTime}`} />
                <FieldRow icon={<User className="w-3.5 h-3.5" />} label="Professor" value={data?.professor} />
                <FieldRow icon={<FileText className="w-3.5 h-3.5" />} label="Source" value={source.replace(/-/g, ' ')} />
                <FieldRow icon={<Tag className="w-3.5 h-3.5" />} label="Submit via" value={data?.submissionMode} />
                {data?.submissionLink && (
                    <div className="flex items-start gap-2 text-xs">
                        <Link className="w-3.5 h-3.5 text-surface-400 mt-0.5 flex-shrink-0" />
                        <span className="text-surface-400 font-medium w-20 flex-shrink-0">Link</span>
                        <a
                            href={data.submissionLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:underline break-all"
                        >
                            {data.submissionLink}
                        </a>
                    </div>
                )}
                {data?.estimatedHours && (
                    <FieldRow icon={<Clock className="w-3.5 h-3.5" />} label="Est. Time" value={`${data.estimatedHours}h`} />
                )}
                {data?.notes && (
                    <div className="flex items-start gap-2 text-xs pt-1">
                        <Info className="w-3.5 h-3.5 text-surface-400 mt-0.5 flex-shrink-0" />
                        <span className="text-surface-400 font-medium w-20 flex-shrink-0">Notes</span>
                        <span className="text-surface-600 italic">{data.notes}</span>
                    </div>
                )}
            </div>

            {/* Action buttons */}
            <div className="px-5 pb-5 pt-3 border-t border-surface-100 flex flex-col gap-2">
                <div className="flex gap-2">
                    <button
                        onClick={onAccept}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Save Assignment
                    </button>
                    <button
                        onClick={onDismiss}
                        className="flex-1 py-2 text-xs font-semibold text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                    >
                        ✕ Dismiss
                    </button>
                </div>
                {(isLowConfidence || duplicates.length > 0) && onSaveAsReview && (
                    <button
                        onClick={onSaveAsReview}
                        className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Save as "Needs Review"
                    </button>
                )}
            </div>
        </div>
    );
};
