import React, { useState } from 'react';
import { Sparkles, MessageSquare, Mail, BookOpen, FileText, GraduationCap, FlaskConical, FolderKanban } from 'lucide-react';
import { Card } from '../common/Card';
import type { AssignmentSource } from '../../types';

interface PromptInputProps {
    onSubmit: (text: string, source: AssignmentSource) => void;
    isLoading: boolean;
}

const SOURCES: { id: AssignmentSource; label: string; icon: React.ReactNode }[] = [
    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'email', label: 'Email', icon: <Mail className="w-3.5 h-3.5" /> },
    { id: 'google-classroom', label: 'Classroom', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'college-portal', label: 'College Portal', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { id: 'lab', label: 'Lab', icon: <FlaskConical className="w-3.5 h-3.5" /> },
    { id: 'project', label: 'Project', icon: <FolderKanban className="w-3.5 h-3.5" /> },
    { id: 'notes', label: 'Notes', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'manual', label: 'Manual', icon: <FileText className="w-3.5 h-3.5" /> },
];

const EXAMPLE_MESSAGES: { label: string; source: AssignmentSource; text: string }[] = [
    {
        label: 'WhatsApp',
        source: 'whatsapp',
        text: "Hey everyone! Prof. Kumar said the Data Structures lab report is due by next Thursday at 11:59 PM. Submit via Google Classroom. Make sure to include AVL tree complexity analysis. High priority! 📚",
    },
    {
        label: 'Email',
        source: 'email',
        text: "Subject: Calculus Problem Set #7 Reminder\n\nDear students,\nPlease complete exercises 5.1 through 5.8 on integration techniques. Due Friday at 5:00 PM. Submit the PDF to moodle.university.edu/cs301.\n\nBest,\nDr. Williams",
    },
    {
        label: 'Portal',
        source: 'college-portal',
        text: "CS301 – Database Design Project posted. Design an ER diagram and normalize to 3NF for a university management system. Due: Next Wednesday 11:59 PM. Submit via LMS portal. Professor: Dr. Anand.",
    },
];

export const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isLoading }) => {
    const [text, setText] = useState('');
    const [source, setSource] = useState<AssignmentSource>('whatsapp');

    const handleSubmit = () => {
        if (text.trim().length >= 10 && !isLoading) {
            onSubmit(text, source);
        }
    };

    const isValid = text.trim().length >= 10;

    return (
        <Card title="Paste a message to extract deadlines">
            <div className="space-y-4">
                {/* Source Selection */}
                <div>
                    <p className="text-xs font-medium text-surface-500 mb-2">Source Channel</p>
                    <div className="flex flex-wrap gap-2">
                        {SOURCES.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setSource(s.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                                    source === s.id
                                        ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/20'
                                        : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                                }`}
                            >
                                {s.icon}
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Textarea */}
                <div className="relative">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste your WhatsApp message, email, college portal notice, or any text containing assignment details here..."
                        className="w-full h-36 p-4 rounded-xl border border-surface-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 bg-surface-50 resize-none text-sm text-surface-800 transition-all placeholder:text-surface-400"
                    />
                    <span className="absolute bottom-3 right-3 text-[10px] text-surface-300">{text.length} chars</span>
                </div>

                {/* Quick example buttons */}
                <div>
                    <p className="text-xs font-medium text-surface-400 mb-2">Try an example:</p>
                    <div className="flex flex-wrap gap-2">
                        {EXAMPLE_MESSAGES.map((ex) => (
                            <button
                                key={ex.label}
                                onClick={() => { setText(ex.text); setSource(ex.source); }}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-surface-50 border border-surface-200 text-surface-500 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-colors cursor-pointer"
                            >
                                {ex.label} example
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-2">
                    <span className={`text-xs ${isValid ? 'text-surface-400' : 'text-red-400'}`}>
                        {text.length > 0 && text.length < 10
                            ? 'Message too short (min 10 characters)'
                            : 'AI will extract all assignment details automatically'}
                    </span>
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid || isLoading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 focus:ring-4 focus:ring-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 cursor-pointer"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Extracting...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Extract with AI
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Card>
    );
};
