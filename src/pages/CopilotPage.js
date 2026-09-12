import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/i18n/translations';
import { fetchAllZonesWithRisk, fetchAlerts, fetchInfrastructure } from '@/services/api';
import { CopilotWidget } from '@/components/CopilotWidget';
import { LoadingSpinner, ErrorState } from '@/components/ui';
import { Bot } from 'lucide-react';
export function CopilotPage() {
    const { lang } = useLanguage();
    const [zones, setZones] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        Promise.all([fetchAllZonesWithRisk(), fetchAlerts(), fetchInfrastructure()])
            .then(([z, a]) => {
            setZones(z);
            setAlerts(a);
        })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);
    if (loading)
        return _jsx(LoadingSpinner, { label: t(lang, 'loading') });
    if (error)
        return _jsx(ErrorState, { message: error });
    return (_jsxs("div", { className: "p-4 lg:p-6 max-w-3xl mx-auto h-[calc(100vh-4rem)] flex flex-col", children: [_jsxs("div", { className: "mb-4", children: [_jsxs("h1", { className: "text-2xl font-bold text-white flex items-center gap-2", children: [_jsx(Bot, { className: "text-cyan-400" }), t(lang, 'aiCopilot')] }), _jsx("p", { className: "text-slate-500 text-sm mt-1", children: "Ask about risk in your area, weather conditions, or safety recommendations" })] }), _jsx("div", { className: "flex-1 rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden flex flex-col min-h-0", children: _jsx(CopilotWidget, { cells: zones, alerts: alerts }) })] }));
}
