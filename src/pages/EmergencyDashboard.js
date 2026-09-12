import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/i18n/translations';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAllZonesWithRisk, fetchAlerts, fetchInfrastructure } from '@/services/api';
import { StatCard, LoadingSpinner, ErrorState } from '@/components/ui';
import { AlertFeed } from '@/components/AlertFeed';
import { RiskMap } from '@/components/RiskMap';
import { AlertTriangle, Users, School, Hospital, Radio, Shield, Activity, Siren, } from 'lucide-react';
export function EmergencyDashboard() {
    const { lang } = useLanguage();
    const { role } = useAuth();
    const [zones, setZones] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [infra, setInfra] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    useEffect(() => {
        Promise.all([fetchAllZonesWithRisk(), fetchAlerts(), fetchInfrastructure()])
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
    if (role !== 'AUTHORITY' && role !== 'ADMIN') {
        return (_jsxs("div", { className: "flex flex-col items-center justify-center min-h-[60vh] text-center px-4", children: [_jsx(Shield, { className: "text-red-400 mb-4", size: 48 }), _jsx("h2", { className: "text-xl font-bold text-white mb-2", children: "Access Restricted" }), _jsx("p", { className: "text-slate-400 text-sm", children: "The Emergency Command Center is only available to AUTHORITY and ADMIN roles." })] }));
    }
    const critical = zones.filter((z) => z.risk.severity_level === 'CRITICAL');
    const high = zones.filter((z) => z.risk.severity_level === 'HIGH');
    const moderate = zones.filter((z) => z.risk.severity_level === 'MODERATE');
    const safe = zones.filter((z) => z.risk.severity_level === 'SAFE');
    const peopleAtRisk = [...critical, ...high].reduce((sum, z) => sum + Math.round(z.risk.population_score * 5000), 0);
    const criticalAlerts = alerts.filter((a) => a.severity === 'CRITICAL').length;
    const schoolsAtRisk = infra.filter((i) => {
        const zone = zones.find((z) => z.cell.id === i.grid_cell_id);
        return i.type === 'school' && zone && (zone.risk.severity_level === 'CRITICAL' || zone.risk.severity_level === 'HIGH');
    }).length;
    const hospitalsAtRisk = infra.filter((i) => {
        const zone = zones.find((z) => z.cell.id === i.grid_cell_id);
        return i.type === 'hospital' && zone && (zone.risk.severity_level === 'CRITICAL' || zone.risk.severity_level === 'HIGH');
    }).length;
    const authorityAlerts = alerts.filter((a) => a.audience_role === 'AUTHORITY');
    const severityColor = {
        CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/20',
        HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
        MODERATE: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
        SAFE: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    };
    return (_jsxs("div", { className: "p-4 lg:p-6 max-w-7xl mx-auto", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-white flex items-center gap-2", children: [_jsx(Radio, { className: "text-red-400 animate-pulse" }), t(lang, 'emergencyDashboard')] }), _jsx("p", { className: "text-slate-500 text-sm mt-1", children: "Authority command center \u2014 real-time situational awareness" })] }), _jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30", children: [_jsx(Siren, { size: 16, className: "text-red-400 animate-pulse" }), _jsx("span", { className: "text-sm font-semibold text-red-400 uppercase", children: "Live" })] })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6", children: [_jsx(StatCard, { label: "Critical", value: critical.length, icon: AlertTriangle, color: "red" }), _jsx(StatCard, { label: "High", value: high.length, icon: Activity, color: "orange" }), _jsx(StatCard, { label: "Moderate", value: moderate.length, icon: Activity, color: "yellow" }), _jsx(StatCard, { label: t(lang, 'peopleAtRisk'), value: peopleAtRisk.toLocaleString(), icon: Users, color: "red" }), _jsx(StatCard, { label: "Schools", value: schoolsAtRisk, icon: School, color: "orange", subtitle: "at risk" }), _jsx(StatCard, { label: "Hospitals", value: hospitalsAtRisk, icon: Hospital, color: "red", subtitle: "at risk" })] }), _jsxs("div", { className: "grid lg:grid-cols-3 gap-6", children: [_jsx("div", { className: "lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden h-[400px]", children: _jsx(RiskMap, { cells: zones, onZoneClick: setSelectedId, selectedCellId: selectedId, className: "h-full w-full" }) }), _jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/40 p-4", children: [_jsxs("h3", { className: "text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2", children: [_jsx(Siren, { size: 14, className: "text-red-400" }), "Authority Alerts"] }), _jsx(AlertFeed, { alerts: authorityAlerts.slice(0, 10), maxHeight: "340px" })] })] }), _jsxs("div", { className: "mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-4", children: [_jsx("h3", { className: "text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3", children: "Zone Status Breakdown" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: ['CRITICAL', 'HIGH', 'MODERATE', 'SAFE'].map((sev) => {
                            const count = [critical.length, high.length, moderate.length, safe.length][['CRITICAL', 'HIGH', 'MODERATE', 'SAFE'].indexOf(sev)];
                            return (_jsxs("div", { className: `rounded-xl border p-4 ${severityColor[sev]}`, children: [_jsx("div", { className: "text-3xl font-bold tabular-nums", children: count }), _jsx("div", { className: "text-xs uppercase tracking-wider mt-1 opacity-80", children: t(lang, sev.toLowerCase()) })] }, sev));
                        }) }), _jsx("div", { className: "mt-4 space-y-1.5 max-h-60 overflow-y-auto", children: [...zones].sort((a, b) => b.risk.risk_score - a.risk.risk_score).map(({ cell, risk }) => (_jsxs("div", { onClick: () => setSelectedId(cell.id), className: `flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-all ${selectedId === cell.id ? 'bg-slate-800 border border-cyan-500/30' : 'bg-slate-900/40 hover:bg-slate-800/50 border border-transparent'}`, children: [_jsx("span", { className: "w-2.5 h-2.5 rounded-full shrink-0", style: { backgroundColor: ['#22c55e', '#eab308', '#f97316', '#ef4444'][['SAFE', 'MODERATE', 'HIGH', 'CRITICAL'].indexOf(risk.severity_level)] } }), _jsx("span", { className: "text-sm font-medium text-white", children: cell.label }), _jsx("span", { className: "text-xs text-slate-500 font-mono", children: cell.cell_code }), _jsx("span", { className: "text-sm text-slate-300 ml-auto font-semibold tabular-nums", children: risk.risk_score })] }, cell.id))) })] })] }));
}
