import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CloudRain, Waves, Zap, Wind, Users, AlertTriangle, MapPin, Building2, School, Heart, Shield, CloudLightning, } from 'lucide-react';
const iconMap = {
    'cloud-rain': CloudRain,
    waves: Waves,
    zap: Zap,
    wind: Wind,
    users: Users,
    'alert-triangle': AlertTriangle,
    'map-pin': MapPin,
    building: Building2,
    school: School,
    hospital: Heart,
    shield: Shield,
    'cloud-lightning': CloudLightning,
};
export function ExplanationPanel({ factors }) {
    if (!factors || factors.length === 0)
        return null;
    return (_jsx("div", { className: "space-y-2", children: factors.map((factor, i) => {
            const Icon = iconMap[factor.icon] ?? AlertTriangle;
            return (_jsxs("div", { className: "flex items-start gap-3 rounded-lg bg-slate-800/50 border border-slate-700/50 px-3 py-2.5 hover:bg-slate-800/80 transition-colors", children: [_jsx("div", { className: "mt-0.5 text-slate-300 shrink-0", children: _jsx(Icon, { size: 18 }) }), _jsx("span", { className: "text-sm text-slate-300 leading-relaxed", children: factor.text })] }, i));
        }) }));
}
