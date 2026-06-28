import React, { useState } from 'react';
import { Plus, Search, Filter, Calendar, BookOpen, MessageSquare, Mail, FileText } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Table } from '../components/common/Table';
import { AssignmentDetailsModal } from '../components/assignments/AssignmentDetailsModal';
import { useAssignmentStore } from '../store/assignmentStore';
import { useUIStore } from '../store/uiStore';
import { useForm } from 'react-hook-form';
import type { Assignment, AssignmentStatus, AssignmentSource, AssignmentPriority } from '../types';

const statusBadge: Record<AssignmentStatus, { variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary'; label: string }> = {
    pending: { variant: 'warning', label: 'Pending' },
    'in-progress': { variant: 'info', label: 'In Progress' },
    completed: { variant: 'success', label: 'Completed' },
    overdue: { variant: 'danger', label: 'Overdue' },
};

const sourceIcons: Record<AssignmentSource, React.ReactNode> = {
    whatsapp: <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />,
    email: <Mail className="w-3.5 h-3.5 text-blue-500" />,
    'google-classroom': <BookOpen className="w-3.5 h-3.5 text-primary-500" />,
    notes: <FileText className="w-3.5 h-3.5 text-amber-500" />,
    manual: <FileText className="w-3.5 h-3.5 text-surface-400" />,
};

interface AssignmentFormData {
    title: string;
    subject: string;
    description: string;
    dueDate: string;
    priority: AssignmentPriority;
    source: AssignmentSource;
}

const Assignments: React.FC = () => {
    const { filters, setSearch, setStatusFilter, setSourceFilter, getFilteredAssignments, addAssignment } = useAssignmentStore();
    const { openModal, closeModal, modalOpen, addToast } = useUIStore();
    const [showFilters, setShowFilters] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<AssignmentFormData>();

    const filteredAssignments = getFilteredAssignments();

    const onSubmit = (data: AssignmentFormData) => {
        const newAssignment: Assignment = {
            id: `a${Date.now()}`,
            ...data,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
        addAssignment(newAssignment);
        addToast({ message: 'Assignment added successfully!', type: 'success' });
        reset();
        closeModal();
    };

    const columns = [
        {
            key: 'title',
            header: 'Assignment',
            render: (a: Assignment) => (
                <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-8 rounded-full ${a.priority === 'high' ? 'bg-red-400' : a.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    <div>
                        <p className="font-medium text-surface-700">{a.title}</p>
                        <p className="text-xs text-surface-400 mt-0.5">{a.description.slice(0, 60)}...</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'subject',
            header: 'Subject',
            render: (a: Assignment) => <span className="text-surface-600">{a.subject}</span>,
        },
        {
            key: 'source',
            header: 'Source',
            render: (a: Assignment) => (
                <div className="flex items-center gap-1.5">
                    {sourceIcons[a.source]}
                    <span className="text-xs capitalize text-surface-500">{a.source.replace('-', ' ')}</span>
                </div>
            ),
        },
        {
            key: 'dueDate',
            header: 'Due Date',
            render: (a: Assignment) => (
                <div className="flex items-center gap-1.5 text-surface-600">
                    <Calendar className="w-3.5 h-3.5 text-surface-400" />
                    {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (a: Assignment) => (
                <Badge variant={statusBadge[a.status].variant} dot>
                    {statusBadge[a.status].label}
                </Badge>
            ),
        },
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-800">Assignments</h1>
                    <p className="text-sm text-surface-500 mt-1">Manage and track all your assignments in one place.</p>
                </div>
                <Button onClick={() => openModal('add-assignment')} icon={<Plus className="w-4 h-4" />}>
                    Add Assignment
                </Button>
            </div>

            {/* Search & Filters */}
            <Card noPadding>
                <div className="p-4 flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <Input
                            placeholder="Search assignments..."
                            icon={<Search className="w-4 h-4" />}
                            value={filters.search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button
                        variant="secondary"
                        icon={<Filter className="w-4 h-4" />}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        Filters
                    </Button>
                </div>

                {showFilters && (
                    <div className="px-4 pb-4 flex flex-wrap gap-3 border-t border-surface-100 pt-3">
                        <select
                            className="px-3 py-2 rounded-lg border border-surface-300 text-sm text-surface-600 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={filters.status}
                            onChange={(e) => setStatusFilter(e.target.value as AssignmentStatus | 'all')}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="overdue">Overdue</option>
                        </select>
                        <select
                            className="px-3 py-2 rounded-lg border border-surface-300 text-sm text-surface-600 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={filters.source}
                            onChange={(e) => setSourceFilter(e.target.value as AssignmentSource | 'all')}
                        >
                            <option value="all">All Sources</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="email">Email</option>
                            <option value="google-classroom">Google Classroom</option>
                            <option value="notes">Notes</option>
                            <option value="manual">Manual</option>
                        </select>
                    </div>
                )}

                {/* Table */}
                <Table
                    columns={columns}
                    data={filteredAssignments}
                    keyExtractor={(a) => a.id}
                    onRowClick={(a) => setSelectedAssignment(a)}
                    emptyMessage="No assignments match your filters"
                />
            </Card>

            {/* Assignment Details Modal */}
            <AssignmentDetailsModal
                assignment={selectedAssignment}
                isOpen={!!selectedAssignment}
                onClose={() => setSelectedAssignment(null)}
            />

            {/* Add Assignment Modal */}
            <Modal
                isOpen={modalOpen === 'add-assignment'}
                onClose={closeModal}
                title="Add New Assignment"
                size="lg"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Title"
                        placeholder="Enter assignment title"
                        error={errors.title?.message}
                        {...register('title', { required: 'Title is required' })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Subject"
                            placeholder="e.g. Computer Science"
                            error={errors.subject?.message}
                            {...register('subject', { required: 'Subject is required' })}
                        />
                        <Input
                            label="Due Date"
                            type="datetime-local"
                            error={errors.dueDate?.message}
                            {...register('dueDate', { required: 'Due date is required' })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">Description</label>
                        <textarea
                            className="w-full rounded-lg border border-surface-300 bg-white p-3 text-sm text-surface-700 placeholder-surface-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 h-24"
                            placeholder="Describe the assignment..."
                            {...register('description')}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1.5">Priority</label>
                            <select
                                className="w-full px-3 py-2.5 rounded-lg border border-surface-300 text-sm text-surface-600 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                {...register('priority', { required: true })}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1.5">Source</label>
                            <select
                                className="w-full px-3 py-2.5 rounded-lg border border-surface-300 text-sm text-surface-600 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                {...register('source', { required: true })}
                            >
                                <option value="manual">Manual</option>
                                <option value="whatsapp">WhatsApp</option>
                                <option value="email">Email</option>
                                <option value="google-classroom">Google Classroom</option>
                                <option value="notes">Notes</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="secondary" type="button" onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Add Assignment
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Assignments;
