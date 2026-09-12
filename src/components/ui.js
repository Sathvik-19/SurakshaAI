import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
export function useAsyncData(fetcher, deps = []) {
    const [state, setState] = useState({ data: null, loading: true, error: null });
    useEffect(() => {
        let mounted = true;
        setState((s) => ({ ...s, loading: true, error: null }));
        fetcher()
            .then((data) => {
            if (mounted)
                setState({ data, loading: false, error: null });
        })
            .catch((err) => {
            if (mounted)
                setState({ data: null, loading: false, error: err.message ?? 'Failed to load' });
        });
        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
    return state;
}
export function LoadingSpinner({ label = 'Loading...' }) {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-slate-500", children: [_jsx(Loader2, { className: "animate-spin mb-3", size: 28 }), _jsx("p", { className: "text-sm", children: label })] }));
}
export function ErrorState({ message }) {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-red-400", children: [_jsx(AlertCircle, { className: "mb-3", size: 28 }), _jsx("p", { className: "text-sm", children: message })] }));
}
export function EmptyState({ message }) {
    return (_jsx("div", { className: "flex flex-col items-center justify-center py-20 text-slate-500", children: _jsx("p", { className: "text-sm", children: message }) }));
}
export function StatCard({ label, value, icon: Icon, color = 'cyan', subtitle, }) {
    const colorMap = {
        cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
        red: 'text-red-400 bg-red-500/10 border-red-500/20',
        orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
        yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    };
    return (_jsxs("div", { className: `rounded-xl border p-4 ${colorMap[color]}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx(Icon, { size: 20 }), _jsx("span", { className: "text-xs uppercase tracking-wider text-slate-500", children: label })] }), _jsx("div", { className: "text-2xl font-bold text-white tabular-nums", children: value }), subtitle && _jsx("div", { className: "text-xs text-slate-500 mt-0.5", children: subtitle })] }));
}
