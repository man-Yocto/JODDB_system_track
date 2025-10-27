import React, { useState } from 'react';
import { X, Save, Upload } from 'lucide-react';

interface CreateJobOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateJobOrderModal: React.FC<CreateJobOrderModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    dueDate: '',
    taskStandardTime: '',
    serialNumbers: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleSubmit = () => {
    console.log('Creating job order:', formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Minimal backdrop */}
      <div className="fixed inset-0 bg-gray-900 bg-opacity-5 z-40" onClick={onClose} />
      
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl pointer-events-auto">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800">Create New Job Order</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Order Code</label>
                  <input
                    id="code"
                    type="text"
                    value={formData.code}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., RADAR-DIAG-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Job order title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Detailed description of the job order"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Standard Time (hours)</label>
                <input
                  id="taskStandardTime"
                  type="number"
                  step="0.5"
                  value={formData.taskStandardTime}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Serial Numbers</label>
                <div className="flex gap-2 mb-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload CSV
                  </button>
                </div>
                <textarea
                  id="serialNumbers"
                  value={formData.serialNumbers}
                  onChange={handleChange}
                  rows={6}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Enter serial numbers, one per line&#10;SN-001&#10;SN-002&#10;SN-003"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.serialNumbers.split('\n').filter(s => s.trim()).length} devices
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Create Job Order
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
