import React, { useMemo, useState } from 'react';
import { BookOpen, CalendarRange, Clock3, Plus } from 'lucide-react';
import { StudySection } from '../components/planner/StudySection';
import { TimeBlockForm } from '../components/planner/TimeBlockForm';
import { TimelineView } from '../components/planner/TimelineView';
import { useAssignmentStore } from '../store/assignmentStore';
import type { StudyBlock } from '../types';

const tabs = [
    { id: 'planner', label: 'Study Planner', icon: BookOpen },
    { id: 'time-blocking', label: 'Time Blocking', icon: Clock3 },
];

const Planner: React.FC = () => {
    const { assignments } = useAssignmentStore();
    const [activeTab, setActiveTab] = useState<'planner' | 'time-blocking'>('planner');
    const [showForm, setShowForm] = useState(false);
    const [editBlock, setEditBlock] = useState<StudyBlock | null>(null);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Partition assignments into time buckets
    const { todayAssignments, tomorrowAssignments, thisWeekAssignments } = useMemo(() => {
        const active = assignments.filter((a) => a.status !== 'completed');
        return {
            todayAssignments: active.filter((a) => a.dueDate.startsWith(todayStr)),
            tomorrowAssignments: active.filter((a) => a.dueDate.startsWith(tomorrowStr)),
            thisWeekAssignments: active.filter((a) => {
                const due = new Date(a.dueDate);
                return due > tomorrow && due <= weekEnd;
            }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
        };
    }, [assignments, todayStr, tomorrowStr]);

    const pendingCount = assignments.filter((a) => a.status === 'pending').length;
    const inProgressCount = assignments.filter((a) => a.status === 'in-progress').length;

    const handleEditBlock = (block: StudyBlock) => {
        setEditBlock(block);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditBlock(null);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-8">
            {/* Page Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-800 flex items-center gap-2">
                        <CalendarRange className="w-7 h-7 text-primary-500" />
                        Study Planner
                    </h1>
                    <p className="text-sm text-surface-500 mt-1">
                        Organise your assignments and block focused study time.
                    </p>
                </div>

                {/* Quick stats */}
                <div className="hidden sm:flex items-center gap-4 text-center">
                    <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-2">
                        <p className="text-lg font-bold text-amber-600">{pendingCount}</p>
                        <p className="text-xs text-amber-500">Pending</p>
                    </div>
                    <div className="bg-cyan-50 border border-cyan-100 rounded-xl px-4 py-2">
                        <p className="text-lg font-bold text-cyan-600">{inProgressCount}</p>
                        <p className="text-xs text-cyan-500">In Progress</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-surface-100 p-1 rounded-xl w-fit">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'planner' | 'time-blocking')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                                activeTab === tab.id
                                    ? 'bg-white text-primary-700 shadow-sm'
                                    : 'text-surface-500 hover:text-surface-700'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ── TAB: Study Planner ───────────────────────────────────────── */}
            {activeTab === 'planner' && (
                <div className="space-y-4">
                    <StudySection
                        title="Today's Tasks"
                        subtitle={todayStr}
                        assignments={todayAssignments}
                        defaultOpen
                        emptyMessage="🎉 No assignments due today!"
                        icon={<div />}
                        accentColor="bg-red-400"
                    />
                    <StudySection
                        title="Tomorrow's Tasks"
                        subtitle={tomorrowStr}
                        assignments={tomorrowAssignments}
                        defaultOpen
                        emptyMessage="Nothing due tomorrow — great!"
                        icon={<div />}
                        accentColor="bg-amber-400"
                    />
                    <StudySection
                        title="This Week"
                        subtitle="Next 7 days"
                        assignments={thisWeekAssignments}
                        defaultOpen={thisWeekAssignments.length > 0}
                        emptyMessage="No upcoming assignments this week."
                        icon={<div />}
                        accentColor="bg-primary-400"
                    />
                </div>
            )}

            {/* ── TAB: Time Blocking ───────────────────────────────────────── */}
            {activeTab === 'time-blocking' && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left — Form */}
                    <div className="lg:col-span-2 space-y-4">
                        {!showForm ? (
                            <button
                                onClick={() => setShowForm(true)}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-surface-200 text-sm font-medium text-surface-500 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                Add Study Block
                            </button>
                        ) : (
                            <TimeBlockForm
                                editBlock={editBlock}
                                onClose={handleCloseForm}
                            />
                        )}

                        {/* Tips card */}
                        <div className="bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-100 rounded-xl p-4">
                            <p className="text-xs font-semibold text-primary-700 mb-2">💡 Study Tips</p>
                            <ul className="space-y-1.5 text-xs text-primary-600">
                                <li>• Use the Pomodoro method: 25-min focus, 5-min break</li>
                                <li>• Block your highest-priority tasks first</li>
                                <li>• Drag blocks to reorder your schedule</li>
                                <li>• Avoid sessions longer than 2 hours</li>
                            </ul>
                        </div>
                    </div>

                    {/* Right — Timeline */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl border border-surface-200 shadow-sm">
                            <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-surface-800">Today's Timeline</h3>
                                    <p className="text-xs text-surface-400 mt-0.5">
                                        {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Live" />
                            </div>
                            <div className="p-5">
                                <TimelineView onEdit={handleEditBlock} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Planner;
