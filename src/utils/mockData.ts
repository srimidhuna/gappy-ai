import type { Assignment, Task, Message, User, DashboardStats, WeeklyDay, StudyBlock } from '../types';

// Helper to generate dynamic ISO dates based on today +/- offset days
const getRelativeDateStr = (offsetDays: number = 0, timeStr: string = '09:00:00'): string => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const dateStr = d.toISOString().split('T')[0];
    return `${dateStr}T${timeStr}`;
};

const getRelativeDateOnly = (offsetDays: number = 0): string => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
};

// ─── User ──────────────────────────────────────
export const mockUser: User = {
    name: 'Alex Johnson',
    email: 'alex.johnson@university.edu',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Alex',
    workspace: 'Fall 2026 Semester', // Leaving this static as it's just a text label
};

// ─── Assignments ───────────────────────────────
export const mockAssignments: Assignment[] = [
    {
        id: 'a1',
        title: 'Data Structures Lab Report',
        subject: 'Computer Science',
        description: 'Write a 10-page report on the implementation of AVL trees with complexity analysis.',
        dueDate: getRelativeDateStr(4, '23:59:00'),
        status: 'pending',
        priority: 'high',
        source: 'google-classroom',
        createdAt: getRelativeDateStr(-3, '10:00:00'),
    },
    {
        id: 'a2',
        title: 'Calculus Problem Set #7',
        subject: 'Mathematics',
        description: 'Complete exercises 5.1 through 5.8 on integration techniques.',
        dueDate: getRelativeDateStr(2, '17:00:00'),
        status: 'in-progress',
        priority: 'high',
        source: 'email',
        createdAt: getRelativeDateStr(-4, '09:30:00'),
    },
    {
        id: 'a3',
        title: 'English Essay: Modern Literature',
        subject: 'English',
        description: 'Analyze the themes in "The Great Gatsby" with 3 cited sources.',
        dueDate: getRelativeDateStr(7, '23:59:00'),
        status: 'pending',
        priority: 'medium',
        source: 'manual',
        createdAt: getRelativeDateStr(-5, '14:00:00'),
    },
    {
        id: 'a4',
        title: 'Physics Lab Experiment Write-up',
        subject: 'Physics',
        description: 'Document the pendulum experiment results with error analysis.',
        dueDate: getRelativeDateStr(-1, '23:59:00'), // yesterday (overdue)
        status: 'overdue',
        priority: 'high',
        source: 'whatsapp',
        createdAt: getRelativeDateStr(-8, '11:00:00'),
    },
    {
        id: 'a5',
        title: 'Database Schema Design Project',
        subject: 'Computer Science',
        description: 'Design an ER diagram and normalize to 3NF for a university management system.',
        dueDate: getRelativeDateStr(10, '23:59:00'),
        status: 'pending',
        priority: 'medium',
        source: 'google-classroom',
        createdAt: getRelativeDateStr(-2, '08:00:00'),
    },
    {
        id: 'a6',
        title: 'History Research Paper Outline',
        subject: 'History',
        description: 'Submit a detailed outline for the World War II research paper.',
        dueDate: getRelativeDateStr(3, '17:00:00'),
        status: 'in-progress',
        priority: 'medium',
        source: 'email',
        createdAt: getRelativeDateStr(-6, '13:00:00'),
    },
    {
        id: 'a7',
        title: 'Chemistry Presentation Slides',
        subject: 'Chemistry',
        description: 'Prepare 15-slide presentation on organic reaction mechanisms.',
        dueDate: getRelativeDateStr(5, '09:00:00'),
        status: 'pending',
        priority: 'low',
        source: 'notes',
        createdAt: getRelativeDateStr(-3, '16:00:00'),
    },
    {
        id: 'a8',
        title: 'Statistics Group Project',
        subject: 'Mathematics',
        description: 'Collaborate on regression analysis of the provided dataset.',
        dueDate: getRelativeDateStr(12, '23:59:00'),
        status: 'pending',
        priority: 'low',
        source: 'whatsapp',
        createdAt: getRelativeDateStr(-1, '10:00:00'),
    },
    {
        id: 'a9',
        title: 'Operating Systems Quiz Prep',
        subject: 'Computer Science',
        description: 'Review chapters 4-6 on process scheduling and memory management.',
        dueDate: getRelativeDateStr(1, '10:00:00'), // tomorrow
        status: 'completed',
        priority: 'high',
        source: 'google-classroom',
        createdAt: getRelativeDateStr(-7, '09:00:00'),
    },
    {
        id: 'a10',
        title: 'Philosophy Reflection Journal',
        subject: 'Philosophy',
        description: 'Write a 500-word reflection on Kantian ethics.',
        dueDate: getRelativeDateStr(6, '23:59:00'),
        status: 'pending',
        priority: 'low',
        source: 'manual',
        createdAt: getRelativeDateStr(-2, '12:00:00'),
    },
];

