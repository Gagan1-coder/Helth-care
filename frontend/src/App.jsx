import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { EmergencyProvider } from './context/EmergencyContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { LocationPage } from './pages/LocationPage';
import { HospitalsPage } from './pages/HospitalsPage';
import { ContactsPage } from './pages/ContactsPage';
import { MedicalProfilePage } from './pages/MedicalProfilePage';
import { HistoryPage } from './pages/HistoryPage';
import { AgentPage } from './pages/AgentPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { FederatedPage } from './pages/FederatedPage';
import { SettingsPage } from './pages/SettingsPage';
import { JudgeDemoPage } from './pages/JudgeDemoPage';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <EmergencyProvider>
          <BrowserRouter>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <main style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/location" element={<LocationPage />} />
                  <Route path="/hospitals" element={<HospitalsPage />} />
                  <Route path="/contacts" element={<ContactsPage />} />
                  <Route path="/profile" element={<MedicalProfilePage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/agent" element={<AgentPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/federated" element={<FederatedPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/judge-demo" element={<JudgeDemoPage />} />
                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </EmergencyProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
