import React from 'react';
import { ClipboardList, CheckCircle, XCircle, RefreshCw, TrendingUp } from 'lucide-react';
import { type QAMetrics } from '../../types';

interface QAKPIsProps {
  metrics: QAMetrics;
}

export const QAKPIs: React.FC<QAKPIsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Pending Inspections</p>
            <p className="text-3xl font-bold text-orange-600">{metrics.pendingInspections}</p>
          </div>
          <ClipboardList className="w-10 h-10 text-orange-500 opacity-80" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Accepted Today</p>
            <p className="text-3xl font-bold text-green-600">{metrics.acceptedToday}</p>
          </div>
          <CheckCircle className="w-10 h-10 text-green-500 opacity-80" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Rejected Today</p>
            <p className="text-3xl font-bold text-red-600">{metrics.rejectedToday}</p>
          </div>
          <XCircle className="w-10 h-10 text-red-500 opacity-80" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Rework Tasks</p>
            <p className="text-3xl font-bold text-yellow-600">{metrics.reworkTasks}</p>
          </div>
          <RefreshCw className="w-10 h-10 text-yellow-500 opacity-80" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Acceptance Rate</p>
            <p className="text-3xl font-bold text-blue-600">{metrics.acceptanceRate}%</p>
          </div>
          <TrendingUp className="w-10 h-10 text-blue-500 opacity-80" />
        </div>
      </div>
    </div>
  );
};
