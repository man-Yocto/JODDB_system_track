import React, { useState } from 'react';
import { Plus, Users, BarChart3, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header';
import { PlannerKPIs } from './PlannerKPIs';
import { JobOrdersPanel } from './JobOrdersPanel';
import { JobOrderDetails } from './JobOrderDetails';
import { UserManagement } from './UserManagement';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { CreateJobOrderModal } from './CreateJobOrderModal';
import { CreateUserModal } from './CreateUserModal';
import { TaskReviewQueue } from './TaskReviewQueue';
import { mockPlannerJobs, mockPlannerTasks } from '../../data/plannerMockData';

type View = 'dashboard' | 'job-details' | 'users' | 'analytics' | 'task-review';

export const PlannerDashboard: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState(mockPlannerTasks);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleJobClick = (jobId: string) => {
    setSelectedJobId(jobId);
    setCurrentView('job-details');
  };

  const handleApproveTask = (taskId: string, comments: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, status: 'approved' as const }
          : task
      )
    );
    console.log(`Task ${taskId} approved with comments:`, comments);
  };

  const handleRejectTask = (taskId: string, comments: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, status: 'rejected' as const }
          : task
      )
    );
    console.log(`Task ${taskId} rejected with comments:`, comments);
  };

  const renderView = () => {
    switch (currentView) {
      case 'job-details':
        return <JobOrderDetails jobId={selectedJobId} onBack={() => setCurrentView('dashboard')} />;
      case 'users':
        return <UserManagement onBack={() => setCurrentView('dashboard')} onCreateUser={() => setShowCreateUserModal(true)} />;
      case 'analytics':
        return <AnalyticsDashboard onBack={() => setCurrentView('dashboard')} />;
      case 'task-review':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Task Review & Approval</h2>
              <div className="text-sm text-gray-600">
                {tasks.filter(t => t.status === 'pending-approval').length} pending reviews
              </div>
            </div>
            <TaskReviewQueue
              tasks={tasks}
              onApprove={handleApproveTask}
              onReject={handleRejectTask}
            />
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <PlannerKPIs />
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowCreateJobModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-md"
              >
                <Plus className="w-5 h-5" />
                New Job Order
              </button>
              <button
                onClick={() => setShowCreateUserModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold shadow-md"
              >
                <Users className="w-5 h-5" />
                Create User
              </button>
            </div>

            <JobOrdersPanel jobs={mockPlannerJobs} onJobClick={handleJobClick} />
          </div>
        );
    }
  };

  const pendingTasksCount = tasks.filter(t => t.status === 'pending-approval').length;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <Header 
        title="Planning Control Panel" 
        subtitle="Job order planning and scheduling"
        user={user}
        onLogout={handleLogout}
      />

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <nav className="flex gap-6">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`pb-2 px-1 font-medium transition-colors ${
              currentView === 'dashboard'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView('task-review')}
            className={`pb-2 px-1 font-medium transition-colors flex items-center gap-2 ${
              currentView === 'task-review'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Task Review
            {pendingTasksCount > 0 && (
              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingTasksCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setCurrentView('users')}
            className={`pb-2 px-1 font-medium transition-colors flex items-center gap-2 ${
              currentView === 'users'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Personnel
          </button>
          <button
            onClick={() => setCurrentView('analytics')}
            className={`pb-2 px-1 font-medium transition-colors flex items-center gap-2 ${
              currentView === 'analytics'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderView()}
      </div>

      {/* Modals */}
      {showCreateJobModal && (
        <CreateJobOrderModal
          isOpen={showCreateJobModal}
          onClose={() => setShowCreateJobModal(false)}
        />
      )}
      {showCreateUserModal && (
        <CreateUserModal
          isOpen={showCreateUserModal}
          onClose={() => setShowCreateUserModal(false)}
        />
      )}
    </div>
  );
};
