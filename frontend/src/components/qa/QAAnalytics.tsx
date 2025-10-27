import React from 'react';
import { type QAInspection, type QATask } from '../../types';

interface QAAnalyticsProps {
  inspections: QAInspection[];
  tasks: QATask[];
}

export const QAAnalytics: React.FC<QAAnalyticsProps> = ({ inspections, tasks }) => {
  const totalInspections = inspections.length;
  const rejections = inspections.filter(i => i.decision === 'rejected').length;
  const rejectionRate = totalInspections > 0 ? ((rejections / totalInspections) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Quality Analytics</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-sm text-gray-600">Total Inspections</div>
          <div className="text-3xl font-bold text-gray-800 mt-2">{totalInspections}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-sm text-gray-600">Total Rejections</div>
          <div className="text-3xl font-bold text-red-600 mt-2">{rejections}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-sm text-gray-600">Rejection Rate</div>
          <div className="text-3xl font-bold text-orange-600 mt-2">{rejectionRate}%</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <p className="text-gray-600 italic">Detailed analytics charts coming soon...</p>
      </div>
    </div>
  );
};
