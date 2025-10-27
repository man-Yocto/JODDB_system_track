import React, { useState, useMemo } from 'react';
import { CheckCircle, XCircle, Eye, AlertCircle, Search } from 'lucide-react';
import { type SupervisorQAReview } from '../../types';
import { QAReviewDialog } from './QAReviewDialog';

interface QAReviewQueueProps {
  reviews: SupervisorQAReview[];
  onApprove: (reviewId: string, comments: string) => void;
  onReject: (reviewId: string, comments: string) => void;
}

export const QAReviewQueue: React.FC<QAReviewQueueProps> = ({ reviews, onApprove, onReject }) => {
  const [selectedReview, setSelectedReview] = useState<SupervisorQAReview | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReviews = useMemo(() => {
    let result = filter === 'all'
      ? reviews
      : filter === 'pending'
      ? reviews.filter(r => r.status === 'pending-supervisor')
      : reviews.filter(r => r.status === `supervisor-${filter}` as any);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(review =>
        review.operationName.toLowerCase().includes(query) ||
        review.technicianName.toLowerCase().includes(query) ||
        review.jobOrderCode.toLowerCase().includes(query) ||
        review.deviceSerial.toLowerCase().includes(query) ||
        review.qaInspector.toLowerCase().includes(query)
      );
    }

    return result;
  }, [reviews, filter, searchQuery]);

  const handleReviewClick = (review: SupervisorQAReview) => {
    setSelectedReview(review);
    setShowDialog(true);
  };

  const getQADecisionBadge = (decision: string) => {
    return decision === 'accepted'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'pending-supervisor': 'bg-orange-100 text-orange-800',
      'supervisor-approved': 'bg-green-100 text-green-800',
      'supervisor-rejected': 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search reviews, technicians, inspectors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'pending' && (
                <span className="ml-2 px-2 py-0.5 bg-white text-blue-600 rounded-full text-xs">
                  {reviews.filter(r => r.status === 'pending-supervisor').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* QA Reviews Table */}
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">QA Inspection Reviews</h3>
          <p className="text-sm text-gray-600 mt-1">Review and approve/reject QA inspection decisions</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Task Info</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Technician</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">QA Decision</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">QA Inspector</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No QA reviews found
                  </td>
                </tr>
              ) : (
                filteredReviews.map(review => (
                  <tr key={review.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-800">{review.operationName}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {review.jobOrderCode} • {review.deviceSerial}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{review.technicianName}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getQADecisionBadge(review.qaDecision)}`}>
                          {review.qaDecision}
                        </span>
                        {review.qaDecision === 'rejected' && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-700">{review.qaInspector}</div>
                      <div className="text-xs text-gray-500">{review.qaInspectedAt}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(review.status)}`}>
                        {review.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleReviewClick(review)}
                        className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium text-sm flex items-center gap-2 ml-auto"
                      >
                        <Eye className="w-4 h-4" />
                        {review.status === 'pending-supervisor' ? 'Review' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Dialog */}
      {showDialog && selectedReview && (
        <QAReviewDialog
          isOpen={showDialog}
          onClose={() => {
            setShowDialog(false);
            setSelectedReview(null);
          }}
          review={selectedReview}
          onApprove={onApprove}
          onReject={onReject}
        />
      )}
    </div>
  );
};
