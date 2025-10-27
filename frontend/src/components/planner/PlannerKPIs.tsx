import React from 'react';
import { Briefcase, TrendingUp, Users, AlertTriangle, ClipboardCheck } from 'lucide-react';

export const PlannerKPIs: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Active Job Orders</p>
            <p className="text-3xl font-bold text-gray-800">8</p>
            <p className="text-xs text-gray-500 mt-1">3 due this week</p>
          </div>
          <Briefcase className="w-10 h-10 text-blue-500 opacity-80" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Avg Productivity</p>
            <p className="text-3xl font-bold text-green-600">86%</p>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +5% from last week
            </p>
          </div>
          <TrendingUp className="w-10 h-10 text-green-500 opacity-80" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Active Technicians</p>
            <p className="text-3xl font-bold text-gray-800">24</p>
            <p className="text-xs text-gray-500 mt-1">78% utilization</p>
          </div>
          <Users className="w-10 h-10 text-purple-500 opacity-80" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Overdue Tasks</p>
            <p className="text-3xl font-bold text-red-600">5</p>
            <p className="text-xs text-red-600 mt-1">Requires attention</p>
          </div>
          <AlertTriangle className="w-10 h-10 text-red-500 opacity-80" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Pending Reviews</p>
            <p className="text-3xl font-bold text-orange-600">8</p>
            <p className="text-xs text-gray-500 mt-1">Tasks to review</p>
          </div>
          <ClipboardCheck className="w-10 h-10 text-orange-500 opacity-80" />
        </div>
      </div>
    </div>
  );
};
