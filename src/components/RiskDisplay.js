import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SEVERITY_COLORS } from '@/lib/riskEngine';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/i18n/translations';
export function SeverityBadge({ severity, size = 'md' }) {
    const { lang } = useLanguage();
    const color = SEVERITY_COLORS[severity];
    const sizes = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5',
    };
    return (_jsxs("span", { className: `inline-flex items-center gap-1.5 rounded-full font-semibold ${sizes[size]}`, style: { backgroundColor: `${color}22`, color, border: `1px solid ${color}55` }, children: [_jsx("span", { className: "w-2 h-2 rounded-full", style: { backgroundColor: color } }), t(lang, severity.toLowerCase())] }));
}
export function RiskScoreDisplay({ score, severity }) {
    const { lang } = useLanguage();
    const color = SEVERITY_COLORS[severity];
    return (_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: "text-5xl font-bold tabular-nums", style: { color, textShadow: `0 0 30px ${color}44` }, children: score }), _jsxs("div", { className: "text-xs text-slate-400 uppercase tracking-wider mt-1", children: [t(lang, 'riskScore'), " / 100"] })] }));
}
export function RiskGauge({ score, severity }) {
    const color = SEVERITY_COLORS[severity];
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    return (_jsxs("div", { className: "relative inline-flex items-center justify-center", children: [_jsxs("svg", { width: "180", height: "180", className: "-rotate-90", children: [_jsx("circle", { cx: "90", cy: "90", r: radius, stroke: "#1e293b", strokeWidth: "12", fill: "none" }), _jsx("circle", { cx: "90", cy: "90", r: radius, stroke: color, strokeWidth: "12", fill: "none", strokeLinecap: "round", strokeDasharray: circumference, strokeDashoffset: offset, style: {
                            transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease',
                            filter: `drop-shadow(0 0 8px ${color}88)`,
                        } })] }), _jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center", children: [_jsx("span", { className: "text-4xl font-bold tabular-nums", style: { color }, children: score }), _jsx("span", { className: "text-xs text-slate-500 uppercase tracking-wider", children: "/ 100" })] })] }));
}
