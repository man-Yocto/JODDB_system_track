import React, { useState } from 'react';
import { Calendar, AlertCircle, CheckCircle, Package } from 'lucide-react';
import { type PlannerJobOrder } from '../../types';

interface JobOrdersPanelProps {
  jobs: PlannerJobOrder[];
  onJobClick: (jobId: string) => void;
}

export const JobOrdersPanel: React.FC<JobOrdersPanelProps> = ({ jobs, onJobClick }) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');

  const filteredJobs = filter === 'all' ? jobs : jobs.filter(job => job.status === filter);

  const getStatusColor = (status: string, efficiency: number) => {
    if (status === 'overdue') return 'border-red-500 bg-red-50';
    if (status === 'completed') return 'border-green-500 bg-green-50';
    if (efficiency < 75) return 'border-yellow-500 bg-yellow-50';
    return 'border-blue-500 bg-blue-50';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'active': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'overdue': 'bg-red-100 text-red-800',
      'at-risk': 'bg-yellow-100 text-yellow-800',
      'archived': 'bg-gray-100 text-gray-800',
    };
    return badges[status as keyof typeof badges] || badges.active;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Job Orders</h2>
          <div className="flex gap-2">
            {(['all', 'active', 'completed', 'overdue'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-sm rounded-full transition ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
        {filteredJobs.map(job => (
          <div
            key={job.id}
            onClick={() => onJobClick(job.id)}
            className={`p-4 rounded-lg border-l-4 cursor-pointer transition hover:shadow-md ${getStatusColor(job.status, job.efficiency)}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">{job.title}</h3>
                <p className="text-xs text-gray-600 font-mono">{job.code}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(job.status)}`}>
                {job.status}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="font-bold text-gray-800">{job.progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${job.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div className="flex items-center gap-1">
                <Package className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{job.devicesCompleted}/{job.totalDevices}</span>
              </div>
              <div className="flex items-center gap-1">
                {job.efficiency >= 80 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                )}
                <span className="text-gray-600">{job.efficiency}% eff</span>
              </div>
            </div>

            {/* Due Date */}
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Calendar className="w-3 h-3" />
              <span>Due: {job.dueDate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
