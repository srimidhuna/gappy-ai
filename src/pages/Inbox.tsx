import React from 'react';
import { Inbox as InboxIcon, MessageSquare, Mail, BookOpen, FileText, Trash2 } from 'lucide-react';
import { PromptInput } from '../components/ai/PromptInput';
import { ExtractionCard } from '../components/ai/ExtractionCard';
import { SuggestionCard } from '../components/ai/SuggestionCard';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useMessageStore } from '../store/messageStore';
import type { AssignmentSource } from '../types';

const sourceConfig: Record<AssignmentSource, { icon: React.ReactNode; label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary' }> = {
    whatsapp: { icon: <MessageSquare className="w-3.5 h-3.5" />, label: 'WhatsApp', variant: 'success' },
    email: { icon: <Mail className="w-3.5 h-3.5" />, label: 'Email', variant: 'info' },
    'google-classroom': { icon: <BookOpen className="w-3.5 h-3.5" />, label: 'Classroom', variant: 'primary' },
    notes: { icon: <FileText className="w-3.5 h-3.5" />, label: 'Notes', variant: 'warning' },
    manual: { icon: <FileText className="w-3.5 h-3.5" />, label: 'Manual', variant: 'default' },
};

const Inbox: React.FC = () => {
    const { messages, addMessage, deleteMessage } = useMessageStore();

    const handleSubmit = (text: string, source: string) => {
        addMessage(text, source as AssignmentSource);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-surface-800 flex items-center gap-2">
                    <InboxIcon className="w-7 h-7 text-primary-500" />
                    Inbox
                </h1>
                <p className="text-sm text-surface-500 mt-1">
                    Paste messages from any source to extract assignment deadlines.
                </p>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Prompt + Messages */}
                <div className="lg:col-span-2 space-y-6">
                    <PromptInput onSubmit={handleSubmit} />

                    {/* Messages list */}
                    <Card title="Messages" subtitle={`${messages.length} messages collected`}>
                        <div className="space-y-3">
                            {messages.length === 0 ? (
                                <div className="text-center py-10 text-surface-400">
                                    <InboxIcon className="w-10 h-10 mx-auto mb-3 text-surface-300" />
                                    <p className="text-sm">No messages yet. Paste your first message above!</p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const src = sourceConfig[msg.source as AssignmentSource] || sourceConfig.manual;
                                    return (
                                        <div
                                            key={msg.id}
                                            className="p-4 rounded-xl border border-surface-200 hover:border-surface-300 transition-colors bg-white"
                                        >
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <Badge variant={src.variant} dot>
                                                    {src.label}
                                                </Badge>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${msg.status === 'processed'
                                                            ? 'bg-emerald-50 text-emerald-600'
                                                            : msg.status === 'processing'
                                                                ? 'bg-amber-50 text-amber-600'
                                                                : 'bg-surface-100 text-surface-500'
                                                        }`}>
                                                        {msg.status === 'processed' ? '✓ Processed' : msg.status === 'processing' ? '⏳ Processing' : '● New'}
                                                    </span>
                                                    <button
                                                        onClick={() => deleteMessage(msg.id)}
                                                        className="p-1 rounded-lg text-surface-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-surface-600 leading-relaxed whitespace-pre-line line-clamp-3">
                                                {msg.rawText}
                                            </p>
                                            <p className="text-[11px] text-surface-400 mt-2">
                                                Received {new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right: AI Placeholders */}
                <div className="space-y-6">
                    <ExtractionCard
                        title="Data Structures Lab Report"
                        subject="Computer Science"
                        dueDate="July 2, 2026"
                        source="WhatsApp"
                        confidence={92}
                    />
                    <SuggestionCard />
                </div>
            </div>
        </div>
    );
};

export default Inbox;
