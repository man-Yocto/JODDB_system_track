import React from 'react';
import { Briefcase, FileText, AlertTriangle, TrendingUp } from 'lucide-react';

export const DashboardKPIs: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Active Job Orders</p>
            <p className="text-3xl font-bold text-gray-800">12</p>
          </div>
          <Briefcase className="w-10 h-10 text-blue-500 opacity-80" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Pending Reviews</p>
            <p className="text-3xl font-bold text-yellow-600">8</p>
          </div>
          <FileText className="w-10 h-10 text-yellow-500 opacity-80" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Flagged for QA</p>
            <p className="text-3xl font-bold text-red-600">3</p>
          </div>
          <AlertTriangle className="w-10 h-10 text-red-500 opacity-80" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Avg Team Efficiency</p>
            <p className="text-3xl font-bold text-green-600">78%</p>
          </div>
          <TrendingUp className="w-10 h-10 text-green-500 opacity-80" />
        </div>
      </div>
    </div>
  );
};
