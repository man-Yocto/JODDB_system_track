import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, Download } from 'lucide-react';
import { mockSupervisorJobs, mockDeviceLogs, mockSubmissions } from '../../data/supervisorMockData';
import { ReviewDrawer } from './ReviewDrawer';

interface JobOrderDetailsProps {
  jobId: string | null;
  onBack: () => void;
}

export const JobOrderDetails: React.FC<JobOrderDetailsProps> = ({ jobId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'devices' | 'submissions'>('devices');
  const [showReviewDrawer, setShowReviewDrawer] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ id: string; type: 'task' | 'device' } | null>(null);
  
  const job = mockSupervisorJobs.find(j => j.id === jobId);
  const deviceLogs = mockDeviceLogs.filter(d => d.jobId === jobId);
  const submissions = mockSubmissions.filter(s => s.jobId === jobId);

  if (!job) return null;

  const handleWriteReview = (itemId: string, type: 'task' | 'device') => {
    setSelectedItem({ id: itemId, type });
    setShowReviewDrawer(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">{job.title}</h1>
          <p className="text-sm text-gray-600">{job.id} • Due: {job.dueDate}</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            <Download className="w-4 h-4 inline mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Completion</div>
          <div className="text-2xl font-bold text-gray-800">{job.percentComplete}%</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Assigned</div>
          <div className="text-2xl font-bold text-gray-800">{job.assignedTechnicians.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Devices</div>
          <div className="text-2xl font-bold text-gray-800">{deviceLogs.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Status</div>
          <div className="text-lg font-semibold text-blue-600">{job.status}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('devices')}
              className={`py-4 font-medium transition ${
                activeTab === 'devices'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Device Tracker
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`py-4 font-medium transition ${
                activeTab === 'submissions'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Task Submissions
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'devices' ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Serial ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Technician</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Timestamp</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Supervisor Review</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">QA Status</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {deviceLogs.map((log, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm">{log.serialId}</td>
                    <td className="px-4 py-3 text-sm">{log.technicianName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.status === 'completed' ? 'bg-green-100 text-green-800' :
                        log.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{log.timestamp}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.supervisorReview ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {log.supervisorReview ? 'Reviewed' : 'Not Reviewed'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.qaStatus === 'approved' ? 'bg-green-100 text-green-800' :
                        log.qaStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                        log.qaStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {log.qaStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleWriteReview(log.serialId, 'device')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 ml-auto"
                      >
                        <MessageSquare className="w-4 h-4" />
                        {log.supervisorReview ? 'Edit Review' : 'Write Review'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Technician</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Devices</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Supervisor Review</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">QA Status</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(sub => (
                  <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{sub.date}</td>
                    <td className="px-4 py-3 text-sm">{sub.technicianName}</td>
                    <td className="px-4 py-3 text-sm">{sub.devicesCompleted}</td>
                    <td className="px-4 py-3 text-sm">{sub.timeSpent}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sub.supervisorReview ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {sub.supervisorReview ? 'Reviewed' : 'Not Reviewed'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                        onClick={() => handleWriteReview(sub.id, 'task')}
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
          )}
        </div>
      </div>

      {/* Review Drawer */}
      {showReviewDrawer && selectedItem && (
        <ReviewDrawer
          isOpen={showReviewDrawer}
          onClose={() => {
            setShowReviewDrawer(false);
            setSelectedItem(null);
          }}
          submissionId={selectedItem.id}
          type={selectedItem.type}
        />
      )}
    </div>
  );
};
