import React, { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { type TechnicianPerformance } from '../../types';

interface TechnicianPerformanceTableProps {
  technicians: TechnicianPerformance[];
  onTechnicianClick: (technicianId: string) => void;
}

type SortField = 'name' | 'productivity' | 'efficiency' | 'utilization';

export const TechnicianPerformanceTable: React.FC<TechnicianPerformanceTableProps> = ({
  technicians,
  onTechnicianClick
}) => {
  const [sortField, setSortField] = useState<SortField>('productivity');
  const [sortDesc, setSortDesc] = useState(true);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDesc(!sortDesc);
    } else {
      setSortField(field);
      setSortDesc(true);
    }
  };

  const sortedTechnicians = [...technicians].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const comparison = typeof aVal === 'string' ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number);
    return sortDesc ? -comparison : comparison;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'bg-red-100 text-red-800';
      case 'at-risk': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Technician Performance</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <button onClick={() => handleSort('name')} className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900">
                  Technician
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <button onClick={() => handleSort('productivity')} className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900 mx-auto">
                  Productivity
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <button onClick={() => handleSort('efficiency')} className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900 mx-auto">
                  Efficiency
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <button onClick={() => handleSort('utilization')} className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900 mx-auto">
                  Utilization
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTechnicians.map(tech => (
              <tr
                key={tech.id}
                onClick={() => onTechnicianClick(tech.id)}
                className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                  tech.status === 'low' ? 'bg-red-50' : tech.status === 'at-risk' ? 'bg-yellow-50' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                      {tech.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{tech.name}</div>
                      <div className="text-xs text-gray-500">{tech.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tech.status)}`}>
                    {tech.productivity}%
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-gray-700 font-medium">{tech.efficiency}%</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-gray-700 font-medium">{tech.utilization}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
