import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';

interface WorkloadDataPoint {
    day: string;
    count: number;
    isToday: boolean;
}

interface WeeklyWorkloadChartProps {
    data: WorkloadDataPoint[];
    isLoading?: boolean;
}

const ChartSkeleton: React.FC = () => (
    <div className="animate-pulse space-y-3">
        <div className="flex items-end justify-between gap-2 h-36">
            {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div
                        className="w-full bg-surface-100 rounded-t-lg"
                        style={{ height: `${20 + Math.random() * 60}%` }}
                    />
                    <div className="h-3 w-6 bg-surface-100 rounded" />
                </div>
            ))}
        </div>
    </div>
);

const CustomTooltip: React.FC<{ active?: boolean; payload?: { value: number }[]; label?: string }> = ({
    active,
    payload,
    label,
}) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-surface-800 text-white px-3 py-2 rounded-lg shadow-lg text-xs">
                <p className="font-semibold">{label}</p>
                <p className="text-surface-300 mt-0.5">
                    {payload[0].value} assignment{payload[0].value !== 1 ? 's' : ''} due
                </p>
            </div>
        );
    }
    return null;
};

export const WeeklyWorkloadChart: React.FC<WeeklyWorkloadChartProps> = ({ data, isLoading }) => {
    if (isLoading) return <ChartSkeleton />;

    return (
        <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data} margin={{ top: 4, right: 0, left: -28, bottom: 0 }} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9', radius: 4 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={
                                entry.isToday
                                    ? '#3b82f6'
                                    : entry.count > 0
                                    ? '#93c5fd'
                                    : '#e2e8f0'
                            }
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};
