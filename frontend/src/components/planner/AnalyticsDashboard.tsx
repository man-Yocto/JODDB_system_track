import React, { useState } from 'react';
import { ArrowLeft, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { mockTechnicianMetrics, mockJobOrderMetrics, mockPlannerJobs } from '../../data/plannerMockData';

interface AnalyticsDashboardProps {
  onBack: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onBack }) => {
  const [viewType, setViewType] = useState<'technician' | 'job'>('technician');
  const [selectedTechnician, setSelectedTechnician] = useState(mockTechnicianMetrics[0]?.technicianId || '');
  const [selectedJob, setSelectedJob] = useState(mockPlannerJobs[0]?.id || '');
  const [dateRange, setDateRange] = useState('7');

  const techData = mockTechnicianMetrics.find(t => t.technicianId === selectedTechnician);
  const jobData = mockJobOrderMetrics.find(j => j.jobOrderId === selectedJob);
  const jobDetails = mockPlannerJobs.find(j => j.id === selectedJob);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Analytics & Performance</h1>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* View Type Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewType('technician')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            viewType === 'technician'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Technician Metrics
        </button>
        <button
          onClick={() => setViewType('job')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            viewType === 'job'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Job Order Metrics
        </button>
      </div>

      {viewType === 'technician' ? (
        <>
          {/* Technician Selection */}
          <div className="bg-white rounded-lg border p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Technician</label>
                <select
                  value={selectedTechnician}
                  onChange={(e) => setSelectedTechnician(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {mockTechnicianMetrics.map(tech => (
                    <option key={tech.technicianId} value={tech.technicianId}>
                      {tech.technicianName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                </select>
              </div>
            </div>
          </div>

          {techData && (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Productivity</span>
                    {techData.productivity >= 85 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className={`text-2xl font-bold ${techData.productivity >= 85 ? 'text-green-600' : 'text-red-600'}`}>
                    {techData.productivity}%
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                  <div className="text-sm text-gray-600 mb-2">Efficiency</div>
                  <div className={`text-2xl font-bold ${techData.efficiency >= 85 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {techData.efficiency}%
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                  <div className="text-sm text-gray-600 mb-2">Utilization</div>
                  <div className="text-2xl font-bold text-blue-600">{techData.utilization}%</div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                  <div className="text-sm text-gray-600 mb-2">Tasks Completed</div>
                  <div className="text-2xl font-bold text-gray-800">{techData.tasksCompleted}</div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                  <div className="text-sm text-gray-600 mb-2">Avg Time/Task</div>
                  <div className="text-2xl font-bold text-gray-800">{techData.averageTimePerTask}h</div>
                </div>
              </div>

              {/* Trend Chart */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Productivity Trend</h3>
                <div className="h-64 flex items-end justify-around gap-2">
                  {[85, 88, 90, 92, 95, 92, techData.productivity].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-blue-600 rounded-t transition-all" style={{ height: `${val * 2.5}px` }} />
                      <span className="text-xs text-gray-500 mt-2">{idx + 1}</span>
                    </div>
                  ))}
                </div>
                <div className="text-center text-sm text-gray-600 mt-4">Days</div>
              </div>

              {/* Task Breakdown */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Task-wise Breakdown</h3>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Task Type</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Standard Time</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actual Time</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Efficiency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['Diagnostics', 'Testing', 'Assembly', 'Quality Check'].map((task, idx) => {
                      const stdTime = [2.5, 1.5, 3.0, 1.0][idx];
                      const actTime = [2.2, 1.4, 2.8, 0.9][idx];
                      const eff = Math.round((stdTime / actTime) * 100);
                      return (
                        <tr key={task} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-800">{task}</td>
                          <td className="px-4 py-3 text-center text-sm text-gray-600">{stdTime}h</td>
                          <td className="px-4 py-3 text-center text-sm text-gray-600">{actTime}h</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              eff >= 100 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {eff}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          {/* Job Order Selection */}
          <div className="bg-white rounded-lg border p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Job Order</label>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {mockPlannerJobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.code} - {job.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {jobData && jobDetails && (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg border p-4">
                  <div className="text-sm text-gray-600 mb-2">Progress</div>
                  <div className="text-2xl font-bold text-blue-600">{jobData.progressPercent}%</div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                  <div className="text-sm text-gray-600 mb-2">Completed</div>
                  <div className="text-2xl font-bold text-green-600">{jobData.completedDevices}</div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                  <div className="text-sm text-gray-600 mb-2">Rejected</div>
                  <div className="text-2xl font-bold text-red-600">{jobData.rejectedDevices}</div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                  <div className="text-sm text-gray-600 mb-2">Efficiency</div>
                  <div className={`text-2xl font-bold ${jobData.efficiencyScore >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {jobData.efficiencyScore}%
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-4">
                  <div className="text-sm text-gray-600 mb-2">Days Left</div>
                  <div className={`text-2xl font-bold ${jobData.deadlineProximity <= 3 ? 'text-red-600' : 'text-gray-800'}`}>
                    {jobData.deadlineProximity}
                  </div>
                </div>
              </div>

              {/* Progress vs Timeline */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Cumulative Progress vs Ideal Timeline</h3>
                <div className="h-64 relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[100, 75, 50, 25, 0].map(val => (
                      <div key={val} className="flex items-center">
                        <span className="text-xs text-gray-500 w-8">{val}%</span>
                        <div className="flex-1 border-t border-gray-200" />
                      </div>
                    ))}
                  </div>

                  {/* Progress lines */}
                  <svg className="absolute inset-0 w-full h-full" style={{ paddingLeft: '32px' }}>
                    {/* Ideal line */}
                    <polyline
                      points="0,256 128,192 256,128 384,64 512,0"
                      fill="none"
                      stroke="#93c5fd"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                    {/* Actual line */}
                    <polyline
                      points="0,256 128,205 256,153 384,102 512,51"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="3"
                    />
                  </svg>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-blue-600" />
                    <span className="text-sm text-gray-600">Actual Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-blue-300 border-dashed border-t-2 border-blue-300" />
                    <span className="text-sm text-gray-600">Ideal Timeline</span>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Deadline Proximity</h3>
                <div className={`p-4 rounded-lg ${
                  jobData.onTimeStatus === 'on-track' ? 'bg-green-50 border border-green-200' :
                  jobData.onTimeStatus === 'at-risk' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-red-50 border border-red-200'
                }`}>
                  <div className={`text-lg font-semibold ${
                    jobData.onTimeStatus === 'on-track' ? 'text-green-800' :
                    jobData.onTimeStatus === 'at-risk' ? 'text-yellow-800' :
                    'text-red-800'
                  }`}>
                    {jobData.onTimeStatus === 'on-track' ? '✓ On Track' :
                     jobData.onTimeStatus === 'at-risk' ? '⚠ At Risk' :
                     '⚠ Overdue'}
                  </div>
                  <p className={`text-sm mt-1 ${
                    jobData.onTimeStatus === 'on-track' ? 'text-green-700' :
                    jobData.onTimeStatus === 'at-risk' ? 'text-yellow-700' :
                    'text-red-700'
                  }`}>
                    {jobData.onTimeStatus === 'on-track' 
                      ? `Job is progressing well with ${jobData.deadlineProximity} days remaining`
                      : jobData.onTimeStatus === 'at-risk'
                      ? `Job needs attention - only ${jobData.deadlineProximity} days left with ${100 - jobData.progressPercent}% remaining`
                      : `Job is overdue by ${Math.abs(jobData.deadlineProximity)} days`
                    }
                  </p>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
