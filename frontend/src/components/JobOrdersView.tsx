import React, { useState, useMemo } from 'react';
import { Briefcase, PlusCircle, CheckCircle } from 'lucide-react';
import { type JobOrder, type CompletionReportData } from '../types';
import { initialJobOrders } from '../data/mockData';
import { JobItem } from './JobItem.tsx';
import { WorkTimingDetailsDialog } from './WorkTimingDetailsDialog.tsx';
import { CompletionReportDialog } from './CompletionReportDialog.tsx';

interface JobOrdersViewProps {
  jobOrders: JobOrder[];
  onUpdateJob: (jobId: string, details: Partial<JobOrder>) => void;
}

export const JobOrdersView: React.FC<JobOrdersViewProps> = ({ jobOrders, onUpdateJob }) => {
  const [activeJobId, setActiveJobId] = useState<string | null>(initialJobOrders[0]?.id || null);
  const [showWorkTimingDialog, setShowWorkTimingDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const activeJob = useMemo(() => jobOrders.find(job => job.id === activeJobId), [jobOrders, activeJobId]);

  const handleSaveDetails = (id: string, details: string) => {
    onUpdateJob(id, { detailsOfWork: details, status: 'In Progress' });
  };

  const handleCompleteJob = (id: string, reportData: CompletionReportData) => {
    console.log(`Job ${id} Completed with Report Data:`, reportData);

    onUpdateJob(id, {
      status: 'Completed',
      detailsOfWork: (activeJob?.detailsOfWork || '') +
                     `\n\n--- COMPLETED REPORT ---\n` +
                     `Completed: ${reportData.amountCompleted} devices.\n` +
                     `Work Time: ${reportData.timeFrom} to ${reportData.timeTo}\n` +
                     `Serial Nos: ${reportData.serialNumbers.split('\n').filter(s => s).length} entries.\n` +
                     `Report Notes: ${reportData.reportDetails}`
    });
    const nextJob = jobOrders.find(job => job.status !== 'Completed' && job.id !== id);
    setActiveJobId(nextJob?.id || null);
  };

  const handleWorkTimingDetailsClick = () => {
    if (activeJob && activeJob.status !== 'Completed') {
      setShowWorkTimingDialog(true);
    }
  };

  const handleCompleteReportClick = () => {
    if (activeJob && activeJob.status !== 'Completed') {
      setShowReportDialog(true);
    }
  };

  if (!activeJob) {
    return (
      <div className="p-8 text-center text-gray-600">
        <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-semibold">No Active Job Orders</h2>
        <p>All assigned tasks are currently completed.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Job Orders List (Left Panel) */}
      <div className="md:w-1/3 bg-white border-r border-gray-200 shadow-md flex flex-col">
        <h2 className="text-lg font-bold p-4 border-b border-gray-200 bg-gray-50 text-center uppercase tracking-wider flex-shrink-0">JOB ORDERS</h2>
        
        <div className="flex-grow overflow-y-auto">
          {jobOrders.map(job => (
            <JobItem
              key={job.id}
              job={job}
              onSelect={setActiveJobId}
              isActive={job.id === activeJobId}
            />
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={handleWorkTimingDetailsClick}
            disabled={activeJob.status === 'Completed'}
            className="w-full px-4 py-3 bg-blue-100 text-blue-800 font-medium rounded-lg shadow-sm hover:bg-blue-200 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusCircle className="inline w-4 h-4 mr-1.5" />
            Work Timing Details
          </button>
        </div>
      </div>

      {/* Job Details and Actions (Right Panel) */}
      <div className="md:w-2/3 bg-gray-50 p-6 flex flex-col justify-between">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{activeJob.title}</h1>
          <p className="text-sm font-medium text-blue-600 mb-4">Job ID: {activeJob.id}</p>

          <div className="bg-white p-6 rounded-lg shadow-inner border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Task Description</h3>
            <p className="text-gray-600">{activeJob.description}</p>
          </div>

          <div className="mt-6 bg-white p-6 rounded-lg shadow-inner border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Current Work Details</h3>
            <div className="min-h-[100px] text-gray-600 whitespace-pre-wrap">
              {activeJob.detailsOfWork || <span className="text-gray-400 italic">No details added yet.</span>}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-lg">
          <button
            onClick={handleCompleteReportClick}
            disabled={activeJob.status === 'Completed'}
            className="w-full px-8 py-4 bg-gray-300 text-gray-800 font-bold rounded-lg shadow-md hover:bg-gray-400 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            <CheckCircle className="inline w-5 h-5 mr-2" />
            Complete Report
          </button>
        </div>
      </div>

      {/* Modals */}
      <WorkTimingDetailsDialog
        isOpen={showWorkTimingDialog}
        onClose={() => setShowWorkTimingDialog(false)}
        jobId={activeJobId}
        onSaveDetails={handleSaveDetails}
        currentDetails={activeJob?.detailsOfWork || ''}
      />
      <CompletionReportDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        jobId={activeJobId}
        onComplete={handleCompleteJob}
      />
    </div>
  );
};