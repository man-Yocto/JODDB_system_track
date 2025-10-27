import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react';
import { mockTechnicians, mockSubmissions } from '../../data/supervisorMockData';
import { ReviewDrawer } from './ReviewDrawer';

interface TechnicianReviewLogProps {
  technicianId: string | null;
  onBack: () => void;
}

export const TechnicianReviewLog: React.FC<TechnicianReviewLogProps> = ({ technicianId, onBack }) => {
  const [showReviewDrawer, setShowReviewDrawer] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  
  const technician = mockTechnicians.find(t => t.id === technicianId);
  const submissions = mockSubmissions.filter(s => s.technicianId === technicianId);

  if (!technician) return null;

  const handleReviewClick = (submissionId: string) => {
    setSelectedSubmission(submissionId);
    setShowReviewDrawer(true);
  };

  const getTrendIcon = () => {
    if (technician.efficiency >= 80) return <TrendingUp className="w-5 h-5 text-green-600" />;
    return <TrendingDown className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {technician.name}
            {getTrendIcon()}
          </h1>
          <p className="text-sm text-gray-600">{technician.id}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Productivity</div>
          <div className="text-2xl font-bold">{technician.productivity}%</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Efficiency</div>
          <div className="text-2xl font-bold">{technician.efficiency}%</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Utilization</div>
          <div className="text-2xl font-bold">{technician.utilization}%</div>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-800">Activity Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Job</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Devices</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Duration</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Review</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">QA Status</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(sub => (
                <tr key={sub.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{sub.date}</td>
                  <td className="px-4 py-3 text-sm">{sub.jobId}</td>
                  <td className="px-4 py-3 text-center text-sm">{sub.devicesCompleted}</td>
                  <td className="px-4 py-3 text-center text-sm">{sub.timeSpent}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      sub.supervisorReview ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {sub.supervisorReview ? 'Reviewed' : 'Not Reviewed'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      sub.qaStatus === 'approved' ? 'bg-green-100 text-green-800' :
                      sub.qaStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                      sub.qaStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {sub.qaStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleReviewClick(sub.id)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 ml-auto"
                    >
                      <MessageSquare className="w-4 h-4" />
                      {sub.supervisorReview ? 'Edit Review' : 'Write Review'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Drawer */}
      {showReviewDrawer && (
        <ReviewDrawer
          isOpen={showReviewDrawer}
          onClose={() => setShowReviewDrawer(false)}
          submissionId={selectedSubmission}
          type="task"
        />
      )}
    </div>
  );
};
