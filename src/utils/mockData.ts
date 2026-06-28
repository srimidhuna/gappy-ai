import type { Assignment, Task, Message, User, DashboardStats, WeeklyDay, StudyBlock } from '../types';

// ─── User ──────────────────────────────────────
export const mockUser: User = {
    name: 'Alex Johnson',
    email: 'alex.johnson@university.edu',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Alex',
    workspace: 'Fall 2026 Semester',
};

// ─── Assignments ───────────────────────────────
export const mockAssignments: Assignment[] = [
    {
        id: 'a1',
        title: 'Data Structures Lab Report',
        subject: 'Computer Science',
        description: 'Write a 10-page report on the implementation of AVL trees with complexity analysis.',
        dueDate: '2026-07-02T23:59:00',
        status: 'pending',
        priority: 'high',
        source: 'google-classroom',
        createdAt: '2026-06-25T10:00:00',
    },
    {
        id: 'a2',
        title: 'Calculus Problem Set #7',
        subject: 'Mathematics',
        description: 'Complete exercises 5.1 through 5.8 on integration techniques.',
        dueDate: '2026-06-30T17:00:00',
        status: 'in-progress',
        priority: 'high',
        source: 'email',
        createdAt: '2026-06-24T09:30:00',
    },
    {
        id: 'a3',
        title: 'English Essay: Modern Literature',
        subject: 'English',
        description: 'Analyze the themes in "The Great Gatsby" with 3 cited sources.',
        dueDate: '2026-07-05T23:59:00',
        status: 'pending',
        priority: 'medium',
        source: 'manual',
        createdAt: '2026-06-23T14:00:00',
    },
    {
        id: 'a4',
        title: 'Physics Lab Experiment Write-up',
        subject: 'Physics',
        description: 'Document the pendulum experiment results with error analysis.',
        dueDate: '2026-06-28T23:59:00',
        status: 'overdue',
        priority: 'high',
        source: 'whatsapp',
        createdAt: '2026-06-20T11:00:00',
    },
    {
        id: 'a5',
        title: 'Database Schema Design Project',
        subject: 'Computer Science',
        description: 'Design an ER diagram and normalize to 3NF for a university management system.',
        dueDate: '2026-07-08T23:59:00',
        status: 'pending',
        priority: 'medium',
        source: 'google-classroom',
        createdAt: '2026-06-26T08:00:00',
    },
    {
        id: 'a6',
        title: 'History Research Paper Outline',
        subject: 'History',
        description: 'Submit a detailed outline for the World War II research paper.',
        dueDate: '2026-07-01T17:00:00',
        status: 'in-progress',
        priority: 'medium',
        source: 'email',
        createdAt: '2026-06-22T13:00:00',
    },
    {
        id: 'a7',
        title: 'Chemistry Presentation Slides',
        subject: 'Chemistry',
        description: 'Prepare 15-slide presentation on organic reaction mechanisms.',
        dueDate: '2026-07-03T09:00:00',
        status: 'pending',
        priority: 'low',
        source: 'notes',
        createdAt: '2026-06-25T16:00:00',
    },
    {
        id: 'a8',
        title: 'Statistics Group Project',
        subject: 'Mathematics',
        description: 'Collaborate on regression analysis of the provided dataset.',
        dueDate: '2026-07-10T23:59:00',
        status: 'pending',
        priority: 'low',
        source: 'whatsapp',
        createdAt: '2026-06-27T10:00:00',
    },
    {
        id: 'a9',
        title: 'Operating Systems Quiz Prep',
        subject: 'Computer Science',
        description: 'Review chapters 4-6 on process scheduling and memory management.',
        dueDate: '2026-06-29T10:00:00',
        status: 'completed',
        priority: 'high',
        source: 'google-classroom',
        createdAt: '2026-06-21T09:00:00',
    },
    {
        id: 'a10',
        title: 'Philosophy Reflection Journal',
        subject: 'Philosophy',
        description: 'Write a 500-word reflection on Kantian ethics.',
        dueDate: '2026-07-04T23:59:00',
        status: 'pending',
        priority: 'low',
        source: 'manual',
        createdAt: '2026-06-26T12:00:00',
    },
];

