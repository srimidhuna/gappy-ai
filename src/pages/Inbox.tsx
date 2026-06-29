import React, { useState } from 'react';
import { Inbox as InboxIcon, Zap, Brain } from 'lucide-react';
import { PromptInput } from '../components/ai/PromptInput';
import { ExtractionCard } from '../components/ai/ExtractionCard';
import { SuggestionCard } from '../components/ai/SuggestionCard';
import { useAssignmentStore } from '../store/assignmentStore';
import { useUIStore } from '../store/uiStore';
import type { AssignmentSource } from '../types';
import {
    extractAssignmentFromText,
    generateSummary,
    detectDuplicates,
    estimateStudyHours,
    type ExtractedData,
} from '../services/aiService';
import { useNavigate } from 'react-router-dom';

const Inbox: React.FC = () => {
    const { assignments, addAssignment } = useAssignmentStore();
    const { addToast } = useUIStore();
    const navigate = useNavigate();

    const [isExtracting, setIsExtracting] = useState(false);
    const [extracted, setExtracted] = useState<ExtractedData | null>(null);
    const [duplicates, setDuplicates] = useState<typeof assignments>([]);

    const handleExtract = async (text: string, source: AssignmentSource) => {
        setIsExtracting(true);
        setExtracted(null);
        setDuplicates([]);
        try {
            const data = await extractAssignmentFromText(text, source);

            // Enrich with AI summary + estimated hours
            try {
                const summaryResult = await generateSummary({
                    title: data.title,
                    subject: data.subject,
                    description: data.description,
                    dueDate: data.dueDate ?? '',
                    priority: data.priority,
                    professor: data.professor ?? undefined,
                });
                data.summary = summaryResult.summary;
                if (!data.estimatedHours) {
                    data.estimatedHours = summaryResult.estimatedHours;
                }
            } catch {
                // Fallback to client-side estimation
                data.estimatedHours = estimateStudyHours(data.priority, source, data.title);
            }

            // Duplicate detection
            const dups = detectDuplicates(
                { title: data.title, subject: data.subject, dueDate: data.dueDate },
                assignments
            );
            setDuplicates(dups);

            setExtracted(data);
        } catch (error) {
            console.error('Extraction failed:', error);
            addToast({ type: 'error', message: 'Failed to extract assignment. Is the AI backend running?' });
        } finally {
            setIsExtracting(false);
        }
    };

    const saveAssignment = (status: 'pending' | 'needs-review') => {
        if (!extracted) return;

        addAssignment({
            title: extracted.title || 'Untitled Assignment',
            subject: extracted.subject || 'General',
            description: extracted.description || `Auto-extracted from ${extracted.source} message.`,
            dueDate: extracted.dueDate || new Date().toISOString(),
            dueTime: extracted.dueTime ?? undefined,
            status,
            priority: extracted.priority || 'medium',
            source: extracted.source as AssignmentSource,
            professor: extracted.professor ?? undefined,
            submissionMode: extracted.submissionMode ?? undefined,
            submissionLink: extracted.submissionLink ?? undefined,
            notes: extracted.notes ?? undefined,
            estimatedHours: extracted.estimatedHours,
            confidence: extracted.confidence,
            summary: extracted.summary,
        });

        const msg = status === 'needs-review'
            ? 'Saved as "Needs Review" — check Assignments to edit details.'
            : 'Assignment saved successfully!';
        addToast({ type: 'success', message: msg });
        setExtracted(null);
        setDuplicates([]);
        navigate('/assignments');
    };

    const handleAccept = () => saveAssignment('pending');
    const handleSaveAsReview = () => saveAssignment('needs-review');
    const handleDismiss = () => { setExtracted(null); setDuplicates([]); };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Page header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-800 flex items-center gap-2">
                        <InboxIcon className="w-7 h-7 text-primary-500" />
                        AI Inbox
                    </h1>
                    <p className="text-sm text-surface-500 mt-1">
                        Paste messages from professors or study groups — AI extracts all details automatically.
                    </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-50 border border-violet-200">
                    <Brain className="w-4 h-4 text-violet-500" />
                    <span className="text-xs font-semibold text-violet-700">Powered by Groq LLM</span>
                </div>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Prompt */}
                <div className="lg:col-span-2 space-y-6">
                    <PromptInput
                        key={extracted ? 'preview' : 'empty'}
                        onSubmit={handleExtract}
                        isLoading={isExtracting}
                    />

                    {/* Capabilities info strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { emoji: '🎯', label: 'Extracts 10+ fields', sub: 'Title, subject, prof, deadline…' },
                            { emoji: '🧠', label: 'AI Summary', sub: 'Generates key points' },
                            { emoji: '⏱️', label: 'Study Time', sub: 'Estimates hours needed' },
                            { emoji: '🔍', label: 'Duplicate Check', sub: 'Detects similar tasks' },
                        ].map((item) => (
                            <div key={item.label} className="bg-white rounded-xl border border-surface-200 p-3 text-center shadow-sm">
                                <div className="text-xl mb-1">{item.emoji}</div>
                                <p className="text-xs font-semibold text-surface-700">{item.label}</p>
                                <p className="text-[10px] text-surface-400 mt-0.5">{item.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Extraction result + suggestions */}
                <div className="space-y-6">
                    {isExtracting ? (
                        <ExtractionCard loading />
                    ) : extracted ? (
                        <ExtractionCard
                            extracted={extracted}
                            duplicates={duplicates}
                            onAccept={handleAccept}
                            onDismiss={handleDismiss}
                            onSaveAsReview={handleSaveAsReview}
                        />
                    ) : (
                        <div className="bg-white rounded-xl border border-dashed border-surface-300 p-8 text-center">
                            <Zap className="w-8 h-8 text-surface-300 mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-medium text-surface-500">Ready to extract</p>
                            <p className="text-xs text-surface-400 mt-1">Paste a message and click "Extract with AI"</p>
                        </div>
                    )}
                    <SuggestionCard />
                </div>
            </div>
        </div>
    );
};

export default Inbox;
