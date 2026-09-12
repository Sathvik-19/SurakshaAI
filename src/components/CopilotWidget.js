import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/i18n/translations';
import { SEVERITY_COLORS, classifyRainfall } from '@/lib/riskEngine';
import { askCopilot } from '@/services/api';
function generateResponse(question, cells, alerts) {
    const q = question.toLowerCase();
    const criticalZones = cells.filter((c) => c.risk.severity_level === 'CRITICAL');
    const highZones = cells.filter((c) => c.risk.severity_level === 'HIGH');
    const moderateZones = cells.filter((c) => c.risk.severity_level === 'MODERATE');
    const safeZones = cells.filter((c) => c.risk.severity_level === 'SAFE');
    if (q.includes('safe') || q.includes('my area') || q.includes('is it')) {
        if (criticalZones.length > 0) {
            const z = criticalZones[0];
            return `Based on current data, ${z.cell.label} is at CRITICAL risk (score: ${z.risk.risk_score}/100). ` +
                `Flood probability is ${Math.round(z.risk.flood_score * 100)}% and lightning probability is ${Math.round(z.risk.lightning_score * 100)}%. ` +
                `I recommend staying indoors, avoiding low-lying areas, and following evacuation orders if issued. ` +
                `There are ${alerts.length} active alerts for the region.`;
        }
        if (highZones.length > 0) {
            const z = highZones[0];
            return `${z.cell.label} is at HIGH risk (score: ${z.risk.risk_score}/100). Heavy rainfall and potential flooding expected. Stay alert and avoid water-logged roads.`;
        }
        if (moderateZones.length > 0) {
            return `Most zones are at MODERATE risk. ${moderateZones.length} zones have moderate risk levels. Rain is expected but conditions are not severe. Normal precautions advised.`;
        }
        return `Good news! All monitored zones are currently SAFE. No critical weather events detected at this time.`;
    }
    if (q.includes('rain') || q.includes('weather') || q.includes('flood')) {
        const topRain = [...cells].sort((a, b) => b.risk.rain_score - a.risk.rain_score)[0];
        if (topRain) {
            return `The highest rainfall risk is in ${topRain.cell.label} with a rain score of ${Math.round(topRain.risk.rain_score * 100)}%. ` +
                `Flood probability there is ${Math.round(topRain.risk.flood_score * 100)}%. ` +
                `${criticalZones.length} critical, ${highZones.length} high, and ${moderateZones.length} moderate risk zones currently active.`;
        }
    }
    if (q.includes('alert') || q.includes('warning')) {
        return `There are ${alerts.length} active alerts. ${alerts.filter((a) => a.severity === 'CRITICAL').length} critical, ` +
            `${alerts.filter((a) => a.severity === 'HIGH').length} high severity. ` +
            `Check the Alerts page for full details and recommended actions.`;
    }
    if (q.includes('route') || q.includes('travel') || q.includes('go')) {
        const dangerZones = [...criticalZones, ...highZones];
        if (dangerZones.length > 0) {
            return `I recommend avoiding ${dangerZones.map((z) => z.cell.label).join(', ')} right now due to high risk. ` +
                `Use the Safe Route feature to find a risk-aware path that avoids these danger zones.`;
        }
        return `Current conditions are relatively safe for travel. No critical or high-risk zones detected.`;
    }
    if (q.includes('school') || q.includes('hospital') || q.includes('infrastructure')) {
        return `You can view critical infrastructure on the Live Risk Map. Toggle the infrastructure layers to see hospitals, schools, police stations, shelters, and bridges in relation to risk zones.`;
    }
    if (q.includes('simulate') || q.includes('simulation')) {
        return `The Disaster Simulation page lets you run a scripted severe weather scenario over a 120-minute timeline. Watch how risk scores evolve and alerts are issued as the storm intensifies.`;
    }
    return `I can help with: risk levels in your area, weather conditions, active alerts, safe routes, and safety recommendations. ` +
        `Currently: ${criticalZones.length} critical, ${highZones.length} high, ${moderateZones.length} moderate, ${safeZones.length} safe zones. ` +
        `Try asking "Is my area safe?" or "What's the flood risk?"`;
}
export function CopilotWidget({ cells, alerts }) {
    const { lang } = useLanguage();
    const [messages, setMessages] = useState([
        { role: 'bot', text: t(lang, 'copyilotGreeting') },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);
    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, isTyping]);
    const handleSend = () => {
        if (!input.trim())
            return;
        const userMsg = { role: 'user', text: input };
        setMessages((m) => [...m, userMsg]);
        setInput('');
        setIsTyping(true);
        setTimeout(() => {
            askCopilot(input).then((data) => {
                setMessages((m) => [...m, { role: 'bot', text: data.answer }]);
            }).catch(() => {
                const response = generateResponse(input, cells, alerts);
                setMessages((m) => [...m, { role: 'bot', text: response }]);
            }).finally(() => setIsTyping(false));
        }, 600 + Math.random() * 400);
    };
    return (_jsxs("div", { className: "flex flex-col h-full", children: [_jsxs("div", { className: "flex items-center gap-2.5 px-4 py-3 border-b border-slate-800", children: [_jsxs("div", { className: "relative", children: [_jsx(Bot, { className: "text-cyan-400", size: 22 }), _jsx("div", { className: "absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-slate-900" })] }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-white text-sm", children: "SURAKSHA AI Copilot" }), _jsxs("div", { className: "text-xs text-emerald-400 flex items-center gap-1", children: [_jsx(Sparkles, { size: 10 }), " Online \u00B7 Risk-aware"] })] })] }), _jsxs("div", { ref: scrollRef, className: "flex-1 overflow-y-auto p-4 space-y-3", children: [messages.map((msg, i) => (_jsx("div", { className: `flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`, children: _jsx("div", { className: `max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-cyan-600 text-white rounded-br-md'
                                : 'bg-slate-800 text-slate-200 rounded-bl-md border border-slate-700'}`, children: msg.text }) }, i))), isTyping && (_jsx("div", { className: "flex justify-start", children: _jsx("div", { className: "bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3 border border-slate-700", children: _jsxs("div", { className: "flex gap-1.5", children: [_jsx("span", { className: "w-2 h-2 bg-slate-500 rounded-full animate-bounce", style: { animationDelay: '0ms' } }), _jsx("span", { className: "w-2 h-2 bg-slate-500 rounded-full animate-bounce", style: { animationDelay: '150ms' } }), _jsx("span", { className: "w-2 h-2 bg-slate-500 rounded-full animate-bounce", style: { animationDelay: '300ms' } })] }) }) }))] }), _jsx("div", { className: "p-3 border-t border-slate-800", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: input, onChange: (e) => setInput(e.target.value), onKeyDown: (e) => e.key === 'Enter' && handleSend(), placeholder: t(lang, 'askCopilot'), className: "flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition-colors" }), _jsx("button", { onClick: handleSend, disabled: !input.trim(), className: "bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2.5 transition-colors", children: _jsx(Send, { size: 18 }) })] }) })] }));
}
export { SEVERITY_COLORS, classifyRainfall };
