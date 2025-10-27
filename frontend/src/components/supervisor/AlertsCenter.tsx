import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { mockAlerts } from '../../data/supervisorMockData';
import { type Alert } from '../../types';

interface AlertsCenterProps {
  onBack: () => void;
  onAlertClick: (alert: Alert) => void;
}

export const AlertsCenter: React.FC<AlertsCenterProps> = ({ onBack, onAlertClick }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Alerts & Notifications Center</h1>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <div className="space-y-4">
          {mockAlerts.map(alert => (
            <div
              key={alert.id}
              onClick={() => onAlertClick(alert)}
              className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition"
            >
              <div className="flex justify-between">
                <h3 className="font-semibold">{alert.title}</h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                  alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {alert.severity}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">{alert.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
