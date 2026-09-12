import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useRef, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/i18n/translations';
import { fetchAllZonesWithRisk, fetchZoneDetail } from '@/services/api';
import { RiskMap } from '@/components/RiskMap';
import { RiskGauge, SeverityBadge } from '@/components/RiskDisplay';
import { LoadingSpinner, ErrorState, StatCard } from '@/components/ui';
import { simulateRiskOverTime } from '@/lib/weatherSimulator';
import { SEVERITY_COLORS } from '@/lib/riskEngine';
import { Play, Pause, RotateCcw, Clock, Zap, TrendingUp, AlertTriangle, Gauge, } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, } from 'recharts';
const SIM_DURATION = 120;
const TICK_MS = 200;
export function DisasterSimulation() {
    const { lang } = useLanguage();
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [detail, setDetail] = useState(null);
    const [playing, setPlaying] = useState(false);
    const [timeMin, setTimeMin] = useState(0);
    const [simStates, setSimStates] = useState(new Map());
    const [timelineData, setTimelineData] = useState([]);
    const intervalRef = useRef(null);
    useEffect(() => {
        fetchAllZonesWithRisk()
            .then(setZones)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);
    useEffect(() => {
        if (!selectedId && zones.length > 0) {
            const topRisk = [...zones].sort((a, b) => b.risk.risk_score - a.risk.risk_score)[0];
            setSelectedId(topRisk.cell.id);
        }
    }, [zones, selectedId]);
    useEffect(() => {
        if (!selectedId)
            return;
        fetchZoneDetail(selectedId).then(setDetail);
    }, [selectedId]);
    const runTick = useCallback(() => {
        setTimeMin((prev) => {
            const next = prev + 2;
            if (next > SIM_DURATION) {
                setPlaying(false);
                return SIM_DURATION;
            }
            // Update simulation states for all zones
            const newStates = new Map();
            for (const { cell, risk } of zones) {
                const sim = simulateRiskOverTime(cell, risk, next);
                newStates.set(cell.id, { severity: sim.severity, riskScore: sim.riskScore });
            }
            setSimStates(newStates);
            // Update timeline for selected zone
            const selZone = zones.find((z) => z.cell.id === selectedId);
            if (selZone) {
                const sim = simulateRiskOverTime(selZone.cell, selZone.risk, next);
                setTimelineData((data) => [
                    ...data,
                    { time: next, risk: sim.riskScore, rainfall: sim.floodProb * 100, flood: sim.floodProb * 100 },
                ]);
            }
            return next;
        });
    }, [zones, selectedId]);
    useEffect(() => {
        if (playing) {
            intervalRef.current = setInterval(runTick, TICK_MS);
        }
        else if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        return () => {
            if (intervalRef.current)
                clearInterval(intervalRef.current);
        };
    }, [playing, runTick]);
    const handlePlay = () => {
        if (timeMin >= SIM_DURATION) {
            setTimeMin(0);
            setTimelineData([]);
            setSimStates(new Map());
        }
        setPlaying(true);
    };
    const handleReset = () => {
        setPlaying(false);
        setTimeMin(0);
        setTimelineData([]);
        setSimStates(new Map());
    };
    if (loading)
        return _jsx(LoadingSpinner, { label: t(lang, 'loading') });
    if (error)
        return _jsx(ErrorState, { message: error });
    const current = zones.find((z) => z.cell.id === selectedId);
    const simState = simStates.get(selectedId ?? '');
    const displayScore = simState?.riskScore ?? current?.risk.risk_score ?? 0;
    const displaySeverity = simState?.severity ?? current?.risk.severity_level ?? 'SAFE';
    const criticalCount = Array.from(simStates.values()).filter((s) => s.severity === 'CRITICAL').length;
    const highCount = Array.from(simStates.values()).filter((s) => s.severity === 'HIGH').length;
    return (_jsxs("div", { className: "p-4 lg:p-6 max-w-7xl mx-auto", children: [_jsxs("div", { className: "mb-6", children: [_jsxs("h1", { className: "text-2xl font-bold text-white flex items-center gap-2", children: [_jsx(Zap, { className: "text-orange-400" }), t(lang, 'disasterSimulation')] }), _jsx("p", { className: "text-slate-500 text-sm mt-1", children: "Run a scripted severe weather scenario over a T+0 to T+120min timeline" })] }), _jsxs("div", { className: "flex items-center gap-3 mb-6 rounded-xl border border-slate-800 bg-slate-900/40 p-4", children: [_jsxs("button", { onClick: handlePlay, disabled: playing, className: "flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-lg font-semibold text-sm transition-colors", children: [_jsx(Play, { size: 18 }), t(lang, 'runSimulation')] }), _jsxs("button", { onClick: () => setPlaying(false), disabled: !playing, className: "flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg font-medium text-sm transition-colors", children: [_jsx(Pause, { size: 16 }), "Pause"] }), _jsxs("button", { onClick: handleReset, className: "flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium text-sm transition-colors", children: [_jsx(RotateCcw, { size: 16 }), "Reset"] }), _jsxs("div", { className: "flex-1 flex items-center gap-3 ml-4", children: [_jsx(Clock, { size: 16, className: "text-slate-500" }), _jsx("div", { className: "flex-1 h-2 bg-slate-800 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-gradient-to-r from-cyan-500 to-orange-500 rounded-full transition-all duration-200", style: { width: `${(timeMin / SIM_DURATION) * 100}%` } }) }), _jsxs("span", { className: "text-sm font-mono text-slate-300 tabular-nums min-w-[80px]", children: ["T+", timeMin, "m / ", SIM_DURATION, "m"] })] })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-6", children: [_jsx(StatCard, { label: "Critical Zones", value: criticalCount || zones.filter((z) => z.risk.severity_level === 'CRITICAL').length, icon: AlertTriangle, color: "red" }), _jsx(StatCard, { label: "High Zones", value: highCount || zones.filter((z) => z.risk.severity_level === 'HIGH').length, icon: TrendingUp, color: "orange" }), _jsx(StatCard, { label: "Sim Time", value: `${timeMin}m`, icon: Clock, color: "cyan" }), _jsx(StatCard, { label: "Status", value: playing ? 'Running' : timeMin > 0 ? 'Paused' : 'Ready', icon: Gauge, color: playing ? 'red' : 'emerald' })] }), _jsxs("div", { className: "grid lg:grid-cols-3 gap-6", children: [_jsx("div", { className: "lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden h-[400px]", children: _jsx(RiskMap, { cells: zones, onZoneClick: setSelectedId, selectedCellId: selectedId, simulationStates: simStates, className: "h-full w-full" }) }), _jsx("div", { className: "space-y-4", children: current && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/40 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-sm text-slate-500", children: "Monitoring" }), _jsx("div", { className: "text-lg font-bold text-white", children: current.cell.label })] }), _jsx(SeverityBadge, { severity: displaySeverity })] }), _jsx("div", { className: "flex justify-center", children: _jsx(RiskGauge, { score: displayScore, severity: displaySeverity }) })] }), timelineData.length > 0 && (_jsxs("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/40 p-4", children: [_jsx("h3", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2", children: "Risk Score Timeline" }), _jsx(ResponsiveContainer, { width: "100%", height: 180, children: _jsxs(AreaChart, { data: timelineData, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "riskGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "#f97316", stopOpacity: 0.5 }), _jsx("stop", { offset: "100%", stopColor: "#f97316", stopOpacity: 0 })] }) }), _jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1e293b" }), _jsx(XAxis, { dataKey: "time", stroke: "#64748b", fontSize: 10, unit: "m" }), _jsx(YAxis, { stroke: "#64748b", fontSize: 10, domain: [0, 100] }), _jsx(Tooltip, { contentStyle: { background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' } }), _jsx(ReferenceLine, { y: 75, stroke: "#ef4444", strokeDasharray: "5 3", label: { value: 'Critical', fill: '#ef4444', fontSize: 10 } }), _jsx(ReferenceLine, { y: 50, stroke: "#f97316", strokeDasharray: "5 3", label: { value: 'High', fill: '#f97316', fontSize: 10 } }), _jsx(Area, { type: "monotone", dataKey: "risk", stroke: "#f97316", fill: "url(#riskGrad)", strokeWidth: 2 })] }) })] }))] })) })] }), _jsx("div", { className: "mt-6 flex gap-2 overflow-x-auto pb-2", children: [...zones].sort((a, b) => b.risk.risk_score - a.risk.risk_score).map((z) => {
                    const ss = simStates.get(z.cell.id);
                    const sev = ss?.severity ?? z.risk.severity_level;
                    return (_jsxs("button", { onClick: () => {
                            setSelectedId(z.cell.id);
                            setTimelineData([]);
                        }, className: `shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 ${selectedId === z.cell.id
                            ? 'bg-slate-800 border-cyan-500/50 text-white'
                            : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white'}`, children: [_jsx("span", { className: "w-2 h-2 rounded-full", style: { backgroundColor: SEVERITY_COLORS[sev] } }), z.cell.label, _jsx("span", { className: "text-slate-500 tabular-nums", children: ss?.riskScore ?? z.risk.risk_score })] }, z.cell.id));
                }) })] }));
}
