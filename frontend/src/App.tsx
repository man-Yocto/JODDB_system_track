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

/**
 * Main Application Component
 * Handles routing for all user roles with dedicated pages
 */

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100 font-sans antialiased">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LoginPage />} />
            
            {/* Role-Specific Routes */}
            <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/technician" element={
                <ProtectedRoute>
                  <TechnicianPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/quality" element={
                <ProtectedRoute>
                  <QualityPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/test-technician" element={
                <ProtectedRoute>
                  <TestTechnicianPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/planner" element={
                <ProtectedRoute>
                  <PlannerPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/supervisor" element={
                <ProtectedRoute>
                  <SupervisorPage />
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
};

export default App;