import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, FileText, AlertTriangle, ClipboardCheck } from 'lucide-react';
import { Header } from '../Header';
import { DashboardKPIs } from './DashboardKPIs';
import { JobOrdersSummary } from './JobOrdersSummary';
import { TechnicianPerformanceTable } from './TechnicianPerformanceTable';
import { ReviewQueue } from './ReviewQueue';
import { JobOrderDetails } from './JobOrderDetails';
import { TechnicianReviewLog } from './TechnicianReviewLog';
import { AlertsCenter } from './AlertsCenter';
import { ReportsView } from './ReportsView';
import { QAReviewQueue } from './QAReviewQueue';
import { mockSupervisorJobs, mockTechnicians, mockAlerts, mockReviewQueue, mockSupervisorQAReviews, mockDeviceLogs } from '../../data/supervisorMockData';

type View = 'dashboard' | 'job-details' | 'technician-log' | 'alerts' | 'reports' | 'qa-reviews';

export const SupervisorDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [qaReviews, setQaReviews] = useState(mockSupervisorQAReviews);
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

  const handleApproveQAReview = (reviewId: string, comments: string) => {
    setQaReviews(prevReviews =>
      prevReviews.map(review =>
        review.id === reviewId
          ? {
              ...review,
              supervisorDecision: 'accepted' as const,
              supervisorComments: comments,
              supervisorReviewedAt: new Date().toISOString(),
              status: 'supervisor-approved' as const
            }
          : review
      )
    );
    console.log(`QA Review ${reviewId} approved with comments:`, comments);
  };

  const handleRejectQAReview = (reviewId: string, comments: string) => {
    setQaReviews(prevReviews =>
      prevReviews.map(review =>
        review.id === reviewId
          ? {
              ...review,
              supervisorDecision: 'rejected' as const,
              supervisorComments: comments,
              supervisorReviewedAt: new Date().toISOString(),
              status: 'supervisor-rejected' as const
            }
          : review
      )
    );
    console.log(`QA Review ${reviewId} rejected with comments:`, comments);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Filter based on current view and search query
  const getFilteredData = () => {
    if (!searchQuery.trim()) return null;
    
    const query = searchQuery.toLowerCase();
    
    switch (currentView) {
      case 'job-details':
        return mockSupervisorJobs.filter(job =>
          job.id.toLowerCase().includes(query) ||
          job.title.toLowerCase().includes(query) ||
          (job as any).code?.toLowerCase().includes(query)
        );
      
      case 'technician-log':
        return mockDeviceLogs.filter(log =>
          log.serialId.toLowerCase().includes(query) ||
          log.technicianName.toLowerCase().includes(query) ||
          log.jobId.toLowerCase().includes(query)
        );
      
      case 'qa-reviews':
        return qaReviews.filter(review =>
          review.deviceSerial.toLowerCase().includes(query) ||
          review.technicianName.toLowerCase().includes(query) ||
          review.jobOrderCode.toLowerCase().includes(query) ||
          review.operationName.toLowerCase().includes(query)
        );
      
      default:
        return null;
    }
  };

  const filteredData = getFilteredData();

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
      case 'qa-reviews':
        return (
          <QAReviewQueue
            reviews={qaReviews}
            onApprove={handleApproveQAReview}
            onReject={handleRejectQAReview}
          />
        );
      default:
        return (
          <div className="space-y-6">
            {/* KPIs */}
            <DashboardKPIs />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Jobs and Technicians */}
              <div className="lg:col-span-2 space-y-6">
                <JobOrdersSummary jobs={mockSupervisorJobs} onJobClick={handleJobClick} />
                <TechnicianPerformanceTable technicians={mockTechnicians} onTechnicianClick={handleTechnicianClick} />
              </div>

              {/* Right Column - Review Queue */}
              <div>
                <ReviewQueue items={mockReviewQueue} onItemClick={handleReviewItemClick} />
              </div>
            </div>
          </div>
        );
    }
  };

  const unreviewedCount = mockReviewQueue.length;
  const flaggedCount = mockAlerts.filter(a => a.status === 'new' && a.severity === 'high').length;
  const pendingQAReviews = qaReviews.filter(r => r.status === 'pending-supervisor').length;

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
