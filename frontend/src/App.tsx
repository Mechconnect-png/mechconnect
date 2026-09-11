import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { LandingIndexPage } from './pages/LandingIndexPage';
import { CustomerHomePage } from './pages/CustomerHomePage';
import { MechanicHomePage } from './pages/MechanicHomePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CustomerHistoryPage } from './pages/CustomerHistoryPage';
import { VehicleManagementPage } from './pages/VehicleManagementPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-400">Loading MechConnect...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingIndexPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/customer"
        element={
          <ProtectedRoute roles={['CUSTOMER', 'ADMIN']}>
            <CustomerHomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute roles={['CUSTOMER', 'ADMIN']}>
            <CustomerHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles"
        element={
          <ProtectedRoute roles={['CUSTOMER', 'ADMIN']}>
            <VehicleManagementPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mechanic"
        element={
          <ProtectedRoute roles={['MECHANIC', 'ADMIN']}>
            <MechanicHomePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <AppContent />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