// ─── Tasks ─────────────────────────────────────
export const mockTasks: Task[] = [
    { id: 't1', title: 'Read Chapter 5 – AVL Trees', completed: false, assignmentId: 'a1', date: getRelativeDateOnly(0), timeSlot: '09:00 - 10:30' },
    { id: 't2', title: 'Solve integration exercises 5.1-5.4', completed: true, assignmentId: 'a2', date: getRelativeDateOnly(0), timeSlot: '11:00 - 12:30' },
    { id: 't3', title: 'Draft essay introduction', completed: false, assignmentId: 'a3', date: getRelativeDateOnly(0), timeSlot: '14:00 - 15:00' },
    { id: 't4', title: 'Fix pendulum error calculations', completed: false, assignmentId: 'a4', date: getRelativeDateOnly(0), timeSlot: '15:30 - 16:30' },
    { id: 't5', title: 'Outline history paper sections', completed: false, assignmentId: 'a6', date: getRelativeDateOnly(1) },
    { id: 't6', title: 'Design ER diagram draft', completed: false, assignmentId: 'a5', date: getRelativeDateOnly(1), timeSlot: '10:00 - 12:00' },
    { id: 't7', title: 'Solve exercises 5.5-5.8', completed: false, assignmentId: 'a2', date: getRelativeDateOnly(1), timeSlot: '14:00 - 15:30' },
    { id: 't8', title: 'Review OS chapters 4-6', completed: true, assignmentId: 'a9', date: getRelativeDateOnly(0), timeSlot: '17:00 - 18:30' },
];

// ─── Messages (Inbox) ──────────────────────────
export const mockMessages: Message[] = [
    {
        id: 'm1',
        rawText: 'Hey everyone! Prof. Kumar said the Data Structures lab report is due by next Thursday. Make sure to include AVL tree complexity analysis. 📚',
        source: 'whatsapp',
        receivedAt: getRelativeDateStr(-3, '10:15:00'),
        processed: true,
    },
    {
        id: 'm2',
        rawText: 'Subject: Calculus Problem Set #7 Reminder\n\nDear students,\nPlease complete exercises 5.1 through 5.8 on integration techniques. Due in 2 days at 5:00 PM.\n\nBest,\nDr. Williams',
        source: 'email',
        receivedAt: getRelativeDateStr(-4, '09:30:00'),
        processed: true,
    },
    {
        id: 'm3',
        rawText: 'Guys the chemistry presentation is on Friday!! We need 15 slides on organic reaction mechanisms. Who wants to split the topics?',
        source: 'whatsapp',
        receivedAt: getRelativeDateStr(-1, '14:20:00'),
        processed: false,
    },
    {
        id: 'm4',
        rawText: 'New assignment posted in CS301: Database Schema Design Project\nDesign an ER diagram and normalize to 3NF for a university management system.\nDue: Next Wednesday 11:59 PM',
        source: 'google-classroom',
        receivedAt: getRelativeDateStr(-2, '08:05:00'),
        processed: true,
    },
    {
        id: 'm5',
        rawText: 'Don\'t forget the statistics group project! We need to submit the regression analysis next Friday. Let\'s meet on Thursday to discuss.',
        source: 'whatsapp',
        receivedAt: getRelativeDateStr(-1, '16:45:00'),
        processed: false,
    },
];

// ─── Dashboard Stats ───────────────────────────
export const mockStats: DashboardStats = {
    total: mockAssignments.length,
    pending: mockAssignments.filter(a => a.status === 'pending').length,
    inProgress: mockAssignments.filter(a => a.status === 'in-progress').length,
    overdue: mockAssignments.filter(a => a.status === 'overdue').length,
};

// ─── Weekly Planner ────────────────────────────
// Generate relative days dynamically (Monday -> Sunday of current relative progression)
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const mockWeeklyDays: WeeklyDay[] = Array.from({ length: 7 }).map((_, i) => {
    const curDate = new Date();
    curDate.setDate(curDate.getDate() + i); // Start from today
    const dateStr = curDate.toISOString().split('T')[0];
    return {
        day: dayNames[curDate.getDay()],
        date: dateStr,
        tasks: mockTasks.filter(t => t.date === dateStr),
    };
});

// ─── Study Blocks ──────────────────────────────
export const mockStudyBlocks: StudyBlock[] = [
    { id: 'sb1', title: 'Data Structures Study', startTime: '09:00', endTime: '10:30', subject: 'Computer Science', color: '#3b82f6' },
    { id: 'sb2', title: 'Calculus Practice', startTime: '11:00', endTime: '12:30', subject: 'Mathematics', color: '#8b5cf6' },
    { id: 'sb3', title: 'Essay Writing', startTime: '14:00', endTime: '15:00', subject: 'English', color: '#10b981' },
    { id: 'sb4', title: 'Physics Lab Work', startTime: '15:30', endTime: '16:30', subject: 'Physics', color: '#f59e0b' },
    { id: 'sb5', title: 'OS Review Session', startTime: '17:00', endTime: '18:30', subject: 'Computer Science', color: '#3b82f6' },
];
