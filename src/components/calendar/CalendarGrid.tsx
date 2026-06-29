import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { CalendarCell } from './CalendarCell';
import { AssignmentDrawer } from './AssignmentDrawer';
import type { Assignment, AssignmentStatus } from '../../types';

interface CalendarGridProps {
    assignments: Assignment[];
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const statusLegend: { status: AssignmentStatus; label: string; color: string }[] = [
    { status: 'completed', label: 'Completed', color: 'bg-emerald-500' },
    { status: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
    { status: 'pending', label: 'Pending', color: 'bg-amber-400' },
    { status: 'overdue', label: 'Overdue', color: 'bg-red-500' },
];

export const CalendarGrid: React.FC<CalendarGridProps> = ({ assignments }) => {
    const today = new Date();
    const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // Build calendar days grid
    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startPad = firstDay.getDay(); // 0=Sun
        const endPad = 6 - lastDay.getDay();

        const days: { date: Date; isCurrentMonth: boolean }[] = [];

        // Previous month padding
        for (let i = startPad - 1; i >= 0; i--) {
            const d = new Date(year, month, -i);
            days.push({ date: d, isCurrentMonth: false });
        }

        // Current month
        for (let d = 1; d <= lastDay.getDate(); d++) {
            days.push({ date: new Date(year, month, d), isCurrentMonth: true });
        }

        // Next month padding
        for (let i = 1; i <= endPad; i++) {
            days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
        }

        return days;
    }, [year, month]);

    // Map assignments to their due dates
    const assignmentsByDate = useMemo(() => {
        const map: Record<string, Assignment[]> = {};
        assignments.forEach((a) => {
            const key = a.dueDate.split('T')[0];
            if (!map[key]) map[key] = [];
            map[key].push(a);
        });
        return map;
    }, [assignments]);

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
    const goToToday = () => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));

    const handleAssignmentClick = (a: Assignment) => {
        setSelectedAssignment(a);
        setDrawerOpen(true);
    };

    const isToday = (d: Date) =>
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate();

    return (
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
            {/* Calendar header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
                <div className="flex items-center gap-3">
                    <button
                        onClick={prevMonth}
                        className="p-2 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <h2 className="text-base font-bold text-surface-800 min-w-[160px] text-center">
                        {MONTH_NAMES[month]} {year}
                    </h2>
                    <button
                        onClick={nextMonth}
                        className="p-2 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors cursor-pointer"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    {/* Legend */}
                    <div className="hidden md:flex items-center gap-3">
                        {statusLegend.map((l) => (
                            <div key={l.status} className="flex items-center gap-1.5">
                                <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                                <span className="text-xs text-surface-500">{l.label}</span>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={goToToday}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 border border-primary-200 transition-colors cursor-pointer"
                    >
                        <CalendarDays className="w-3.5 h-3.5" />
                        Today
                    </button>
                </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-surface-100">
                {WEEKDAY_LABELS.map((day) => (
                    <div
                        key={day}
                        className="py-2 text-center text-xs font-semibold text-surface-500 border-r border-surface-100 last:border-r-0"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
                {calendarDays.map(({ date, isCurrentMonth }, idx) => {
                    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                    const dayAssignments = assignmentsByDate[dateKey] ?? [];
                    return (
                        <CalendarCell
                            key={idx}
                            date={date}
                            isCurrentMonth={isCurrentMonth}
                            isToday={isToday(date)}
                            assignments={dayAssignments}
                            onAssignmentClick={handleAssignmentClick}
                        />
                    );
                })}
            </div>

            {/* Mobile legend */}
            <div className="flex md:hidden flex-wrap items-center gap-3 px-5 py-3 border-t border-surface-100 bg-surface-50">
                {statusLegend.map((l) => (
                    <div key={l.status} className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${l.color}`} />
                        <span className="text-xs text-surface-500">{l.label}</span>
                    </div>
                ))}
            </div>

            {/* Drawer */}
            <AssignmentDrawer
                assignment={selectedAssignment}
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            />
        </div>
    );
};
