import React from 'react';
import { RefreshCw, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';

interface QuickActionsBarProps {
  hasActiveTask: boolean;
  activeTaskId?: number;
  onTaskUpdate: () => void;
}

/**
 * Quick Actions Bar - Sticky footer with one-tap actions
 * Optimized for one-handed thumb zone operation
 * Provides instant access to most common actions
 */
export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  hasActiveTask,
  activeTaskId,
  onTaskUpdate,
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleEndTask = async () => {
    if (!activeTaskId) return;

    const confirmEnd = window.confirm('End this task? This will mark it as completed.');
    if (!confirmEnd) return;

    setIsProcessing(true);
    try {
      await api.tasks.endTask(activeTaskId, 'Completed via quick action');
      onTaskUpdate();
    } catch (err) {
      console.error('Failed to end task:', err);
      alert('Failed to end task. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!hasActiveTask) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg p-4 z-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <button
              onClick={onTaskUpdate}
              className="flex-1 py-4 bg-blue-100 text-blue-700 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-200 transition-all shadow-md active:scale-95"
            >
              <RefreshCw className="w-6 h-6" />
              Refresh Tasks
            </button>
          </div>
          <p className="text-center text-xs text-gray-500 mt-2">
            No active task • Select a task to start working
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent border-t-2 border-blue-200 shadow-2xl p-4 z-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-3">
          <button
            onClick={handleEndTask}
            disabled={isProcessing}
            className="flex-1 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:from-green-600 hover:to-green-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6" />
                Complete Task
              </>
            )}
          </button>
        </div>
        <p className="text-center text-xs text-gray-600 mt-2 font-medium">
          ⚡ Quick action: Tap to complete current task
        </p>
      </div>
    </div>
  );
};
