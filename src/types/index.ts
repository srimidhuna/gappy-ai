// ─── Assignment ─────────────────────────────────
export type AssignmentStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';
export type AssignmentPriority = 'low' | 'medium' | 'high';
export type AssignmentSource = 'whatsapp' | 'google-classroom' | 'email' | 'manual' | 'notes';

export interface Assignment {
    id: string;
    title: string;
    subject: string;
    description: string;
    dueDate: string;       // ISO date string
    status: AssignmentStatus;
    priority: AssignmentPriority;
    source: AssignmentSource;
    createdAt: string;
}

// ─── Task (Planner) ────────────────────────────
export interface Task {
    id: string;
    title: string;
    completed: boolean;
    assignmentId?: string;
    date: string;           // ISO date string
    timeSlot?: string;      // e.g. "09:00 - 10:30"
}

// ─── Message (Inbox) ───────────────────────────
export interface Message {
    id: string;
    rawText: string;
    source: AssignmentSource;
    receivedAt: string;     // ISO date string
    processed: boolean;
}

// ─── User ──────────────────────────────────────
export interface User {
    name: string;
    email: string;
    avatar: string;
    workspace: string;
}

// ─── Dashboard ─────────────────────────────────
export interface DashboardStats {
    total: number;
    pending: number;
    inProgress: number;
    overdue: number;
}

// ─── Weekly Planner ────────────────────────────
export interface WeeklyDay {
    day: string;           // e.g. "Mon"
    date: string;          // ISO date string
    tasks: Task[];
}

// ─── Study Block ───────────────────────────────
export interface StudyBlock {
    id: string;
    title: string;
    startTime: string;     // e.g. "09:00"
    endTime: string;       // e.g. "10:30"
    subject: string;
    color: string;
}
