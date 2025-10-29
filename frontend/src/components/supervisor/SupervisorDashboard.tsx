import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header';
import { DashboardKPIs } from './DashboardKPIs';
import { JobOrdersSummary } from './JobOrdersSummary';
import { TechnicianPerformanceTable } from './TechnicianPerformanceTable';
import { ReviewQueue } from './ReviewQueue';
import { JobOrderDetails } from './JobOrderDetails';
import { TechnicianReviewLog } from './TechnicianReviewLog';
import { AlertsCenter } from './AlertsCenter';
import { ReportsView } from './ReportsView';

type View = 'dashboard' | 'job-details' | 'technician-log' | 'alerts' | 'reports';

export const SupervisorDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleJobClick = (jobId: string) => {
    setSelectedJobId(jobId);
    setCurrentView('job-details');
  };

  const handleTechnicianClick = (technicianId: string) => {
    setSelectedTechnicianId(technicianId);
    setCurrentView('technician-log');
  };

  const handleReviewItemClick = (item: any) => {
    if (item.jobId) {
      handleJobClick(item.jobId);
    }
  };

  const handleAlertClick = (alert: any) => {
    if (alert.relatedJobId) {
      handleJobClick(alert.relatedJobId);
    } else if (alert.relatedTechnicianId) {
      handleTechnicianClick(alert.relatedTechnicianId);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderView = () => {
    switch (currentView) {
      case 'job-details':
        return <JobOrderDetails jobId={selectedJobId} onBack={() => setCurrentView('dashboard')} />;
      case 'technician-log':
        return <TechnicianReviewLog technicianId={selectedTechnicianId} onBack={() => setCurrentView('dashboard')} />;
      case 'alerts':
        return <AlertsCenter onBack={() => setCurrentView('dashboard')} onAlertClick={handleAlertClick} />;
      case 'reports':
        return <ReportsView onBack={() => setCurrentView('dashboard')} />;
      default:
        return (
          <div className="space-y-6">
            {/* KPIs */}
            <DashboardKPIs />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Jobs and Technicians */}
              <div className="lg:col-span-2 space-y-6">
                <JobOrdersSummary onJobClick={handleJobClick} />
                <TechnicianPerformanceTable onTechnicianClick={handleTechnicianClick} />
              </div>

              {/* Right Column - Review Queue */}
              <div>
                <ReviewQueue onItemClick={handleReviewItemClick} />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        title="Supervisor Dashboard" 
        subtitle="Manage and oversee all operations"
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderView()}
      </div>
    </div>
  );
};
