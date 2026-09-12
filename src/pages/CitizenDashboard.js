import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/i18n/translations';
import { fetchAllZonesWithRisk, fetchAlerts, fetchInfrastructure } from '@/services/api';
import { RiskGauge, SeverityBadge } from '@/components/RiskDisplay';
import { AlertFeed } from '@/components/AlertFeed';
import { ExplanationPanel } from '@/components/ExplanationPanel';
import { StatCard, LoadingSpinner, ErrorState } from '@/components/ui';
import { CloudRain, Users, AlertTriangle, Building2, TrendingUp, Droplets, Wind, Thermometer, Zap, } from 'lucide-react';
export function CitizenDashboard() {
    const { lang } = useLanguage();
    const [zones, setZones] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [infra, setInfra] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedZone, setSelectedZone] = useState(0);
    useEffect(() => {
        Promise.all([fetchAllZonesWithRisk(), fetchAlerts('CITIZEN'), fetchInfrastructure()])
            .then(([z, a, i]) => {
            setZones(z);
            setAlerts(a);
            setInfra(i);
        })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);
    if (loading)
        return _jsx(LoadingSpinner, { label: t(lang, 'loading') });
    if (error)
        return _jsx(ErrorState, { message: error });
    const sorted = [...zones].sort((a, b) => b.risk.risk_score - a.risk.risk_score);
    const top = sorted[selectedZone] ?? sorted[0];
    if (!top)
        return _jsx(ErrorState, { message: t(lang, 'noData') });
    const zoneInfra = infra.filter((i) => i.grid_cell_id === top.cell.id);
    const schools = zoneInfra.filter((i) => i.type === 'school').length;
    const hospitals = zoneInfra.filter((i) => i.type === 'hospital').length;
    const peopleAtRisk = Math.round(top.risk.population_score * 5000);
    return (_jsxs("div", { className: "p-4 lg:p-6 max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-2xl font-bold text-white", children: t(lang, 'citizenDashboard') }), _jsx("p", { className: "text-slate-500 text-sm mt-1", children: "Real-time risk intelligence for your area" })] }), _jsx("div", { className: "flex gap-2 overflow-x-auto pb-2 mb-6", children: sorted.slice(0, 10).map((z, i) => (_jsxs("button", { onClick: () => setSelectedZone(i), className: `shrink-0 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${selectedZone === i
                        ? 'bg-slate-800 border-cyan-500/50 text-white'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white'}`, children: [z.cell.label, _jsx("span", { className: "ml-2 inline-block w-2 h-2 rounded-full", style: { backgroundColor: ['', '#22c55e', '#eab308', '#f97316', '#ef4444'][['SAFE', 'MODERATE', 'HIGH', 'CRITICAL'].indexOf(z.risk.severity_level) + 1] } })] }, z.cell.id))) }), _jsxs("div", { className: "grid lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/40 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm text-slate-500", children: t(lang, 'currentRisk') }), _jsx("div", { className: "text-xl font-bold text-white", children: top.cell.label })] }), _jsx(SeverityBadge, { severity: top.risk.severity_level, size: "lg" })] }), _jsx("div", { className: "flex justify-center my-4", children: _jsx(RiskGauge, { score: top.risk.risk_score, severity: top.risk.severity_level }) })] }), _jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/40 p-6", children: [_jsx("h3", { className: "text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4", children: t(lang, 'weather') }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx(WeatherChip, { icon: Droplets, label: t(lang, 'rainfallForecast'), value: `${Math.round(top.risk.rain_score * 35)}mm`, color: "text-blue-400" }), _jsx(WeatherChip, { icon: Zap, label: t(lang, 'lightningProbability'), value: `${Math.round(top.risk.lightning_score * 100)}%`, color: "text-yellow-400" }), _jsx(WeatherChip, { icon: Wind, label: t(lang, 'windSpeed'), value: `${Math.round(top.risk.wind_score * 60)}km/h`, color: "text-cyan-400" }), _jsx(WeatherChip, { icon: Thermometer, label: t(lang, 'temperature'), value: "28\u00B0C", color: "text-orange-400" })] })] })] }), _jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/40 p-6", children: [_jsxs("h3", { className: "text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2", children: [_jsx(TrendingUp, { size: 16 }), t(lang, 'contributingFactors')] }), _jsx(ExplanationPanel, { factors: top.risk.explanation })] }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx(StatCard, { label: t(lang, 'peopleAtRisk'), value: peopleAtRisk.toLocaleString(), icon: Users, color: "red" }), _jsx(StatCard, { label: "Schools", value: schools, icon: Building2, color: "orange" }), _jsx(StatCard, { label: "Hospitals", value: hospitals, icon: AlertTriangle, color: "yellow" }), _jsx(StatCard, { label: t(lang, 'activeAlerts'), value: alerts.length, icon: CloudRain, color: "cyan" })] }), _jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/40 p-4", children: [_jsx("h3", { className: "text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3", children: t(lang, 'alerts') }), _jsx(AlertFeed, { alerts: alerts.slice(0, 8), maxHeight: "300px" })] })] })] })] }));
}
function WeatherChip({ icon: Icon, label, value, color, }) {
    return (_jsxs("div", { className: "rounded-lg bg-slate-800/40 border border-slate-700/50 p-3", children: [_jsx(Icon, { size: 18, className: color }), _jsx("div", { className: "text-xs text-slate-500 mt-2", children: label }), _jsx("div", { className: "text-sm font-semibold text-white", children: value })] }));
}
