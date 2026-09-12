import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SEVERITY_COLORS } from '@/lib/riskEngine';
import { Bell, Clock } from 'lucide-react';
function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1)
        return 'Just now';
    if (min < 60)
        return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24)
        return `${hr}h ago`;
    return `${Math.floor(hr / 24)}d ago`;
}
export function AlertFeed({ alerts, maxHeight = '500px' }) {
    if (!alerts || alerts.length === 0) {
        return (_jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-slate-500", children: [_jsx(Bell, { size: 32, className: "mb-3 opacity-50" }), _jsx("p", { className: "text-sm", children: "No active alerts" })] }));
    }
    return (_jsx("div", { className: "space-y-2.5 overflow-y-auto", style: { maxHeight }, children: alerts.map((alert) => {
            const color = SEVERITY_COLORS[alert.severity];
            return (_jsxs("div", { className: "rounded-lg border bg-slate-800/40 px-4 py-3 hover:bg-slate-800/70 transition-all", style: { borderColor: `${color}33` }, children: [_jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 rounded-full animate-pulse", style: { backgroundColor: color } }), _jsx("span", { className: "text-xs font-semibold uppercase tracking-wider", style: { color }, children: alert.severity }), _jsx("span", { className: "text-xs text-slate-500", children: "\u00B7" }), _jsx("span", { className: "text-xs text-slate-500 uppercase", children: alert.audience_role })] }), _jsxs("div", { className: "flex items-center gap-1 text-xs text-slate-500", children: [_jsx(Clock, { size: 12 }), timeAgo(alert.sent_at)] })] }), _jsx("p", { className: "text-sm text-slate-300 leading-relaxed", children: alert.message })] }, alert.id));
        }) }));
}
