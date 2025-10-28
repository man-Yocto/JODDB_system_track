import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { type QATask } from '../../types';

interface InspectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: QATask;
  onSubmit: (taskId: string, decision: 'accepted' | 'rejected', comments: string) => void;
}

export const InspectionDialog: React.FC<InspectionDialogProps> = ({
  isOpen,
  onClose,
  task,
  onSubmit
}) => {
  const [decision, setDecision] = useState<'accepted' | 'rejected' | null>(null);
  const [comments, setComments] = useState('');

  const handleSubmit = () => {
    if (!decision) return;
    if (decision === 'rejected' && !comments.trim()) {
      alert('Comments are mandatory for rejection');
      return;
    }
    
    onSubmit(task.id, decision, comments);
    onClose();
  };

  if (!isOpen) return null;

  const actualHours = (task.actualTime / 3600).toFixed(2);
  const standardHours = (task.standardTime / 3600).toFixed(2);
  const isOvertime = task.actualTime > task.standardTime;

  return (
    <>
      {/* Transparent backdrop */}
      <div className="fixed inset-0 bg-gray-900 bg-opacity-5 z-40" onClick={onClose} />
      
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto pointer-events-auto">
          {/* Header */}
          <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800">Quality Inspection</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Task Metadata */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Job Order</div>
                  <div className="font-mono font-semibold text-gray-800">{task.jobOrderCode}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Device Serial</div>
                  <div className="font-mono font-semibold text-gray-800">{task.deviceSerial}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Technician</div>
                  <div className="font-semibold text-gray-800">{task.technicianName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Operation</div>
                  <div className="font-semibold text-gray-800">{task.operationName}</div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Timeline</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Start: </span>
                  <span className="font-medium">{task.startTime}</span>
                </div>
                <div>
                  <span className="text-gray-600">End: </span>
                  <span className="font-medium">{task.endTime}</span>
                </div>
              </div>
            </div>

            {/* Technician Notes */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Technician Notes</h3>
              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-gray-700">{task.technicianNotes}</p>
              </div>
            </div>

            {/* Decision */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Inspection Decision *</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setDecision('accepted')}
                  className={`p-4 rounded-lg border-2 transition ${
                    decision === 'accepted'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  <CheckCircle className={`w-6 h-6 mx-auto mb-2 ${decision === 'accepted' ? 'text-green-600' : 'text-gray-400'}`} />
                  <div className="font-semibold text-center">Accept</div>
                </button>

                <button
                  onClick={() => setDecision('rejected')}
                  className={`p-4 rounded-lg border-2 transition ${
                    decision === 'rejected'
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-300 hover:border-red-400'
                  }`}
                >
                  <XCircle className={`w-6 h-6 mx-auto mb-2 ${decision === 'rejected' ? 'text-red-600' : 'text-gray-400'}`} />
                  <div className="font-semibold text-center">Reject</div>
                </button>
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="block font-semibold text-gray-800 mb-2">
                Comments {decision === 'rejected' && <span className="text-red-600">*</span>}
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={decision === 'rejected' ? 'Rejection reason is mandatory...' : 'Optional inspection notes...'}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-gray-50 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!decision || (decision === 'rejected' && !comments.trim())}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Inspection
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
