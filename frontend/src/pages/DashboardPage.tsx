import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { type JobOrder } from '../types';
import { initialJobOrders } from '../data/mockData';
import { Header } from '../components/Header';
import { JobOrdersView } from '../components/JobOrdersView';
import { SupervisorDashboard } from '../components/supervisor/SupervisorDashboard';
import { PlannerDashboard } from '../components/planner/PlannerDashboard';
import { QADashboard } from '../components/qa/QADashboard';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [jobOrders, setJobOrders] = useState<JobOrder[]>(initialJobOrders);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  const handleUpdateJob = useCallback((jobId: string, details: Partial<JobOrder>) => {
    setJobOrders(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId
          ? { ...job, ...details }
          : job
      )
    );
  }, []);

  if (!user) {
    navigate('/');
    return null;
  }

  // Render different dashboard content based on user role
  const renderDashboardContent = () => {
    switch (user.role) {
      case 'user':
        return <JobOrdersView jobOrders={jobOrders} onUpdateJob={handleUpdateJob} />;
      
      case 'supervisor':
        return <SupervisorDashboard />;
      
      case 'planner':
        return <PlannerDashboard />;
      
      case 'quality':
        return <QADashboard />;
      
      default:
        return <div>Unknown role</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onLogout={handleLogout} />
      {user.role === 'user' ? (
        <main className="h-[calc(100vh-65px)]">
          {renderDashboardContent()}
        </main>
      ) : (
        renderDashboardContent()
      )}
    </div>
  );
};