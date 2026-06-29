import React from 'react';
import { CalendarDays } from 'lucide-react';
import { CalendarGrid } from '../components/calendar/CalendarGrid';
import { useAssignmentStore } from '../store/assignmentStore';

const Calendar: React.FC = () => {
    const { assignments } = useAssignmentStore();

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-surface-800 flex items-center gap-2">
                    <CalendarDays className="w-7 h-7 text-primary-500" />
                    Calendar
                </h1>
                <p className="text-sm text-surface-500 mt-1">
                    View all your assignment deadlines at a glance. Click any assignment to see details.
                </p>
            </div>

            {/* Calendar */}
            <CalendarGrid assignments={assignments} />
        </div>
    );
};

export default Calendar;
