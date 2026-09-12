import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Layout } from '@/components/Layout';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { CitizenDashboard } from '@/pages/CitizenDashboard';
import { LiveRiskMap } from '@/pages/LiveRiskMap';
import { ForecastPage } from '@/pages/ForecastPage';
import { AlertsPage } from '@/pages/AlertsPage';
import { CopilotPage } from '@/pages/CopilotPage';
import { EmergencyDashboard } from '@/pages/EmergencyDashboard';
import { DisasterSimulation } from '@/pages/DisasterSimulation';
import { AnalyticsPage } from '@/pages/AnalyticsPage';

function ProtectedLayout() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-950" />;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout><Routes>
    <Route path="/dashboard" element={<CitizenDashboard />} />
    <Route path="/map" element={<LiveRiskMap />} />
    <Route path="/forecast" element={<ForecastPage />} />
    <Route path="/alerts" element={<AlertsPage />} />
    <Route path="/copilot" element={<CopilotPage />} />
    <Route path="/emergency" element={<EmergencyDashboard />} />
    <Route path="/simulation" element={<DisasterSimulation />} />
    <Route path="/analytics" element={<AnalyticsPage />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes></Layout>;
}
export default function App() { return <LanguageProvider><AuthProvider><BrowserRouter><Routes><Route path="/" element={<LandingPage />} /><Route path="/login" element={<LoginPage />} /><Route path="/*" element={<ProtectedLayout />} /></Routes></BrowserRouter></AuthProvider></LanguageProvider>; }
