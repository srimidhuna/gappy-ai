import React, { useRef, useState } from 'react';
import { Clock, Trash2, GripVertical, Pencil } from 'lucide-react';
import { usePlannerStore } from '../../store/plannerStore';
import { useUIStore } from '../../store/uiStore';
import type { StudyBlock } from '../../types';

interface TimelineViewProps {
    onEdit: (block: StudyBlock) => void;
}

const timeToMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
};

const formatTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
};

const durationLabel = (start: string, end: string) => {
    const mins = timeToMinutes(end) - timeToMinutes(start);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`;
};

export const TimelineView: React.FC<TimelineViewProps> = ({ onEdit }) => {
    const { studyBlocks, deleteStudyBlock, reorderStudyBlocks } = usePlannerStore();
    const { addToast } = useUIStore();
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    const [dragging, setDragging] = useState<number | null>(null);

    const sorted = [...studyBlocks].sort((a, b) => a.startTime.localeCompare(b.startTime));

    const handleDragStart = (idx: number) => {
        dragItem.current = idx;
        setDragging(idx);
    };

    const handleDragEnter = (idx: number) => {
        dragOverItem.current = idx;
    };

    const handleDragEnd = () => {
        if (dragItem.current === null || dragOverItem.current === null) {
            setDragging(null);
            return;
        }
        if (dragItem.current === dragOverItem.current) {
            setDragging(null);
            return;
        }
        const newBlocks = [...sorted];
        const dragged = newBlocks.splice(dragItem.current, 1)[0];
        newBlocks.splice(dragOverItem.current, 0, dragged);
        reorderStudyBlocks(newBlocks);
        dragItem.current = null;
        dragOverItem.current = null;
        setDragging(null);
    };

    const handleDelete = (id: string, title: string) => {
        deleteStudyBlock(id);
        addToast({ message: `"${title}" removed`, type: 'info' });
    };

    if (sorted.length === 0) {
        return (
            <div className="py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-surface-100 flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-surface-400" />
                </div>
                <p className="text-sm font-medium text-surface-600">No study blocks yet</p>
                <p className="text-xs text-surface-400 mt-1">Add a study session using the form above.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {sorted.map((block, idx) => (
                <div
                    key={block.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragEnter={() => handleDragEnter(idx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className={`flex items-center gap-3 rounded-xl border-l-4 bg-white p-3.5 shadow-sm transition-all duration-200 cursor-grab active:cursor-grabbing ${
                        dragging === idx ? 'opacity-40 scale-95' : 'hover:shadow-md'
                    }`}
                    style={{ borderLeftColor: block.color }}
                >
                    {/* Drag handle */}
                    <GripVertical className="w-4 h-4 text-surface-300 flex-shrink-0" />

                    {/* Color dot */}
                    <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: block.color }}
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-surface-700 truncate">{block.title}</p>
                        <p className="text-xs text-surface-400 mt-0.5">{block.subject}</p>
                    </div>

                    {/* Time */}
                    <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 text-xs font-medium text-surface-600">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(block.startTime)} – {formatTime(block.endTime)}</span>
                        </div>
                        <p className="text-xs text-surface-400 mt-0.5">{durationLabel(block.startTime, block.endTime)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                            onClick={() => onEdit(block)}
                            className="p-1.5 rounded-lg text-surface-300 hover:text-primary-500 hover:bg-primary-50 transition-colors cursor-pointer"
                            title="Edit block"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => handleDelete(block.id, block.title)}
                            className="p-1.5 rounded-lg text-surface-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete block"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            ))}

            {/* Total study time */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-100">
                <Clock className="w-3.5 h-3.5 text-surface-400" />
                <span className="text-xs text-surface-500">
                    Total:{' '}
                    <span className="font-semibold text-surface-700">
                        {Math.floor(
                            sorted.reduce(
                                (acc, b) => acc + (timeToMinutes(b.endTime) - timeToMinutes(b.startTime)),
                                0
                            ) / 60
                        )}h{' '}
                        {sorted.reduce(
                            (acc, b) => acc + (timeToMinutes(b.endTime) - timeToMinutes(b.startTime)),
                            0
                        ) % 60 > 0
                            ? `${sorted.reduce(
                                (acc, b) => acc + (timeToMinutes(b.endTime) - timeToMinutes(b.startTime)),
                                0
                            ) % 60}m`
                            : ''}
                    </span>{' '}
                    of study time
                </span>
            </div>
        </div>
    );
};