// ─── Tasks ─────────────────────────────────────
export const mockTasks: Task[] = [
    { id: 't1', title: 'Read Chapter 5 – AVL Trees', completed: false, assignmentId: 'a1', date: '2026-06-28', timeSlot: '09:00 - 10:30' },
    { id: 't2', title: 'Solve integration exercises 5.1-5.4', completed: true, assignmentId: 'a2', date: '2026-06-28', timeSlot: '11:00 - 12:30' },
    { id: 't3', title: 'Draft essay introduction', completed: false, assignmentId: 'a3', date: '2026-06-28', timeSlot: '14:00 - 15:00' },
    { id: 't4', title: 'Fix pendulum error calculations', completed: false, assignmentId: 'a4', date: '2026-06-28', timeSlot: '15:30 - 16:30' },
    { id: 't5', title: 'Outline history paper sections', completed: false, assignmentId: 'a6', date: '2026-06-29' },
    { id: 't6', title: 'Design ER diagram draft', completed: false, assignmentId: 'a5', date: '2026-06-29', timeSlot: '10:00 - 12:00' },
    { id: 't7', title: 'Solve exercises 5.5-5.8', completed: false, assignmentId: 'a2', date: '2026-06-29', timeSlot: '14:00 - 15:30' },
    { id: 't8', title: 'Review OS chapters 4-6', completed: true, assignmentId: 'a9', date: '2026-06-28', timeSlot: '17:00 - 18:30' },
];

// ─── Messages (Inbox) ──────────────────────────
export const mockMessages: Message[] = [
    {
        id: 'm1',
        rawText: 'Hey everyone! Prof. Kumar said the Data Structures lab report is due by July 2nd. Make sure to include AVL tree complexity analysis. 📚',
        source: 'whatsapp',
        receivedAt: '2026-06-25T10:15:00',
        processed: true,
    },
    {
        id: 'm2',
        rawText: 'Subject: Calculus Problem Set #7 Reminder\n\nDear students,\nPlease complete exercises 5.1 through 5.8 on integration techniques. Due: June 30, 5:00 PM.\n\nBest,\nDr. Williams',
        source: 'email',
        receivedAt: '2026-06-24T09:30:00',
        processed: true,
    },
    {
        id: 'm3',
        rawText: 'Guys the chemistry presentation is on July 3rd!! We need 15 slides on organic reaction mechanisms. Who wants to split the topics?',
        source: 'whatsapp',
        receivedAt: '2026-06-27T14:20:00',
        processed: false,
    },
    {
        id: 'm4',
        rawText: 'New assignment posted in CS301: Database Schema Design Project\nDesign an ER diagram and normalize to 3NF for a university management system.\nDue: July 8, 11:59 PM',
        source: 'google-classroom',
        receivedAt: '2026-06-26T08:05:00',
        processed: true,
    },
    {
        id: 'm5',
        rawText: 'Don\'t forget the statistics group project! We need to submit the regression analysis by July 10th. Let\'s meet on Thursday to discuss.',
        source: 'whatsapp',
        receivedAt: '2026-06-27T16:45:00',
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
export const mockWeeklyDays: WeeklyDay[] = [
    { day: 'Mon', date: '2026-06-29', tasks: mockTasks.filter(t => t.date === '2026-06-29') },
    { day: 'Tue', date: '2026-06-30', tasks: [] },
    { day: 'Wed', date: '2026-07-01', tasks: [] },
    { day: 'Thu', date: '2026-07-02', tasks: [] },
    { day: 'Fri', date: '2026-07-03', tasks: [] },
    { day: 'Sat', date: '2026-07-04', tasks: [] },
    { day: 'Sun', date: '2026-07-05', tasks: [] },
];

// ─── Study Blocks ──────────────────────────────
export const mockStudyBlocks: StudyBlock[] = [
    { id: 'sb1', title: 'Data Structures Study', startTime: '09:00', endTime: '10:30', subject: 'Computer Science', color: '#3b82f6' },
    { id: 'sb2', title: 'Calculus Practice', startTime: '11:00', endTime: '12:30', subject: 'Mathematics', color: '#8b5cf6' },
    { id: 'sb3', title: 'Essay Writing', startTime: '14:00', endTime: '15:00', subject: 'English', color: '#10b981' },
    { id: 'sb4', title: 'Physics Lab Work', startTime: '15:30', endTime: '16:30', subject: 'Physics', color: '#f59e0b' },
    { id: 'sb5', title: 'OS Review Session', startTime: '17:00', endTime: '18:30', subject: 'Computer Science', color: '#3b82f6' },
];
