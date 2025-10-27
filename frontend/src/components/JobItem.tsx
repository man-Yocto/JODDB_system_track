import React from 'react';
import { type JobOrder } from '../types';

interface JobItemProps {
  job: JobOrder;
  onSelect: (jobId: string) => void;
  isActive: boolean;
}

export const JobItem: React.FC<JobItemProps> = ({ job, onSelect, isActive }) => {
  let statusColor = '';
  switch (job.status) {
    case 'Completed':
      statusColor = 'bg-green-100 text-green-800';
      break;
    case 'In Progress':
      statusColor = 'bg-yellow-100 text-yellow-800';
      break;
    case 'Assigned':
    default:
      statusColor = 'bg-blue-100 text-blue-800';
      break;
  }

  return (
    <div
      className={`p-4 border-b border-gray-200 cursor-pointer transition duration-200 ${isActive ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50'}`}
      onClick={() => onSelect(job.id)}
    >
      <div className="flex justify-between items-start">
        <p className="font-semibold text-gray-800">{job.title}</p>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor}`}>
          {job.status}
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-1">ID: {job.id}</p>
    </div>
  );
};