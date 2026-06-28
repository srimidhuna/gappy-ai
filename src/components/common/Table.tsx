import React from 'react';

interface Column<T> {
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (item: T) => string;
    onRowClick?: (item: T) => void;
    emptyMessage?: string;
}

export function Table<T>({
    columns,
    data,
    keyExtractor,
    onRowClick,
    emptyMessage = 'No data available',
}: TableProps<T>) {
    if (data.length === 0) {
        return (
            <div className="text-center py-12 text-surface-400">
                <p className="text-sm">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-surface-200">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={`text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3 ${col.className || ''}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                    {data.map((item) => (
                        <tr
                            key={keyExtractor(item)}
                            onClick={() => onRowClick?.(item)}
                            className={`transition-colors hover:bg-surface-50 ${onRowClick ? 'cursor-pointer' : ''
                                }`}
                        >
                            {columns.map((col) => (
                                <td key={col.key} className={`px-4 py-3 text-sm ${col.className || ''}`}>
                                    {col.render
                                        ? col.render(item)
                                        : String((item as Record<string, unknown>)[col.key] ?? '')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
