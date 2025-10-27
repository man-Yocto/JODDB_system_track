import React, { useState, useMemo } from 'react';
import { Clock, TrendingUp, AlertTriangle, Search } from 'lucide-react';
import { type QATask } from '../../types';
import { InspectionDialog } from './InspectionDialog';

interface TaskInspectionPanelProps {
  tasks: QATask[];
  onInspect: (taskId: string, decision: 'accepted' | 'rejected', comments: string) => void;
}

export const TaskInspectionPanel: React.FC<TaskInspectionPanelProps> = ({ tasks, onInspect }) => {
  const [selectedTask, setSelectedTask] = useState<QATask | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'done'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = useMemo(() => {
    let result = filterStatus === 'all' 
      ? tasks 
      : tasks.filter(t => filterStatus === 'pending' ? t.status === 'pending_qa' : t.status === 'done');

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task =>
        task.operationName.toLowerCase().includes(query) ||
        task.technicianName.toLowerCase().includes(query) ||
        task.jobOrderCode.toLowerCase().includes(query) ||
        task.deviceSerial.toLowerCase().includes(query)
      );
    }

    return result;
  }, [tasks, filterStatus, searchQuery]);

  const handleInspectClick = (task: QATask) => {
    setSelectedTask(task);
    setShowDialog(true);
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 100) return 'text-green-600';
    if (efficiency >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search tasks, technicians, job orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'done'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Task Info</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Technician</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Time</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Efficiency</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No tasks available for inspection
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => {
                  const isOvertime = task.actualTime > task.standardTime;
                  const isLowEfficiency = task.efficiency < 80;

                  return (
                    <tr key={task.id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-800">{task.operationName}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {task.jobOrderCode} • {task.deviceSerial}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{task.technicianName}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1">
                            <Clock className={`w-4 h-4 ${isOvertime ? 'text-red-500' : 'text-gray-400'}`} />
                            <span className={`text-sm ${isOvertime ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                              {Math.round(task.actualTime / 60)}m
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            std: {Math.round(task.standardTime / 60)}m
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <TrendingUp className={`w-4 h-4 ${getEfficiencyColor(task.efficiency)}`} />
                          <span className={`font-semibold ${getEfficiencyColor(task.efficiency)}`}>
                            {task.efficiency}%
                          </span>
                        </div>
                        {isLowEfficiency && (
                          <AlertTriangle className="w-4 h-4 text-yellow-500 mx-auto mt-1" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          task.status === 'pending_qa' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleInspectClick(task)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspection Dialog */}
      {showDialog && selectedTask && (
        <InspectionDialog
          isOpen={showDialog}
          onClose={() => {
            setShowDialog(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          onSubmit={onInspect}
        />
      )}
    </div>
  );
};
