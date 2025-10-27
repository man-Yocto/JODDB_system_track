import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Dialog } from './Dialog.tsx';
import { type CompletionReportData } from '../types';

interface CompletionReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string | null;
  onComplete: (jobId: string, reportData: CompletionReportData) => void;
}

export const CompletionReportDialog: React.FC<CompletionReportDialogProps> = ({ 
  isOpen, 
  onClose, 
  jobId, 
  onComplete 
}) => {
  const [reportData, setReportData] = useState<CompletionReportData>({
    amountCompleted: 0,
    timeFrom: '',
    timeTo: '',
    reportDetails: '',
    serialNumbers: '',
  });

  // State reset on open/close
  React.useEffect(() => {
    if (isOpen) {
      setReportData({
        amountCompleted: 0,
        timeFrom: '',
        timeTo: '',
        reportDetails: '',
        serialNumbers: '',
      });
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setReportData(prev => ({
      ...prev,
      [id]: value,
    }));
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setReportData(prev => ({
          ...prev,
          amountCompleted: parseInt(e.target.value, 10) || 0,
      }));
  }

  const handleConfirm = () => {
    // Basic validation check
    if (jobId && reportData.amountCompleted > 0 && reportData.timeFrom && reportData.timeTo) {
      onComplete(jobId, reportData);
      onClose();
    } else {
      // In a real app, show a proper feedback message instead of console error
      console.error("Please fill in all required fields (Amount, Time From/To, and Completed Amount > 0).");
    }
  };

  const isFormValid = reportData.amountCompleted > 0 && !!reportData.timeFrom && !!reportData.timeTo;

  return (
    <Dialog title={`Final Report for Job: ${jobId}`} isOpen={isOpen} onClose={onClose} className="!max-w-4xl">
      {/* Two-column layout based on Screenshot 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT COLUMN: Serial Numbers */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Enter serial numbers</h3>
          
          {/* Mock Serial Number Dropdown/Input (Styled like the screenshot) */}
          <div className="mb-4 relative">
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm pr-10"
              placeholder="type here..."
              // This is a mock input based on the screenshot, it doesn't store state
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
              <span className="text-xl">v</span> {/* Simple down arrow mock */}
            </div>
          </div>

          <label className="block text-base font-medium text-gray-700 mb-2" htmlFor="serialNumbers">
            Serial Numbers
          </label>
          <textarea
            id="serialNumbers"
            rows={10}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
            placeholder="Enter a list of serial numbers, one per line..."
            value={reportData.serialNumbers}
            onChange={handleChange}
          />
        </div>

        {/* RIGHT COLUMN: Amount, Time, Details */}
        <div className="space-y-6">
          {/* Enter Amount */}
          <div>
            <label className="block text-xl font-semibold text-gray-800 mb-2" htmlFor="amountCompleted">
              Enter the amount
            </label>
            <input
              id="amountCompleted"
              type="number"
              min="0"
              value={reportData.amountCompleted}
              onChange={handleAmountChange}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-lg"
              placeholder="0"
              required
            />
          </div>

          {/* Enter Time From/To */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Enter the time from to
            </label>
            <div className="flex gap-4">
              <input
                id="timeFrom"
                type="time"
                value={reportData.timeFrom}
                onChange={handleChange}
                className="flex-1 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              />
              <input
                id="timeTo"
                type="time"
                value={reportData.timeTo}
                onChange={handleChange}
                className="flex-1 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              />
            </div>
          </div>

          {/* Any Details */}
          <div>
            <label className="block text-xl font-semibold text-gray-800 mb-2" htmlFor="reportDetails">
              Any Details
            </label>
            <textarea
              id="reportDetails"
              rows={5}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
              placeholder="Type here....."
              value={reportData.reportDetails}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t mt-6">
        <button
          onClick={onClose}
          className="px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition duration-300"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!isFormValid}
          className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 disabled:opacity-50"
        >
          <CheckCircle className="inline w-5 h-5 mr-2" />
          Finalize Report and Complete Task
        </button>
      </div>
    </Dialog>
  );
};