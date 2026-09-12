import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/i18n/translations';
import { fetchAllZonesWithRisk, fetchInfrastructure, fetchZoneDetail } from '@/services/api';
import { RiskMap } from '@/components/RiskMap';
import { RiskGauge, SeverityBadge } from '@/components/RiskDisplay';
import { ExplanationPanel } from '@/components/ExplanationPanel';
import { LoadingSpinner, ErrorState } from '@/components/ui';
import { Hospital, School, Shield, Flame, Home, Construction, Layers, X, MapPin, Users, CloudRain, } from 'lucide-react';
const INFRA_TYPES = [
    { type: 'hospital', icon: Hospital, label: 'Hospitals' },
    { type: 'school', icon: School, label: 'Schools' },
    { type: 'police', icon: Shield, label: 'Police' },
    { type: 'fire_station', icon: Flame, label: 'Fire' },
    { type: 'shelter', icon: Home, label: 'Shelters' },
    { type: 'bridge', icon: Construction, label: 'Bridges' },
];
export function LiveRiskMap() {
    const { lang } = useLanguage();
    const [zones, setZones] = useState([]);
    const [infra, setInfra] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [detail, setDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [infraFilters, setInfraFilters] = useState(new Set());
    useEffect(() => {
        Promise.all([fetchAllZonesWithRisk(), fetchInfrastructure()])
            .then(([z, i]) => {
            setZones(z);
            setInfra(i);
        })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);
    useEffect(() => {
        if (!selectedId)
            return;
        setDetailLoading(true);
        fetchZoneDetail(selectedId)
            .then(setDetail)
            .catch(() => setDetail(null))
            .finally(() => setDetailLoading(false));
    }, [selectedId]);
    if (loading)
        return _jsx(LoadingSpinner, { label: t(lang, 'loading') });
    if (error)
        return _jsx(ErrorState, { message: error });
    const toggleInfra = (type) => {
        setInfraFilters((prev) => {
            const next = new Set(prev);
            if (next.has(type))
                next.delete(type);
            else
                next.add(type);
            return next;
        });
    };
    return (_jsxs("div", { className: "flex h-[calc(100vh-4rem)]", children: [_jsxs("div", { className: "flex-1 relative", children: [_jsx(RiskMap, { cells: zones, infrastructure: infra, infraFilters: infraFilters, onZoneClick: setSelectedId, selectedCellId: selectedId, className: "h-full w-full" }), _jsxs("div", { className: "absolute top-4 left-4 z-[1000] rounded-xl border border-slate-700 bg-slate-900/90 backdrop-blur p-3 max-w-xs", children: [_jsxs("div", { className: "flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5", children: [_jsx(Layers, { size: 14 }), "Infrastructure Layers"] }), _jsx("div", { className: "grid grid-cols-3 gap-1.5", children: INFRA_TYPES.map(({ type, icon: Icon, label }) => (_jsxs("button", { onClick: () => toggleInfra(type), className: `flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] font-medium transition-all ${infraFilters.has(type)
                                        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                                        : 'bg-slate-800/50 text-slate-500 border border-transparent hover:text-slate-300'}`, children: [_jsx(Icon, { size: 16 }), label] }, type))) })] })] }), selectedId && (_jsxs("div", { className: "w-full max-w-md border-l border-slate-800 bg-slate-950 overflow-y-auto", children: [_jsxs("div", { className: "sticky top-0 bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between z-10", children: [_jsx("h2", { className: "font-bold text-white text-lg", children: t(lang, 'zoneDetails') }), _jsx("button", { onClick: () => setSelectedId(null), className: "text-slate-500 hover:text-white", children: _jsx(X, { size: 20 }) })] }), detailLoading ? (_jsx(LoadingSpinner, { label: t(lang, 'loading') })) : detail ? (_jsxs("div", { className: "p-4 space-y-5", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-lg font-bold text-white", children: detail.gridCell.label }), _jsx("div", { className: "text-xs text-slate-500 font-mono", children: detail.gridCell.cell_code })] }), _jsx(SeverityBadge, { severity: detail.risk?.severity_level ?? 'SAFE', size: "lg" })] }), _jsx("div", { className: "flex justify-center", children: _jsx(RiskGauge, { score: detail.risk?.risk_score ?? 0, severity: detail.risk?.severity_level ?? 'SAFE' }) }), detail.weather.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2", children: t(lang, 'weather') }), _jsxs("div", { className: "grid grid-cols-2 gap-2 text-sm", children: [_jsxs("div", { className: "rounded-lg bg-slate-900/60 border border-slate-800 p-2.5", children: [_jsx("span", { className: "text-slate-500 text-xs", children: t(lang, 'rainfallForecast') }), _jsxs("div", { className: "text-white font-semibold", children: [detail.weather[0].rainfall_mm.toFixed(1), "mm"] })] }), _jsxs("div", { className: "rounded-lg bg-slate-900/60 border border-slate-800 p-2.5", children: [_jsx("span", { className: "text-slate-500 text-xs", children: t(lang, 'temperature') }), _jsxs("div", { className: "text-white font-semibold", children: [detail.weather[0].temperature_c.toFixed(1), "\u00B0C"] })] }), _jsxs("div", { className: "rounded-lg bg-slate-900/60 border border-slate-800 p-2.5", children: [_jsx("span", { className: "text-slate-500 text-xs", children: t(lang, 'humidity') }), _jsxs("div", { className: "text-white font-semibold", children: [detail.weather[0].humidity_pct.toFixed(0), "%"] })] }), _jsxs("div", { className: "rounded-lg bg-slate-900/60 border border-slate-800 p-2.5", children: [_jsx("span", { className: "text-slate-500 text-xs", children: t(lang, 'windSpeed') }), _jsxs("div", { className: "text-white font-semibold", children: [detail.weather[0].wind_speed_kmph.toFixed(0), "km/h"] })] })] })] })), detail.risk?.explanation && (_jsxs("div", { children: [_jsx("h3", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2", children: t(lang, 'contributingFactors') }), _jsx(ExplanationPanel, { factors: detail.risk.explanation })] })), detail.population && (_jsxs("div", { children: [_jsx("h3", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2", children: t(lang, 'population') }), _jsxs("div", { className: "grid grid-cols-3 gap-2 text-sm", children: [_jsxs("div", { className: "rounded-lg bg-slate-900/60 border border-slate-800 p-2.5 text-center", children: [_jsx(Users, { size: 16, className: "text-cyan-400 mx-auto mb-1" }), _jsx("div", { className: "text-white font-semibold", children: detail.population.total_population.toLocaleString() }), _jsx("div", { className: "text-slate-500 text-[10px]", children: "Total" })] }), _jsxs("div", { className: "rounded-lg bg-slate-900/60 border border-slate-800 p-2.5 text-center", children: [_jsx(School, { size: 16, className: "text-orange-400 mx-auto mb-1" }), _jsx("div", { className: "text-white font-semibold", children: detail.population.children }), _jsx("div", { className: "text-slate-500 text-[10px]", children: t(lang, 'children') })] }), _jsxs("div", { className: "rounded-lg bg-slate-900/60 border border-slate-800 p-2.5 text-center", children: [_jsx(Home, { size: 16, className: "text-yellow-400 mx-auto mb-1" }), _jsx("div", { className: "text-white font-semibold", children: detail.population.elderly }), _jsx("div", { className: "text-slate-500 text-[10px]", children: t(lang, 'elderly') })] })] })] })), detail.infrastructure.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2", children: t(lang, 'infrastructure') }), _jsx("div", { className: "space-y-1.5", children: detail.infrastructure.map((inf) => (_jsxs("div", { className: "flex items-center gap-2 text-sm text-slate-300 rounded-lg bg-slate-900/60 border border-slate-800 px-3 py-2", children: [_jsx(MapPin, { size: 14, className: "text-cyan-400" }), _jsx("span", { className: "font-medium", children: inf.name }), _jsx("span", { className: "text-xs text-slate-500 ml-auto uppercase", children: inf.type.replace('_', ' ') })] }, inf.id))) })] })), detail.predictions.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2", children: t(lang, 'forecast') }), _jsx("div", { className: "space-y-2", children: detail.predictions.map((p) => (_jsxs("div", { className: "rounded-lg bg-slate-900/60 border border-slate-800 p-3", children: [_jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [_jsxs("span", { className: "text-sm font-semibold text-cyan-400", children: ["+", p.horizon_minutes, " min"] }), _jsxs("span", { className: "text-xs text-slate-500", children: ["Confidence: ", Math.round(p.confidence_score * 100), "%"] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-2 text-xs", children: [_jsxs("div", { children: [_jsx(CloudRain, { size: 12, className: "text-blue-400 mb-0.5" }), _jsx("span", { className: "text-slate-400", children: "Rain:" }), _jsxs("span", { className: "text-white font-medium ml-1", children: [p.rainfall_forecast_mm.toFixed(1), "mm"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-400", children: "Flood:" }), _jsxs("span", { className: "text-white font-medium ml-1", children: [Math.round(p.flood_probability * 100), "%"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-400", children: "Lightning:" }), _jsxs("span", { className: "text-white font-medium ml-1", children: [Math.round(p.lightning_probability * 100), "%"] })] })] })] }, p.id))) })] }))] })) : (_jsx(ErrorState, { message: t(lang, 'noData') }))] }))] }));
}
