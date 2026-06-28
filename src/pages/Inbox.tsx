import React, { useState } from 'react';
import { Inbox as InboxIcon, Zap } from 'lucide-react';
import { PromptInput } from '../components/ai/PromptInput';
import { ExtractionCard } from '../components/ai/ExtractionCard';
import { SuggestionCard } from '../components/ai/SuggestionCard';
import { useAssignmentStore } from '../store/assignmentStore';
import { useUIStore } from '../store/uiStore';
import type { AssignmentSource } from '../types';
import { extractAssignmentFromText, type ExtractedData } from '../services/aiService';
import { useNavigate } from 'react-router-dom';

const Inbox: React.FC = () => {
    const { addAssignment } = useAssignmentStore();
    const { addToast } = useUIStore();
    const navigate = useNavigate();

    const [isExtracting, setIsExtracting] = useState(false);
    const [extracted, setExtracted] = useState<ExtractedData | null>(null);

    const handleExtract = async (text: string, source: AssignmentSource) => {
        setIsExtracting(true);
        setExtracted(null);
        try {
            const data = await extractAssignmentFromText(text);
            // Groq may return the data, but if we pass source explicitly or want to override:
            setExtracted({ ...data, source: source });
        } catch (error) {
            console.error('Extraction failed:', error);
            addToast({ type: 'error', message: 'Failed to extract assignment with AI.' });
        } finally {
            setIsExtracting(false);
        }
    };

    const handleAccept = () => {
        if (!extracted) return;

        addAssignment({
            title: extracted.title || 'Untitled Assignment',
            subject: extracted.subject || 'General',
            description: extracted.description || `Auto-extracted from ${extracted.source} message.`,
            dueDate: extracted.dueDate || '',
            status: 'pending',
            priority: extracted.priority || 'medium',
            source: extracted.source as AssignmentSource,
        });

        addToast({ type: 'success', message: 'Assignment successfully saved!' });
        setExtracted(null); // Clear preview
        navigate('/assignments'); // Redirect to assignments page
    };

    const handleDismiss = () => {
        setExtracted(null);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-surface-800 flex items-center gap-2">
                    <InboxIcon className="w-7 h-7 text-primary-500" />
                    AI Inbox
                </h1>
                <p className="text-sm text-surface-500 mt-1">
                    Paste messages from your professors or study groups, and let AI automatically organize them.
                </p>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Prompt */}
                <div className="lg:col-span-2 space-y-6">
                    {/* PromptInput requires key based on extracted to clear textbox after saving */}
                    <PromptInput
                        key={extracted ? 'preview' : 'empty'}
                        onSubmit={handleExtract}
                        isLoading={isExtracting}
                    />
                </div>

                {/* Right: AI Extraction Results */}
                <div className="space-y-6">
                    {isExtracting ? (
                        <ExtractionCard loading />
                    ) : extracted ? (
                        <ExtractionCard
                            title={extracted.title}
                            subject={extracted.subject}
                            dueDate={extracted.dueDate ? new Date(extracted.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'No exact date'}
                            source={extracted.source}
                            confidence={95} // Arbitrary high confidence since LLM extracted it
                            onAccept={handleAccept}
                            onDismiss={handleDismiss}
                        />
                    ) : (
                        <div className="bg-white rounded-xl border border-dashed border-surface-300 p-6 text-center">
                            <Zap className="w-8 h-8 text-surface-300 mx-auto mb-2 opacity-50" />
                            <p className="text-sm text-surface-400">Your extracted assignment will appear here.</p>
                        </div>
                    )}
                    <SuggestionCard />
                </div>
            </div>
        </div>
    );
};

export default Inbox;
