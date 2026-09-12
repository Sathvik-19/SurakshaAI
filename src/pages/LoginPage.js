import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/i18n/translations';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User as UserIcon, Shield, LogIn, UserPlus, KeyRound, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { label: 'Demo Citizen', email: 'citizen@suraksha.ai', password: 'Suraksha@123', role: 'CITIZEN' },
  { label: 'Demo Authority', email: 'authority@suraksha.ai', password: 'Suraksha@123', role: 'AUTHORITY' },
  { label: 'Demo Admin', email: 'admin@suraksha.ai', password: 'Suraksha@123', role: 'ADMIN' },
];

export function LoginPage() {
  const { lang } = useLanguage();
  const { signIn, signUp, requestPasswordReset, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('CITIZEN');
  const [resetToken, setResetToken] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { setError(null); setMessage(null); }, [mode]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null); setMessage(null); setBusy(true);
    try {
      if (mode === 'login') {
        const result = await signIn(email.trim(), password);
        if (result.error) setError(result.error); else navigate('/dashboard', { replace: true });
      } else if (mode === 'register') {
        if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
        const result = await signUp(email.trim(), password, name.trim(), role);
        if (result.error) setError(result.error); else navigate('/dashboard', { replace: true });
      } else if (mode === 'forgot') {
        const result = await requestPasswordReset(email.trim());
        if (result.error) setError(result.error);
        else { setResetToken(result.reset_token || ''); setMessage(result.message || 'If the account exists, a reset code has been generated.'); }
      } else if (mode === 'reset') {
        if (!resetToken.trim()) { setError('Enter the reset code.'); return; }
        if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
        const result = await resetPassword(email.trim(), resetToken.trim(), password);
        if (result.error) setError(result.error);
        else { setMessage('Password reset successful. You can now log in.'); setMode('login'); setPassword(''); setConfirmPassword(''); setResetToken(''); }
      }
    } catch (err) { setError(err?.message || 'Something went wrong. Please try again.'); }
    finally { setBusy(false); }
  };

  const demoLogin = async (account) => {
    setEmail(account.email); setPassword(account.password); setError(null); setMessage(null); setBusy(true);
    try { const result = await signIn(account.email, account.password); if (result.error) setError(result.error); else navigate('/dashboard', { replace: true }); }
    catch (err) { setError(err?.message || 'Demo login failed.'); }
    finally { setBusy(false); }
  };

  const title = mode === 'login' ? 'Secure Login' : mode === 'register' ? 'Create Account' : mode === 'forgot' ? 'Reset Password' : 'Set New Password';
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none"><div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" /><div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" /></div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-7"><div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 mb-4"><Shield className="text-cyan-400" size={32} /></div><h1 className="text-2xl font-bold text-white">SURAKSHA AI</h1><p className="text-slate-500 text-sm mt-1">{title}</p></div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur p-6 shadow-2xl">
          {(mode === 'login' || mode === 'register') && <div className="flex gap-1 mb-6 p-1 bg-slate-800/50 rounded-lg"><button type="button" onClick={() => setMode('login')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium ${mode === 'login' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}><LogIn size={16} />{t(lang, 'login')}</button><button type="button" onClick={() => setMode('register')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium ${mode === 'register' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}><UserPlus size={16} />{t(lang, 'register')}</button></div>}
          {(mode === 'forgot' || mode === 'reset') && <button type="button" onClick={() => setMode('login')} className="mb-5 flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16} /> Back to login</button>}
          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && <div><label className="label">Name</label><div className="relative"><UserIcon className="icon" size={16} /><input type="text" value={name} onChange={e => setName(e.target.value)} required className="input pl-10" placeholder="Your name" /></div></div>}
            <div><label className="label">Email</label><div className="relative"><Mail className="icon" size={16} /><input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input pl-10" placeholder="you@example.com" /></div></div>
            {(mode === 'login' || mode === 'register' || mode === 'reset') && <div><label className="label">{mode === 'reset' ? 'New password' : 'Password'}</label><div className="relative"><Lock className="icon" size={16} /><input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="input pl-10 pr-10" placeholder="Minimum 6 characters" /><button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>}
            {(mode === 'register' || mode === 'reset') && <div><label className="label">Confirm password</label><div className="relative"><Lock className="icon" size={16} /><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} className="input pl-10" placeholder="Repeat password" /></div></div>}
            {mode === 'register' && <div><label className="label">Role</label><div className="grid grid-cols-3 gap-2">{['CITIZEN','AUTHORITY','ADMIN'].map(r => <button key={r} type="button" onClick={() => setRole(r)} className={`py-2 rounded-lg text-sm font-medium ${role === r ? 'bg-cyan-600 text-white border border-cyan-500' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'}`}>{r}</button>)}</div></div>}
            {mode === 'forgot' && <div className="rounded-lg bg-slate-800/60 border border-slate-700 p-3 text-xs text-slate-400">This local/offline build generates a short-lived reset code on the screen. For production, send it by email/SMS instead.</div>}
            {mode === 'forgot' ? <button type="submit" disabled={busy} className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg py-3 font-semibold">{busy ? 'Generating reset code...' : 'Generate reset code'}</button> : <button type="submit" disabled={busy} className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg py-3 font-semibold">{busy ? 'Please wait...' : mode === 'login' ? 'Login' : mode === 'register' ? 'Create account' : 'Reset password'}</button>}
            {mode === 'reset' && <div><label className="label">Reset code</label><div className="relative"><KeyRound className="icon" size={16} /><input value={resetToken} onChange={e => setResetToken(e.target.value)} required className="input pl-10" placeholder="Paste reset code" /></div></div>}
          </form>
          {message && <div className="mt-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-sm text-emerald-400">{message}{mode === 'forgot' && resetToken && <><div className="mt-2 font-mono text-base text-white break-all">{resetToken}</div><button type="button" onClick={() => setMode('reset')} className="mt-2 underline">Continue to reset password</button></>}</div>}
          {error && <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-400">{error}</div>}
          {mode === 'login' && <><button type="button" onClick={() => setMode('forgot')} className="w-full mt-4 text-sm text-cyan-400 hover:text-cyan-300">Forgot password?</button><div className="mt-6 pt-5 border-t border-slate-800"><p className="text-xs text-slate-500 text-center mb-3">Competition demo accounts</p><div className="grid gap-2">{DEMO_ACCOUNTS.map(a => <button key={a.email} type="button" disabled={busy} onClick={() => demoLogin(a)} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm"><span className="text-white">{a.label}</span><span className="text-cyan-400 text-xs">{a.role}</span></button>)}</div><p className="text-[11px] text-slate-600 text-center mt-2">Password: Suraksha@123</p></div></>}
        </div>
      </div>
      <style>{`.label{display:block;font-size:.75rem;color:#94a3b8;margin-bottom:.375rem;text-transform:uppercase;letter-spacing:.08em}.input{width:100%;background:#1e293b;border:1px solid #334155;border-radius:.5rem;padding:.625rem .75rem;color:#fff;outline:none}.input:focus{border-color:#06b6d4}.icon{position:absolute;left:.75rem;top:50%;transform:translateY(-50%);color:#64748b}`}</style>
    </div>
  );
}
