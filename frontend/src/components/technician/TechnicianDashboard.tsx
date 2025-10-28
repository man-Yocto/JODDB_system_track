import React, { useState, useEffect, useCallback } from 'react';
import { api, type Task } from '../../services/api';
import { TechnicianTaskCard } from './TechnicianTaskCard';
import { QuickActionsBar } from './QuickActionsBar';
import { TaskTimer } from './TaskTimer';
import { TaskQueuePreview } from './TaskQueuePreview';
import { TechnicianMetricsCard } from './TechnicianMetricsCard';
import { DailyReportModal } from './DailyReportModal';
import { RefreshCw, AlertCircle, ListChecks, CheckSquare, Square, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const TechnicianDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'available' | 'in_progress' | 'done'>('all');
  const [showMetrics, setShowMetrics] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(new Set());
  const [isSelectAllMode, setIsSelectAllMode] = useState(false);
  const [showDailyReport, setShowDailyReport] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const activeTask = tasks.find(t => t.status === 'in_progress');
  const upcomingTasks = tasks.filter(t => t.status === 'available');
  const completedTasks = tasks.filter(t => t.status === 'done' || t.status === 'completed');

  const fetchTasks = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const fetchedTasks = await api.tasks.getTasks();
      setTasks(fetchedTasks);
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchTasks(true); }, [fetchTasks]);
  useEffect(() => {
    const interval = setInterval(() => fetchTasks(false), 30000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  const handleTaskUpdate = useCallback(() => fetchTasks(false), [fetchTasks]);
  const handleRefresh = useCallback(() => fetchTasks(false), [fetchTasks]);
  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  const toggleTaskSelection = (taskId: number) => {
    setSelectedTaskIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) newSet.delete(taskId);
      else newSet.add(taskId);
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (isSelectAllMode && selectedTaskIds.size > 0) {
      setSelectedTaskIds(new Set());
      setIsSelectAllMode(false);
    } else {
      const availableTaskIds = new Set(filteredTasks.map(t => t.id as number));
      setSelectedTaskIds(availableTaskIds);
      setIsSelectAllMode(true);
    }
  };

  const handleStartSelected = async () => {
    if (selectedTaskIds.size === 0) return;
    try {
      for (const taskId of selectedTaskIds) {
        await api.tasks.startTask(taskId);
      }
      handleTaskUpdate();
      setSelectedTaskIds(new Set());
      setIsSelectAllMode(false);
    } catch (err: any) {
      console.error('Failed to start tasks:', err);
      alert('Failed to start some tasks');
    }
  };

  const handleSubmitDailyReport = async (reportData: {
    tasksCompleted: number;
    totalTimeMinutes: number;
    notes: string;
  }) => {
    setReportSubmitting(true);
    try {
      console.log('Daily report:', reportData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowDailyReport(false);
      alert('Daily report submitted!');
    } catch (err: any) {
      alert('Failed to submit report');
    } finally {
      setReportSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 text-center mb-2">Error</h2>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={() => fetchTasks(true)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-100 relative pb-20">
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">My Tasks</h1>
            <p className="text-sm text-gray-600">
              {selectedTaskIds.size > 0 ? `${selectedTaskIds.size} selected` : activeTask ? 'Working on task' : `${upcomingTasks.length} available`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowMetrics(!showMetrics)}
              className={`p-2 rounded-lg transition ${showMetrics ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              <ListChecks className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowDailyReport(true)}
              className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200"
            >
              <FileText className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 px-4 pb-4 overflow-x-auto">
          {[
            { value: 'all', label: 'All', count: tasks.length },
            { value: 'available', label: 'Available', count: upcomingTasks.length },
            { value: 'in_progress', label: 'In Progress', count: activeTask ? 1 : 0 },
            { value: 'done', label: 'Completed', count: completedTasks.length },
          ].map(({ value, label, count }) => (
            <button
              key={value}
              onClick={() => setFilter(value as any)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
                filter === value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {filteredTasks.length > 0 && (
          <div className="px-4 pb-4 flex items-center gap-3 border-t border-gray-200 pt-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium"
            >
              {isSelectAllMode ? <>  <CheckSquare className="w-4 h-4 text-blue-600" />Deselect</> : <><Square className="w-4 h-4" />Select</>}
            </button>
            {selectedTaskIds.size > 0 && (
              <>
                <span className="text-sm text-gray-600">{selectedTaskIds.size}</span>
                <button
                  onClick={handleStartSelected}
                  className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Start ({selectedTaskIds.size})
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {activeTask && (
        <div className="sticky top-[240px] z-10 px-4 pt-4">
          <TaskTimer task={activeTask} />
        </div>
      )}

      {showMetrics && user && (
        <div className="px-4 pt-4">
          <TechnicianMetricsCard technicianId={parseInt(user.id)} />
        </div>
      )}

      {!activeTask && upcomingTasks.length > 0 && selectedTaskIds.size === 0 && (
        <div className="px-4 pt-4">
          <TaskQueuePreview tasks={upcomingTasks.slice(0, 3)} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <ListChecks className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">No Tasks</h3>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map(task => (
              <div key={task.id} className={`rounded-lg transition ${selectedTaskIds.has(task.id as number) ? 'ring-2 ring-blue-500' : ''}`}>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md">
                  <input
                    type="checkbox"
                    checked={selectedTaskIds.has(task.id as number)}
                    onChange={() => toggleTaskSelection(task.id as number)}
                    className="w-5 h-5 mt-2 text-blue-600 rounded cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <TechnicianTaskCard task={task} onTaskUpdate={handleTaskUpdate} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDailyReport && (
        <DailyReportModal
          isOpen={showDailyReport}
          onClose={() => setShowDailyReport(false)}
          onSubmit={handleSubmitDailyReport}
          isSubmitting={reportSubmitting}
          completedTasksCount={completedTasks.length}
          allTasks={tasks}
        />
      )}

      <QuickActionsBar
        hasActiveTask={!!activeTask}
        activeTaskId={activeTask?.id}
        onTaskUpdate={handleTaskUpdate}
      />
    </div>
  );
};
