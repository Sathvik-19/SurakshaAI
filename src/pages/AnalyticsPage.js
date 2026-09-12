import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/i18n/translations';
import { fetchModelResults, fetchHistoricalEvents } from '@/services/api';
import { LoadingSpinner, ErrorState } from '@/components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, PieChart, Pie, Cell, } from 'recharts';
import { BarChart3, History, TrendingUp, Target, Clock, Zap } from 'lucide-react';
const SEVERITY_COLORS = {
    CRITICAL: '#ef4444', HIGH: '#f97316', MODERATE: '#eab308', SAFE: '#22c55e',
};
export function AnalyticsPage() {
    const { lang } = useLanguage();
    const [results, setResults] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        Promise.all([fetchModelResults(), fetchHistoricalEvents()])
            .then(([r, e]) => {
            setResults(r);
            setEvents(e);
        })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);
    if (loading)
        return _jsx(LoadingSpinner, { label: t(lang, 'loading') });
    if (error)
        return _jsx(ErrorState, { message: error });
    const rainfallMetrics = results.filter((r) => r.model_name === 'rainfall_xgboost');
    const floodMetrics = results.filter((r) => r.model_name === 'flood_logistic');
    const lightningMetrics = results.filter((r) => r.model_name === 'lightning_rf');
    const warningMetrics = results.filter((r) => r.model_name === 'early_warning');
    const floodRadarData = floodMetrics
        .filter((m) => ['precision', 'recall', 'F1', 'accuracy'].includes(m.metric_name))
        .map((m) => ({ metric: m.metric_name.toUpperCase(), value: m.metric_value * 100 }));
    const eventTypeCounts = events.reduce((acc, e) => {
        acc[e.event_type] = (acc[e.event_type] || 0) + 1;
        return acc;
    }, {});
    const pieData = Object.entries(eventTypeCounts).map(([name, value]) => ({ name, value }));
    const pieColors = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#06b6d4', '#a855f7'];
    const getMetric = (list, name) => list.find((m) => m.metric_name === name)?.metric_value ?? 0;
    return (_jsxs("div", { className: "p-4 lg:p-6 max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-6", children: [_jsxs("h1", { className: "text-2xl font-bold text-white flex items-center gap-2", children: [_jsx(BarChart3, { className: "text-cyan-400" }), t(lang, 'analytics')] }), _jsxs("p", { className: "text-slate-500 text-sm mt-1", children: ["Model performance metrics and historical event analysis", _jsx("span", { className: "text-slate-600", children: " \u2014 demo-quality metrics on synthetic data, not validated real-world performance" })] })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-6", children: [_jsx(MetricCard, { label: "Rainfall R\u00B2", value: getMetric(rainfallMetrics, 'R2').toFixed(2), icon: TrendingUp, color: "cyan" }), _jsx(MetricCard, { label: "Flood F1", value: getMetric(floodMetrics, 'F1').toFixed(2), icon: Target, color: "orange" }), _jsx(MetricCard, { label: "Lightning F1", value: getMetric(lightningMetrics, 'F1').toFixed(2), icon: Zap, color: "yellow" }), _jsx(MetricCard, { label: "Lead Time (min)", value: getMetric(warningMetrics, 'lead_time_min').toFixed(0), icon: Clock, color: "emerald" })] }), _jsxs("div", { className: "grid lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/40 p-6", children: [_jsx("h2", { className: "font-semibold text-white mb-4", children: "Rainfall XGBoost \u2014 Error Metrics" }), _jsx(ResponsiveContainer, { width: "100%", height: 220, children: _jsxs(BarChart, { data: rainfallMetrics.map((m) => ({ metric: m.metric_name, value: m.metric_value })), children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1e293b" }), _jsx(XAxis, { dataKey: "metric", stroke: "#64748b", fontSize: 12 }), _jsx(YAxis, { stroke: "#64748b", fontSize: 12 }), _jsx(Tooltip, { contentStyle: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' } }), _jsx(Bar, { dataKey: "value", fill: "#06b6d4", radius: [6, 6, 0, 0] })] }) }), _jsxs("div", { className: "mt-3 grid grid-cols-3 gap-2 text-xs", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-slate-500", children: "MAE" }), _jsxs("div", { className: "text-white font-semibold", children: [getMetric(rainfallMetrics, 'MAE').toFixed(1), "mm"] })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-slate-500", children: "RMSE" }), _jsxs("div", { className: "text-white font-semibold", children: [getMetric(rainfallMetrics, 'RMSE').toFixed(1), "mm"] })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-slate-500", children: "R\u00B2" }), _jsx("div", { className: "text-white font-semibold", children: getMetric(rainfallMetrics, 'R2').toFixed(2) })] })] })] }), _jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/40 p-6", children: [_jsx("h2", { className: "font-semibold text-white mb-4", children: "Flood Logistic \u2014 Classification Metrics" }), _jsx(ResponsiveContainer, { width: "100%", height: 220, children: _jsxs(RadarChart, { data: floodRadarData, children: [_jsx(PolarGrid, { stroke: "#1e293b" }), _jsx(PolarAngleAxis, { dataKey: "metric", stroke: "#94a3b8", fontSize: 12 }), _jsx(PolarRadiusAxis, { stroke: "#475569", fontSize: 10, domain: [0, 100] }), _jsx(Radar, { dataKey: "value", stroke: "#f97316", fill: "#f97316", fillOpacity: 0.3, strokeWidth: 2 }), _jsx(Tooltip, { contentStyle: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' } })] }) }), _jsx("div", { className: "mt-3 grid grid-cols-4 gap-2 text-xs", children: floodMetrics.filter((m) => ['precision', 'recall', 'F1', 'accuracy'].includes(m.metric_name)).map((m) => (_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-slate-500 uppercase", children: m.metric_name }), _jsxs("div", { className: "text-white font-semibold", children: [(m.metric_value * 100).toFixed(0), "%"] })] }, m.metric_name))) })] }), _jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/40 p-6", children: [_jsxs("h2", { className: "font-semibold text-white mb-4 flex items-center gap-2", children: [_jsx(Zap, { size: 18, className: "text-orange-400" }), "Event Type Distribution"] }), _jsx(ResponsiveContainer, { width: "100%", height: 220, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: pieData, cx: "50%", cy: "50%", innerRadius: 50, outerRadius: 80, paddingAngle: 3, dataKey: "value", children: pieData.map((_, i) => (_jsx(Cell, { fill: pieColors[i % pieColors.length] }, i))) }), _jsx(Tooltip, { contentStyle: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' } }), _jsx(Legend, { wrapperStyle: { fontSize: '12px', color: '#94a3b8' } })] }) })] }), _jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/40 p-6", children: [_jsxs("h2", { className: "font-semibold text-white mb-4 flex items-center gap-2", children: [_jsx(History, { size: 18, className: "text-cyan-400" }), t(lang, 'historicalEvents')] }), _jsx("div", { className: "space-y-2 max-h-[220px] overflow-y-auto", children: events.map((e) => (_jsxs("div", { className: "flex items-center gap-3 rounded-lg bg-slate-800/40 border border-slate-700/50 px-3 py-2.5", children: [_jsx("span", { className: "w-2 h-2 rounded-full shrink-0", style: { backgroundColor: SEVERITY_COLORS[e.severity] } }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("div", { className: "text-sm font-medium text-white capitalize", children: e.event_type.replace('_', ' ') }), _jsxs("div", { className: "text-xs text-slate-500", children: [new Date(e.event_date).toLocaleDateString(), " \u2014 ", e.affected_grid_cells, " zones affected"] })] }), _jsx("span", { className: "text-xs font-semibold uppercase", style: { color: SEVERITY_COLORS[e.severity] }, children: e.severity })] }, e.id))) })] })] }), _jsxs("div", { className: "mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-6", children: [_jsx("h2", { className: "font-semibold text-white mb-4", children: "Early Warning System Performance" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: warningMetrics.map((m) => (_jsxs("div", { className: "rounded-xl bg-slate-800/40 border border-slate-700/50 p-4 text-center", children: [_jsx("div", { className: "text-2xl font-bold text-cyan-400 tabular-nums", children: m.metric_name === 'lead_time_min' ? `${m.metric_value.toFixed(0)}m` : `${(m.metric_value * 100).toFixed(0)}%` }), _jsx("div", { className: "text-xs text-slate-500 uppercase tracking-wider mt-1", children: m.metric_name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) })] }, m.id))) })] })] }));
}
function MetricCard({ label, value, icon: Icon, color, }) {
    const colorMap = {
        cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
        orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
        yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    };
    return (_jsxs("div", { className: `rounded-xl border p-4 ${colorMap[color]}`, children: [_jsx(Icon, { size: 20 }), _jsx("div", { className: "text-2xl font-bold text-white tabular-nums mt-2", children: value }), _jsx("div", { className: "text-xs text-slate-500 uppercase tracking-wider mt-0.5", children: label })] }));
}
