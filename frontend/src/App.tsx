import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TechnicianPage } from './pages/TechnicianPage';
import { QualityPage } from './pages/QualityPage';
import { TestTechnicianPage } from './pages/TestTechnicianPage';
import { PlannerPage } from './pages/PlannerPage';
import { SupervisorPage } from './pages/SupervisorPage';
import "./App.css";
import { SettingsPage } from './pages/SettingsPage';
import { type UserRole } from './types';

/**
 * Main Application Component
 * Handles routing for all user roles with dedicated pages
 */

// Protected Route Component with Role Validation
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check if user's role is allowed for this route
  if (user && !allowedRoles.includes(user.role)) {
    console.warn(`User ${user.username} (role: ${user.role}) tried to access restricted page. Allowed roles: ${allowedRoles.join(', ')}`);
    // Redirect to their home page based on their role
    const roleRoutes: Record<UserRole, string> = {
      technician: '/technician',
      quality: '/quality',
      supervisor: '/supervisor',
      planner: '/planner',
      test_technician: '/test-technician',
    };
    const homeRoute = roleRoutes[user.role];
    return <Navigate to={homeRoute} replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 font-sans antialiased">
          <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LoginPage />} />
              
              {/* Role-Specific Routes with Permission Control */}
              <Route path="/dashboard" element={
                  <ProtectedRoute allowedRoles={['supervisor', 'planner']}>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/technician" element={
                  <ProtectedRoute allowedRoles={['technician']}>
                    <TechnicianPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/quality" element={
                  <ProtectedRoute allowedRoles={['quality']}>
                    <QualityPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/test-technician" element={
                  <ProtectedRoute allowedRoles={['test_technician', 'technician']}>
                    <TestTechnicianPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/planner" element={
                  <ProtectedRoute allowedRoles={['planner']}>
                    <PlannerPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/supervisor" element={
                  <ProtectedRoute allowedRoles={['supervisor']}>
                    <SupervisorPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/settings" element={
                  <ProtectedRoute allowedRoles={['technician', 'quality', 'supervisor', 'planner', 'test_technician']}>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};export default App;