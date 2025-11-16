import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import TimeLimitSettings from './pages/TimeLimitSettings';
import FamilyMonitoring from './pages/FamilyMonitoring';
import HealthReports from './pages/HealthReports';
import EmergencyOverride from './pages/EmergencyOverride';
import EyeCareAlerts from './pages/EyeCareAlerts';
import './App.css';

// Protected Route 컴포넌트
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

// Public Route 컴포넌트 (로그인한 사용자는 리디렉션)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/time-limits" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/time-limits"
        element={
          <ProtectedRoute>
            <TimeLimitSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/family-monitoring"
        element={
          <ProtectedRoute>
            <FamilyMonitoring />
          </ProtectedRoute>
        }
      />
      <Route
        path="/health-reports"
        element={
          <ProtectedRoute>
            <HealthReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/emergency"
        element={
          <ProtectedRoute>
            <EmergencyOverride />
          </ProtectedRoute>
        }
      />
      <Route
        path="/eye-care"
        element={
          <ProtectedRoute>
            <EyeCareAlerts />
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
