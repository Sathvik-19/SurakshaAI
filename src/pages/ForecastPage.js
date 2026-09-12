import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/i18n/translations';
import { fetchAllZonesWithRisk, fetchZoneDetail } from '@/services/api';
import { SeverityBadge } from '@/components/RiskDisplay';
import { LoadingSpinner, ErrorState } from '@/components/ui';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, } from 'recharts';
import { Clock, CloudRain, Zap } from 'lucide-react';
export function ForecastPage() {
    const { lang } = useLanguage();
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [detail, setDetail] = useState(null);
    useEffect(() => {
        fetchAllZonesWithRisk()
            .then(setZones)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);
    useEffect(() => {
        if (!selectedId && zones.length > 0) {
            setSelectedId(zones[0].cell.id);
        }
    }, [zones, selectedId]);
    useEffect(() => {
        if (!selectedId)
            return;
        fetchZoneDetail(selectedId).then(setDetail);
    }, [selectedId]);
    if (loading)
        return _jsx(LoadingSpinner, { label: t(lang, 'loading') });
    if (error)
        return _jsx(ErrorState, { message: error });
    const sorted = [...zones].sort((a, b) => b.risk.risk_score - a.risk.risk_score);
    const current = sorted.find((z) => z.cell.id === selectedId) ?? sorted[0];
    const forecastData = detail?.predictions.map((p) => ({
        horizon: `+${p.horizon_minutes}m`,
        rainfall: Math.round(p.rainfall_forecast_mm * 10) / 10,
        flood: Math.round(p.flood_probability * 100),
        lightning: Math.round(p.lightning_probability * 100),
        wind: Math.round(p.wind_forecast_kmph),
    })) ?? [];
    const radarData = current
        ? [
            { factor: t(lang, 'rainfallForecast'), value: Math.round(current.risk.rain_score * 100) },
            { factor: t(lang, 'floodProbability'), value: Math.round(current.risk.flood_score * 100) },
            { factor: t(lang, 'lightningProbability'), value: Math.round(current.risk.lightning_score * 100) },
            { factor: t(lang, 'windSpeed'), value: Math.round(current.risk.wind_score * 100) },
            { factor: t(lang, 'population'), value: Math.round(current.risk.population_score * 100) },
            { factor: 'Vulnerability', value: Math.round(current.risk.vulnerability_score * 100) },
        ]
        : [];
    return (_jsxs("div", { className: "p-4 lg:p-6 max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-2xl font-bold text-white", children: t(lang, 'forecast') }), _jsx("p", { className: "text-slate-500 text-sm mt-1", children: "30 min / 1 hr / 3 hr predictions per zone" })] }), _jsx("div", { className: "flex gap-2 overflow-x-auto pb-2 mb-6", children: sorted.map((z) => (_jsx("button", { onClick: () => setSelectedId(z.cell.id), className: `shrink-0 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${selectedId === z.cell.id
                        ? 'bg-slate-800 border-cyan-500/50 text-white'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white'}`, children: z.cell.label }, z.cell.id))) }), current && (_jsxs("div", { className: "grid lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/40 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h2", { className: "font-semibold text-white", children: [current.cell.label, " \u2014 ", t(lang, 'forecast')] }), _jsx(SeverityBadge, { severity: current.risk.severity_level })] }), _jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "text-xs text-slate-400 mb-2 flex items-center gap-2", children: [_jsx(CloudRain, { size: 14, className: "text-blue-400" }), "Rainfall Forecast (mm)"] }), _jsx(ResponsiveContainer, { width: "100%", height: 160, children: _jsxs(AreaChart, { data: forecastData, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "rainGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "#3b82f6", stopOpacity: 0.5 }), _jsx("stop", { offset: "100%", stopColor: "#3b82f6", stopOpacity: 0 })] }) }), _jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1e293b" }), _jsx(XAxis, { dataKey: "horizon", stroke: "#64748b", fontSize: 12 }), _jsx(YAxis, { stroke: "#64748b", fontSize: 12 }), _jsx(Tooltip, { contentStyle: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' } }), _jsx(Area, { type: "monotone", dataKey: "rainfall", stroke: "#3b82f6", fill: "url(#rainGrad)", strokeWidth: 2 })] }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "text-xs text-slate-400 mb-2 flex items-center gap-2", children: [_jsx(Zap, { size: 14, className: "text-yellow-400" }), "Flood & Lightning Probability (%)"] }), _jsx(ResponsiveContainer, { width: "100", height: 160, children: _jsxs(BarChart, { data: forecastData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1e293b" }), _jsx(XAxis, { dataKey: "horizon", stroke: "#64748b", fontSize: 12 }), _jsx(YAxis, { stroke: "#64748b", fontSize: 12, domain: [0, 100] }), _jsx(Tooltip, { contentStyle: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' } }), _jsx(Bar, { dataKey: "flood", fill: "#ef4444", radius: [4, 4, 0, 0], name: "Flood %" }), _jsx(Bar, { dataKey: "lightning", fill: "#eab308", radius: [4, 4, 0, 0], name: "Lightning %" })] }) })] })] }), _jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/40 p-6", children: [_jsx("h2", { className: "font-semibold text-white mb-4", children: "Risk Factor Breakdown" }), _jsx(ResponsiveContainer, { width: "100%", height: 320, children: _jsxs(RadarChart, { data: radarData, children: [_jsx(PolarGrid, { stroke: "#1e293b" }), _jsx(PolarAngleAxis, { dataKey: "factor", stroke: "#94a3b8", fontSize: 11 }), _jsx(PolarRadiusAxis, { stroke: "#475569", fontSize: 10, domain: [0, 100] }), _jsx(Radar, { dataKey: "value", stroke: "#06b6d4", fill: "#06b6d4", fillOpacity: 0.3, strokeWidth: 2 }), _jsx(Tooltip, { contentStyle: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' } })] }) }), detail && (_jsxs("div", { className: "mt-4 space-y-2", children: [_jsx("h3", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider", children: "Prediction Details" }), detail.predictions.map((p) => (_jsxs("div", { className: "flex items-center gap-3 rounded-lg bg-slate-800/40 border border-slate-700/50 px-3 py-2.5", children: [_jsx(Clock, { size: 16, className: "text-cyan-400 shrink-0" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("span", { className: "text-sm font-semibold text-white", children: ["+", p.horizon_minutes, " min"] }), _jsxs("span", { className: "text-xs text-slate-500 ml-2", children: ["Confidence: ", Math.round(p.confidence_score * 100), "%"] })] }), _jsxs("div", { className: "flex gap-3 text-xs", children: [_jsxs("span", { className: "text-blue-400", children: [p.rainfall_forecast_mm.toFixed(1), "mm"] }), _jsxs("span", { className: "text-red-400", children: [Math.round(p.flood_probability * 100), "%"] }), _jsxs("span", { className: "text-yellow-400", children: [Math.round(p.lightning_probability * 100), "%"] })] })] }, p.id)))] }))] })] }))] }));
}
