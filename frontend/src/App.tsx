import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-100 font-sans antialiased">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LoginPage />} />
            
            {/* Role-Specific Routes */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/technician" element={<TechnicianPage />} />
            <Route path="/quality" element={<QualityPage />} />
            <Route path="/test-technician" element={<TestTechnicianPage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/supervisor" element={<SupervisorPage />} />
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;