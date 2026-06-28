import React from 'react';
import { CalendarRange, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { usePlannerStore } from '../store/plannerStore';
import { mockStudyBlocks } from '../utils/mockData';

const Planner: React.FC = () => {
    const { tasks, toggleTask, weeklyDays, studyBlocks } = usePlannerStore();

    const todayTasks = tasks.filter((t) => t.date === '2026-06-28');
    const completedCount = todayTasks.filter((t) => t.completed).length;
    const progress = todayTasks.length > 0 ? (completedCount / todayTasks.length) * 100 : 0;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-surface-800 flex items-center gap-2">
                    <CalendarRange className="w-7 h-7 text-primary-500" />
                    Planner
                </h1>
                <p className="text-sm text-surface-500 mt-1">Plan your study sessions and track your daily progress.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Checklist */}
                <div className="lg:col-span-2 space-y-6">
                    <Card
                        title="Today's Checklist"
                        subtitle={`${completedCount} of ${todayTasks.length} tasks completed`}
                        action={
                            <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-surface-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <span className="text-xs font-semibold text-primary-600">{Math.round(progress)}%</span>
                            </div>
                        }
                    >
                        <div className="space-y-2">
                            {todayTasks.length === 0 ? (
                                <p className="text-sm text-surface-400 text-center py-8">No tasks scheduled for today</p>
                            ) : (
                                todayTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        onClick={() => toggleTask(task.id)}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors cursor-pointer group"
                                    >
                                        {task.completed ? (
                                            <CheckCircle2 className="w-5 h-5 text-primary-500 flex-shrink-0" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-surface-300 group-hover:text-primary-400 flex-shrink-0 transition-colors" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium ${task.completed ? 'text-surface-400 line-through' : 'text-surface-700'}`}>
                                                {task.title}
                                            </p>
                                        </div>
                                        {task.timeSlot && (
                                            <div className="flex items-center gap-1 text-xs text-surface-400 flex-shrink-0">
                                                <Clock className="w-3 h-3" />
                                                {task.timeSlot}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                    {/* Weekly Planner */}
                    <Card title="Weekly Planner" subtitle="Your week at a glance">
                        <div className="grid grid-cols-7 gap-2">
                            {weeklyDays.map((wd) => {
                                const isToday = wd.date === '2026-06-28';
                                const dayTasks = tasks.filter((t) => t.date === wd.date);
                                return (
                                    <div
                                        key={wd.day}
                                        className={`rounded-xl p-3 text-center transition-colors ${isToday
                                                ? 'bg-primary-50 border-2 border-primary-200'
                                                : 'bg-surface-50 border border-surface-200'
                                            }`}
                                    >
                                        <p className={`text-xs font-semibold ${isToday ? 'text-primary-600' : 'text-surface-500'}`}>
                                            {wd.day}
                                        </p>
                                        <p className={`text-lg font-bold mt-1 ${isToday ? 'text-primary-700' : 'text-surface-700'}`}>
                                            {new Date(wd.date).getDate()}
                                        </p>
                                        <div className="mt-2">
                                            {dayTasks.length > 0 ? (
                                                <Badge variant={isToday ? 'primary' : 'default'}>
                                                    {dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}
                                                </Badge>
                                            ) : (
                                                <span className="text-[10px] text-surface-300">Free</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>

                {/* Study Timeline */}
                <div>
                    <Card title="Study Timeline" subtitle="Today's schedule">
                        <div className="space-y-3">
                            {studyBlocks.map((block) => (
                                <div key={block.id} className="relative">
                                    <div
                                        className="rounded-xl p-4 border-l-4 bg-surface-50 hover:bg-white hover:shadow-sm transition-all"
                                        style={{ borderLeftColor: block.color }}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-surface-700">{block.title}</p>
                                                <p className="text-xs text-surface-400 mt-0.5">{block.subject}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-2 text-xs text-surface-500">
                                            <Clock className="w-3 h-3" />
                                            <span>{block.startTime} – {block.endTime}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Planner;
