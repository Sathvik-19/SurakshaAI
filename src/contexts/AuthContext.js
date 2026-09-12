import React, { createContext, useContext, useEffect, useState } from 'react';
const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const AuthContext = createContext(null);
async function authRequest(path, body, token) {
  try { const res = await fetch(`${API_BASE}${path}`, { method:'POST', headers:{'Content-Type':'application/json', ...(token ? {Authorization:`Bearer ${token}`} : {})}, body:JSON.stringify(body || {}) }); const data=await res.json().catch(()=>({})); if(!res.ok) return {error:data.error || `Request failed (${res.status}).`}; return data; }
  catch { return {error:'Cannot connect to the Suraksha AI backend. Make sure Python Flask is running on port 5000.'}; }
}
export function AuthProvider({children}) {
  const [user,setUser]=useState(null); const [role,setRole]=useState('CITIZEN'); const [loading,setLoading]=useState(true);
  useEffect(()=>{ const token=localStorage.getItem('suraksha_token'); if(!token){setLoading(false);return;} fetch(`${API_BASE}/auth/me`,{headers:{Authorization:`Bearer ${token}`}}).then(r=>r.ok?r.json():null).then(data=>{if(data?.user){setUser(data.user);setRole(data.user.role||'CITIZEN')}else localStorage.removeItem('suraksha_token')}).catch(()=>localStorage.removeItem('suraksha_token')).finally(()=>setLoading(false)); },[]);
  const accept=data=>{if(data?.token&&data?.user){localStorage.setItem('suraksha_token',data.token);setUser(data.user);setRole(data.user.role||'CITIZEN')}};
  const signIn=async(email,password)=>{const data=await authRequest('/auth/login',{email,password});if(data.error)return{error:data.error};accept(data);return{error:null,user:data.user}};
  const signUp=async(email,password,name,userRole)=>{const data=await authRequest('/auth/register',{email,password,name,role:userRole});if(data.error)return{error:data.error};accept(data);return{error:null,user:data.user}};
  const requestPasswordReset=async email=>authRequest('/auth/forgot-password',{email});
  const resetPassword=async(email,reset_token,password)=>authRequest('/auth/reset-password',{email,reset_token,password});
  const signOut=async()=>{const token=localStorage.getItem('suraksha_token');await authRequest('/auth/logout',{},token);localStorage.removeItem('suraksha_token');setUser(null);setRole('CITIZEN')};
  return <AuthContext.Provider value={{user,role,loading,signIn,signUp,signOut,requestPasswordReset,resetPassword}}>{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);
