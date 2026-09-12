import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/i18n/translations';
import { fetchAlerts } from '@/services/api';
import { AlertFeed } from '@/components/AlertFeed';
import { LoadingSpinner, ErrorState, EmptyState } from '@/components/ui';
import { Filter, Bell } from 'lucide-react';
export function AlertsPage() {
    const { lang, setLang } = useLanguage();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [severityFilter, setSeverityFilter] = useState('ALL');
    const [langFilter, setLangFilter] = useState('all');
    useEffect(() => {
        fetchAlerts()
            .then(setAlerts)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);
    if (loading)
        return _jsx(LoadingSpinner, { label: t(lang, 'loading') });
    if (error)
        return _jsx(ErrorState, { message: error });
    const filtered = alerts.filter((a) => {
        if (severityFilter !== 'ALL' && a.severity !== severityFilter)
            return false;
        if (langFilter !== 'all' && a.language !== langFilter)
            return false;
        return true;
    });
    return (_jsxs("div", { className: "p-4 lg:p-6 max-w-4xl mx-auto", children: [_jsxs("div", { className: "mb-6", children: [_jsxs("h1", { className: "text-2xl font-bold text-white flex items-center gap-2", children: [_jsx(Bell, { className: "text-cyan-400" }), t(lang, 'alerts')] }), _jsx("p", { className: "text-slate-500 text-sm mt-1", children: "Personalized alert feed \u2014 filterable by severity and language" })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-3 mb-6", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-slate-400", children: [_jsx(Filter, { size: 14 }), _jsx("span", { children: "Severity:" })] }), ['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'SAFE'].map((s) => (_jsx("button", { onClick: () => setSeverityFilter(s), className: `px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${severityFilter === s
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'}`, children: s === 'ALL' ? 'All' : t(lang, s.toLowerCase()) }, s))), _jsx("div", { className: "w-px h-5 bg-slate-700 mx-1" }), _jsx("div", { className: "flex items-center gap-2 text-sm text-slate-400", children: _jsx("span", { children: "Language:" }) }), ['all', 'en', 'kn', 'hi'].map((l) => (_jsx("button", { onClick: () => setLangFilter(l), className: `px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${langFilter === l
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'}`, children: l === 'all' ? 'All' : l === 'en' ? 'English' : l === 'kn' ? 'ಕನ್ನಡ' : 'हिंदी' }, l)))] }), filtered.length === 0 ? (_jsx(EmptyState, { message: t(lang, 'noAlerts') })) : (_jsx("div", { className: "rounded-2xl border border-slate-800 bg-slate-900/40 p-4", children: _jsx(AlertFeed, { alerts: filtered, maxHeight: "600px" }) }))] }));
}
