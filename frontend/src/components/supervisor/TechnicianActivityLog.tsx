import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { mockTechnicians } from '../../data/supervisorMockData';

interface TechnicianActivityLogProps {
  technicianId: string | null;
  onBack: () => void;
}

export const TechnicianActivityLog: React.FC<TechnicianActivityLogProps> = ({ technicianId, onBack }) => {
  const technician = mockTechnicians.find(t => t.id === technicianId);

  if (!technician) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{technician.name}</h1>
          <p className="text-sm text-gray-600">{technician.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Productivity</div>
          <div className="text-2xl font-bold">{technician.productivity}%</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Efficiency</div>
          <div className="text-2xl font-bold">{technician.efficiency}%</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Utilization</div>
          <div className="text-2xl font-bold">{technician.utilization}%</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <h3 className="font-semibold text-gray-800 mb-4">Activity Log</h3>
        <p className="text-gray-600 italic">Detailed activity log coming soon...</p>
      </div>
    </div>
  );
};
