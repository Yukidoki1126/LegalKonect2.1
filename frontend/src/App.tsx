import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Auth Pages
import Login from './pages/auth/Login';
import RegisterClient from './pages/auth/RegisterClient';
import RegisterLawFirm from './pages/auth/RegisterLawFirm';

// Dashboard Pages
import ClientDashboard from './pages/client/DashboardModern';
import ClientSettings from './pages/client/SettingsModern';
import ClientAppointments from './pages/client/AppointmentsModern';
import LawFirmDashboard from './pages/lawfirm/DashboardModern';
import LawFirmAppointments from './pages/lawfirm/Appointments';
import LawFirmCalendar from './pages/lawfirm/Calendar';
import LawFirmReviews from './pages/lawfirm/Reviews';
import LawFirmSettings from './pages/lawfirm/Settings';
import AdminDashboard from './pages/admin/DashboardModern';
import Verification from './pages/admin/VerificationModern';
import DtiVerification from './pages/admin/DtiVerification';
import Analytics from './pages/admin/AnalyticsModern';
import TestShadcn from './pages/TestShadcn';

import './App.css';

// Protected Route Component
function ProtectedRoute({
  children,
  allowedRoles
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role || '')) {
    // Redirect to appropriate dashboard based on role
    switch (user?.role) {
      case 'client':
        return <Navigate to="/client/dashboard" replace />;
      case 'law_firm':
        return <Navigate to="/law-firm/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
}

// Public Route - redirects authenticated users
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (isAuthenticated) {
    switch (user?.role) {
      case 'client':
        return <Navigate to="/client/dashboard" replace />;
      case 'law_firm':
        return <Navigate to="/law-firm/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Test Route - Remove after testing */}
      <Route path="/test-shadcn" element={<TestShadcn />} />

      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register/client"
        element={
          <PublicRoute>
            <RegisterClient />
          </PublicRoute>
        }
      />
      <Route
        path="/register/law-firm"
        element={
          <PublicRoute>
            <RegisterLawFirm />
          </PublicRoute>
        }
      />

      {/* Client Routes */}
      <Route
        path="/client/dashboard"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/settings"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/appointments"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientAppointments />
          </ProtectedRoute>
        }
      />

      {/* Law Firm Routes */}
      <Route
        path="/law-firm/dashboard"
        element={
          <ProtectedRoute allowedRoles={['law_firm']}>
            <LawFirmDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/law-firm/appointments"
        element={
          <ProtectedRoute allowedRoles={['law_firm']}>
            <LawFirmAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/law-firm/calendar"
        element={
          <ProtectedRoute allowedRoles={['law_firm']}>
            <LawFirmCalendar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/law-firm/reviews"
        element={
          <ProtectedRoute allowedRoles={['law_firm']}>
            <LawFirmReviews />
          </ProtectedRoute>
        }
      />
      <Route
        path="/law-firm/settings"
        element={
          <ProtectedRoute allowedRoles={['law_firm']}>
            <LawFirmSettings />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/verification"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Verification />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dti-verification"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DtiVerification />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Analytics />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
