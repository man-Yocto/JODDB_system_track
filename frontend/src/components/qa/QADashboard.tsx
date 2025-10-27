import React, { useState } from 'react';
import { Search, Filter, ClipboardCheck, BarChart3 } from 'lucide-react';
import { QAKPIs } from './QAKPIs';
import { TaskInspectionPanel } from './TaskInspectionPanel';
import { InspectionHistory } from './InspectionHistory';
import { QAAnalytics } from './QAAnalytics';
import { mockQATasks, mockQAInspections, mockQAMetrics } from '../../data/qaMockData';

type View = 'dashboard' | 'inspections' | 'history' | 'analytics';

export const QADashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState(mockQATasks);
  const [inspections, setInspections] = useState(mockQAInspections);

  const handleInspect = (taskId: string, decision: 'accepted' | 'rejected', comments: string) => {
    // Update task status
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, status: decision === 'accepted' ? 'accepted_by_qa' as const : 'rework_required' as const }
          : task
      )
    );

    // Add inspection record
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const newInspection: any = {
        id: `INS${Date.now()}`,
        taskId,
        deviceSerial: task.deviceSerial,
        jobOrderCode: task.jobOrderCode,
        technicianName: task.technicianName,
        operationName: task.operationName,
        decision,
        comments,
        inspectorId: 'QI001',
        inspectorName: 'Fatima Quality',
        inspectedAt: new Date().toISOString()
      };
      setInspections(prev => [newInspection, ...prev]);
    }

    console.log(`Task ${taskId} ${decision} with comments:`, comments);
  };

  const renderView = () => {
    switch (currentView) {
      case 'inspections':
        return (
          <TaskInspectionPanel
            tasks={tasks.filter(t => t.status === 'pending_qa' || t.status === 'done')}
            onInspect={handleInspect}
          />
        );
      case 'history':
        return <InspectionHistory inspections={inspections} />;
      case 'analytics':
        return <QAAnalytics inspections={inspections} tasks={tasks} />;
      default:
        return (
          <div className="space-y-6">
            <QAKPIs metrics={mockQAMetrics} />
            
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentView('inspections')}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-md"
              >
                <ClipboardCheck className="w-5 h-5" />
                Start Inspection
              </button>
            </div>

            {/* Recent Inspections Preview */}
            <div className="bg-white rounded-lg border">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-800">Recent Inspections</h3>
              </div>
              <div className="p-4">
                {inspections.slice(0, 5).map(inspection => (
                  <div key={inspection.id} className="py-3 border-b last:border-0 flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-800">{inspection.deviceSerial} - {inspection.operationName}</div>
                      <div className="text-sm text-gray-600">{inspection.technicianName} • {inspection.inspectedAt}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      inspection.decision === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {inspection.decision}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  const pendingCount = tasks.filter(t => t.status === 'pending_qa' || t.status === 'done').length;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        {/* Navigation */}
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
            onClick={() => setCurrentView('inspections')}
            className={`pb-2 px-1 font-medium transition-colors flex items-center gap-2 ${
              currentView === 'inspections'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            Inspections
            {pendingCount > 0 && (
              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setCurrentView('history')}
            className={`pb-2 px-1 font-medium transition-colors ${
              currentView === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            History
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
    </div>
  );
};
