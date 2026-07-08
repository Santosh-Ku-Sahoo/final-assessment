import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';

import Login from './pages/Login';
import VisitorPortal from './pages/VisitorPortal';
import PassView from './pages/PassView';
import AdminDashboard from './pages/AdminDashboard';
import HostDashboard from './pages/HostDashboard';
import SecurityDashboard from './pages/SecurityDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
        Loading session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {

    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'host') return <Navigate to="/host" replace />;
    if (user.role === 'security') return <Navigate to="/security" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'host') return <Navigate to="/host" replace />;
  if (user.role === 'security') return <Navigate to="/security" replace />;

  return <Navigate to="/login" replace />;
};

const DashboardTabWrapper = ({ Component, defaultTab }) => {
  const location = useLocation();


  return <Component key={location.pathname} />;
};

const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation();


  useEffect(() => {

    if (location.pathname.startsWith('/admin') && user?.role === 'admin') {
      const activeTabElement = document.querySelector('[data-admin-active-tab]');

    }
  }, [location, user]);

  return (
    <Routes>
      {}
      <Route path="/login" element={<Login />} />
      <Route path="/register-visit" element={<VisitorPortal />} />
      <Route path="/pass/:passCode" element={<PassView />} />

      {}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/logs"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {}
      <Route
        path="/host"
        element={
          <ProtectedRoute allowedRoles={['host']}>
            <HostDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/host/invite"
        element={
          <ProtectedRoute allowedRoles={['host']}>
            <HostDashboard />
          </ProtectedRoute>
        }
      />

      {}
      <Route
        path="/security"
        element={
          <ProtectedRoute allowedRoles={['security', 'admin']}>
            <SecurityDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/security/logs"
        element={
          <ProtectedRoute allowedRoles={['security', 'admin']}>
            <SecurityDashboard />
          </ProtectedRoute>
        }
      />

      {}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
