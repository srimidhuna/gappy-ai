import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    onDismiss: (id: string) => void;
    duration?: number;
}

const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
};

const bgClasses: Record<ToastType, string> = {
    success: 'bg-emerald-50 border-emerald-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-amber-50 border-amber-200',
};

export const Toast: React.FC<ToastProps> = ({
    id,
    message,
    type,
    onDismiss,
    duration = 4000,
}) => {
    useEffect(() => {
        const timer = setTimeout(() => onDismiss(id), duration);
        return () => clearTimeout(timer);
    }, [id, duration, onDismiss]);

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${bgClasses[type]} animate-[slideIn_0.3s_ease-out]`}
        >
            {icons[type]}
            <p className="text-sm font-medium text-surface-700 flex-1">{message}</p>
            <button
                onClick={() => onDismiss(id)}
                className="p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
            >
                <X className="w-4 h-4 text-surface-400" />
            </button>
        </div>
    );
};

// Toast Container
interface ToastContainerProps {
    toasts: { id: string; message: string; type: ToastType }[];
    onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
            {toasts.map((toast) => (
                <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
};
