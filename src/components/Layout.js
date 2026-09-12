import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, Map, CloudSun, Bell, Bot, Radio, PlayCircle, BarChart3, LogIn, LogOut, Menu, X, Globe, } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/i18n/translations';
import { SEVERITY_TEXT } from '@/lib/riskEngine';
const citizenNav = [
    { to: '/dashboard', icon: LayoutDashboard, key: 'citizenDashboard' },
    { to: '/map', icon: Map, key: 'liveRiskMap' },
    { to: '/forecast', icon: CloudSun, key: 'forecast' },
    { to: '/alerts', icon: Bell, key: 'alerts' },
    { to: '/copilot', icon: Bot, key: 'aiCopilot' },
    { to: '/simulation', icon: PlayCircle, key: 'disasterSimulation' },
    { to: '/analytics', icon: BarChart3, key: 'analytics' },
];
const authorityNav = [
    ...citizenNav,
    { to: '/emergency', icon: Radio, key: 'emergencyDashboard' },
];
export function Layout({ children }) {
    const { user, role, signOut } = useAuth();
    const { lang, setLang } = useLanguage();
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const navItems = role === 'AUTHORITY' || role === 'ADMIN' ? authorityNav : citizenNav;
    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 text-slate-200", children: [_jsx("header", { className: "sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl", children: _jsxs("div", { className: "flex items-center justify-between px-4 lg:px-6 h-16", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { className: "lg:hidden p-1.5 text-slate-400 hover:text-white", onClick: () => setMobileOpen(!mobileOpen), children: mobileOpen ? _jsx(X, { size: 22 }) : _jsx(Menu, { size: 22 }) }), _jsxs(NavLink, { to: "/", className: "flex items-center gap-2.5", children: [_jsxs("div", { className: "relative", children: [_jsx(Shield, { className: "text-cyan-400", size: 28 }), _jsx("div", { className: "absolute inset-0 bg-cyan-400/30 blur-xl rounded-full" })] }), _jsxs("div", { children: [_jsxs("div", { className: "font-bold text-white tracking-tight text-lg leading-none", children: ["SURAKSHA", _jsx("span", { className: "text-cyan-400", children: " AI" })] }), _jsx("div", { className: "text-[10px] text-slate-500 uppercase tracking-widest", children: "Disaster Intelligence" })] })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-sm", children: [_jsx(Globe, { size: 16, className: "text-slate-500" }), _jsxs("select", { value: lang, onChange: (e) => setLang(e.target.value), className: "bg-transparent text-slate-400 text-sm border-none outline-none cursor-pointer", children: [_jsx("option", { value: "en", className: "bg-slate-900", children: "EN" }), _jsx("option", { value: "kn", className: "bg-slate-900", children: "\u0C95\u0CA8" }), _jsx("option", { value: "hi", className: "bg-slate-900", children: "\u0939\u093F" })] })] }), user ? (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: `text-xs font-semibold uppercase ${SEVERITY_TEXT[role === 'ADMIN' ? 'CRITICAL' : role === 'AUTHORITY' ? 'HIGH' : 'SAFE']}`, children: role }), _jsxs("button", { onClick: handleSignOut, className: "flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors", children: [_jsx(LogOut, { size: 16 }), _jsx("span", { className: "hidden sm:inline", children: t(lang, 'logout') })] })] })) : (_jsxs(NavLink, { to: "/login", className: "flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-400 transition-colors", children: [_jsx(LogIn, { size: 16 }), _jsx("span", { children: t(lang, 'login') })] }))] })] }) }), _jsxs("div", { className: "flex", children: [_jsx("aside", { className: `${mobileOpen ? 'block' : 'hidden'} lg:block fixed lg:sticky top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] border-r border-slate-800 bg-slate-950 overflow-y-auto`, children: _jsx("nav", { className: "p-3 space-y-1", children: navItems.map((item) => (_jsxs(NavLink, { to: item.to, onClick: () => setMobileOpen(false), className: ({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`, children: [_jsx(item.icon, { size: 18 }), t(lang, item.key)] }, item.to))) }) }), _jsxs("main", { className: "flex-1 min-w-0", children: [mobileOpen && (_jsx("div", { className: "fixed inset-0 top-16 bg-black/50 z-30 lg:hidden", onClick: () => setMobileOpen(false) })), children] })] })] }));
}
