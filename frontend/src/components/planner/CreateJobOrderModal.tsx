import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

interface CreateJobOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateJobOrderModal: React.FC<CreateJobOrderModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    order_code: '',
    title: '',
    description: '',
    operation_name: '',
    due_date: '',
    standard_time_seconds: '',
    device_serials: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.order_code.trim()) return 'Job Order Code is required';
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.due_date) return 'Due Date is required';
    if (!formData.standard_time_seconds) return 'Standard Time is required';
    if (parseInt(formData.standard_time_seconds) <= 0) return 'Standard Time must be greater than 0';
    if (!formData.device_serials.trim()) return 'At least one device serial is required';
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Parse device serials from textarea (one per line, trimmed)
      const deviceSerials = formData.device_serials
        .split('\n')
        .map(serial => serial.trim())
        .filter(serial => serial.length > 0);

      if (deviceSerials.length === 0) {
        setError('No valid device serials provided');
        setLoading(false);
        return;
      }

      // Prepare API request data (only include non-empty optional fields)
      const requestData: any = {
        order_code: formData.order_code.trim(),
        title: formData.title.trim(),
        due_date: formData.due_date,
        standard_time_seconds: parseInt(formData.standard_time_seconds),
        device_serials: deviceSerials,
      };

      // Only add optional fields if they have content
      const description = formData.description.trim();
      if (description) {
        requestData.description = description;
      }

      const operationName = formData.operation_name.trim();
      if (operationName) {
        requestData.operation_name = operationName;
      }

      console.log('Sending job order request with data:', requestData);

      // Call API to create job order
      const result = await api.jobOrders.createJobOrder(requestData);

      console.log('Job Order created successfully:', result);
      
      setSuccess(true);
      
      // Reset form after 1.5 seconds
      setTimeout(() => {
        setFormData({
          order_code: '',
          title: '',
          description: '',
          operation_name: '',
          due_date: '',
          standard_time_seconds: '',
          device_serials: '',
        });
        setSuccess(false);
        onSuccess?.();
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error('Failed to create job order:', err);
      
      // Extract error message from response
      let errorMessage = 'Failed to create job order';
      
      if (err.response?.data) {
        // Log all validation errors from backend
        console.error('Backend validation errors:', err.response.data);
        
        // Try to extract specific error messages
        if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data?.non_field_errors?.[0]) {
          errorMessage = err.response.data.non_field_errors[0];
        } else if (err.response.data?.order_code?.[0]) {
          errorMessage = err.response.data.order_code[0];
        } else if (err.response.data?.title?.[0]) {
          errorMessage = err.response.data.title[0];
        } else if (err.response.data?.due_date?.[0]) {
          errorMessage = err.response.data.due_date[0];
        } else if (err.response.data?.device_serials?.[0]) {
          errorMessage = err.response.data.device_serials[0];
        } else if (err.response.data?.operation_name?.[0]) {
          errorMessage = err.response.data.operation_name[0];
        } else {
          // If we have field errors but no specific match, create a list
          const fieldErrors = Object.entries(err.response.data)
            .filter(([_, value]: any) => Array.isArray(value))
            .map(([field, value]: any) => `${field}: ${value[0]}`)
            .join('; ');
          
          if (fieldErrors) {
            errorMessage = fieldErrors;
          }
        }
      } else {
        errorMessage = err.message || 'Failed to create job order';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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
            <button 
              onClick={onClose} 
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 m-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <div>
                  <p className="text-green-800 font-medium">Job Order Created Successfully!</p>
                  <p className="text-sm text-green-700">The job order and devices have been created.</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Order Code *
                  </label>
                  <input
                    id="order_code"
                    type="text"
                    value={formData.order_code}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                    placeholder="e.g., JO-2025-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                  placeholder="Job order title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={loading}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                  placeholder="Detailed description of the job order (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operation Name
                </label>
                <input
                  id="operation_name"
                  type="text"
                  value={formData.operation_name}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                  placeholder="e.g., Initial Assembly, Quality Check (optional)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to use default operation name
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Standard Time per Task (seconds) *
                </label>
                <input
                  id="standard_time_seconds"
                  type="number"
                  step="1"
                  min="1"
                  value={formData.standard_time_seconds}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                  placeholder="e.g., 3600 (1 hour)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be used as the standard time for each device in this job order
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Device Serial Numbers *
                </label>
                <textarea
                  id="device_serials"
                  value={formData.device_serials}
                  onChange={handleChange}
                  disabled={loading}
                  rows={6}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 font-mono text-sm"
                  placeholder="Enter serial numbers, one per line&#10;DEV-001&#10;DEV-002&#10;DEV-003"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.device_serials.split('\n').filter(s => s.trim()).length} valid devices
                </p>
              </div>
            </div>
          </form>

          <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end bg-gray-50">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Job Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
