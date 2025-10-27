import React from 'react';
import { Calendar, Users, Flag } from 'lucide-react';
import { type SupervisorJobOrder } from '../../types';

interface JobOrdersSummaryProps {
  jobs: SupervisorJobOrder[];
  onJobClick: (jobId: string) => void;
}

export const JobOrdersSummary: React.FC<JobOrdersSummaryProps> = ({ jobs, onJobClick }) => {
  const getStatusColor = (percentComplete: number, dueDate: string, reviewStatus: string) => {
    const daysUntilDue = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (reviewStatus === 'flagged') return 'bg-red-100 border-red-500';
    if (percentComplete >= 90) return 'bg-green-100 border-green-500';
    if (daysUntilDue <= 2 && percentComplete < 70) return 'bg-red-100 border-red-500';
    if (percentComplete < 50) return 'bg-yellow-100 border-yellow-500';
    return 'bg-blue-100 border-blue-500';
  };

  const getReviewStatusBadge = (status: string) => {
    const colors = {
      'not-reviewed': 'bg-gray-100 text-gray-700',
      'partially-reviewed': 'bg-yellow-100 text-yellow-700',
      'reviewed': 'bg-green-100 text-green-700',
      'flagged': 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || colors['not-reviewed'];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Job Orders Summary</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Job ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Progress</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Due Date</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Review Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr
                key={job.id}
                onClick={() => onJobClick(job.id)}
                className="border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {job.reviewStatus === 'flagged' && <Flag className="w-4 h-4 text-red-500" />}
                    <span className="font-semibold text-gray-800">{job.id}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="max-w-xs">
                    <p className="font-medium text-gray-800 truncate">{job.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <Users className="w-3 h-3" />
                      {job.assignedTechnicians.length} techs
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg font-bold text-gray-700">{job.percentComplete}%</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${job.percentComplete}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {job.dueDate}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${getReviewStatusBadge(job.reviewStatus)}`}>
                    {job.reviewStatus.replace('-', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
