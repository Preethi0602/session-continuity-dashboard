import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import SessionDashboard from './components/dashboard/SessionDashboard';
import PatientsPage from './components/pages/PatientsPage';
import ReportsPage from './components/pages/ReportsPage';
import ProfilePage from './components/pages/ProfilePage';
import NotificationsPage from './components/pages/NotificationsPage';
import LoginPage from './components/pages/LoginPage';
import DashboardPage from './components/pages/DashboardPage';
import { authApi } from './api/patientApi';
import './styles/globals.css';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(() => {
    const token = localStorage.getItem('token');
    const saved = localStorage.getItem('user');
    return token && saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData: any) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    authApi.logout();
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar onLogout={handleLogout} user={user} />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/"              element={<Navigate to="/sessions" replace />} />
            <Route path="/sessions"      element={<SessionDashboard />} />
            <Route path="/dashboard"     element={<DashboardPage />} />
            <Route path="/patients"      element={<PatientsPage />} />
            <Route path="/reports"       element={<ReportsPage />} />
            <Route path="/profile"       element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;