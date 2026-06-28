import { create } from 'zustand';
import type { Message, AssignmentSource } from '../types';
import { mockMessages } from '../utils/mockData';

type MessageStatus = 'new' | 'processing' | 'processed' | 'failed';

interface MessageStoreItem {
    id: string;
    rawText: string;
    source: AssignmentSource;
    status: MessageStatus;
    createdAt: string;
}

interface MessageStore {
    messages: MessageStoreItem[];
    addMessage: (rawText: string, source: AssignmentSource) => void;
    deleteMessage: (id: string) => void;
    updateStatus: (id: string, status: MessageStatus) => void;
}

// Convert mock Messages to MessageStoreItems
const initialMessages: MessageStoreItem[] = mockMessages.map((m) => ({
    id: m.id,
    rawText: m.rawText,
    source: m.source,
    status: (m.processed ? 'processed' : 'new') as MessageStatus,
    createdAt: m.receivedAt,
}));

export const useMessageStore = create<MessageStore>((set) => ({
    messages: initialMessages,

    addMessage: (rawText, source) =>
        set((state) => ({
            messages: [
                {
                    id: `m${Date.now()}`,
                    rawText,
                    source,
                    status: 'new',
                    createdAt: new Date().toISOString(),
                },
                ...state.messages,
            ],
        })),

    deleteMessage: (id) =>
        set((state) => ({ messages: state.messages.filter((m) => m.id !== id) })),

    updateStatus: (id, status) =>
        set((state) => ({
            messages: state.messages.map((m) => (m.id === id ? { ...m, status } : m)),
        })),
}));
