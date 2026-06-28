import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';

interface PromptInputProps {
    onSubmit?: (text: string, source: string) => void;
}

const sources = [
    { value: 'whatsapp', label: '💬 WhatsApp' },
    { value: 'email', label: '📧 Email' },
    { value: 'google-classroom', label: '📚 Google Classroom' },
    { value: 'notes', label: '📝 Notes' },
    { value: 'manual', label: '✏️ Manual' },
];

export const PromptInput: React.FC<PromptInputProps> = ({ onSubmit }) => {
    const [text, setText] = useState('');
    const [source, setSource] = useState('whatsapp');

    const handleSubmit = () => {
        if (text.trim() && onSubmit) {
            onSubmit(text.trim(), source);
            setText('');
        }
    };

    return (
        <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl border border-primary-100 p-6">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary-500" />
                <h3 className="text-sm font-semibold text-primary-700">
                    Paste a message to extract deadlines
                </h3>
            </div>

            <div className="flex gap-2 mb-3 flex-wrap">
                {sources.map((s) => (
                    <button
                        key={s.value}
                        onClick={() => setSource(s.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${source === s.value
                                ? 'bg-primary-600 text-white shadow-sm'
                                : 'bg-white text-surface-600 border border-surface-200 hover:border-primary-300'
                            }`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your WhatsApp message, email, or any text containing assignment details here..."
                className="w-full h-32 rounded-xl border border-primary-200 bg-white p-4 text-sm text-surface-700 placeholder-surface-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />

            <div className="flex justify-between items-center mt-3">
                <p className="text-xs text-surface-400">
                    AI extraction will process this text automatically
                </p>
                <Button
                    onClick={handleSubmit}
                    icon={<Send className="w-4 h-4" />}
                    disabled={!text.trim()}
                    size="sm"
                >
                    Add Message
                </Button>
            </div>
        </div>
    );
};
