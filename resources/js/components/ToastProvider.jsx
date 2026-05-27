import React, { createContext, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

const toneStyles = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    info: 'border-sky-200 bg-sky-50 text-sky-950',
    warning: 'border-amber-200 bg-amber-50 text-amber-950',
    error: 'border-rose-200 bg-rose-50 text-rose-950',
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const api = useMemo(() => ({
        pushToast: ({ title, message, tone = 'info' }) => {
            const id = crypto.randomUUID();
            const toast = { id, title, message, tone };

            setToasts((current) => [...current, toast]);

            window.setTimeout(() => {
                setToasts((current) => current.filter((entry) => entry.id !== id));
            }, 3200);
        },
    }), []);

    return (
        <ToastContext.Provider value={api}>
            {children}
            <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(100%-2rem,24rem)] flex-col gap-3">
                {toasts.map((toast) => (
                    <article key={toast.id} className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-lg ${toneStyles[toast.tone]}`}>
                        <p className="text-sm font-semibold">{toast.title}</p>
                        <p className="mt-1 text-sm leading-6 opacity-90">{toast.message}</p>
                    </article>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToast must be used inside a ToastProvider');
    }

    return context;
}