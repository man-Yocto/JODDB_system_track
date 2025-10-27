import React, { useState, useMemo } from 'react';
import { ArrowLeft, FileText, Search, Filter, Download, Eye, Calendar, User, Package } from 'lucide-react';
import { mockTechnicianReports } from '../../data/supervisorMockData';
import { type TechnicianReport } from '../../types';
import { ReportDetailDialog } from './ReportDetailDialog';
import { generateSupervisorReport, generateDetailedReport } from '../../utils/pdfGenerator';

interface ReportsViewProps {
  onBack: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onBack }) => {
  const [selectedReport, setSelectedReport] = useState<TechnicianReport | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'technician' | 'quality'>('all');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');

  const filteredReports = useMemo(() => {
    let result = mockTechnicianReports;

    // Role filter
    if (roleFilter !== 'all') {
      result = result.filter(r => r.roleType === roleFilter);
    }

    // Date filter
    const now = new Date();
    if (dateFilter !== 'all') {
      result = result.filter(r => {
        const reportDate = new Date(r.createdAt);
        const diffDays = Math.floor((now.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dateFilter === 'today') return diffDays === 0;
        if (dateFilter === 'week') return diffDays <= 7;
        if (dateFilter === 'month') return diffDays <= 30;
        return true;
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.jobOrderCode.toLowerCase().includes(query) ||
        r.technicianName.toLowerCase().includes(query) ||
        r.deviceSerial.toLowerCase().includes(query) ||
        r.operationName.toLowerCase().includes(query) ||
        r.content.toLowerCase().includes(query)
      );
    }

    return result;
  }, [roleFilter, dateFilter, searchQuery]);

  const handleViewReport = (report: TechnicianReport) => {
    setSelectedReport(report);
    setShowDetailDialog(true);
  };

  const handleExportPDF = () => {
    const filters = {
      roleType: roleFilter,
      startDate: dateFilter !== 'all' ? new Date(Date.now() - (dateFilter === 'today' ? 0 : dateFilter === 'week' ? 7 : 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      endDate: new Date().toISOString().split('T')[0]
    };
    generateSupervisorReport(filteredReports, filters);
  };

  const handleExportSingleReport = (report: TechnicianReport) => {
    generateDetailedReport(report);
  };

  const getRoleColor = (role: string) => {
    return role === 'technician' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Reports & Documentation</h2>
            <p className="text-sm text-gray-600 mt-1">View and analyze operation reports from technicians and QA</p>
          </div>
        </div>
        <button 
          onClick={handleExportPDF}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
        >
          <Download className="w-4 h-4" />
          Export PDF Report
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Reports</span>
            <FileText className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{mockTechnicianReports.length}</div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Technician Reports</span>
            <User className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {mockTechnicianReports.filter(r => r.roleType === 'technician').length}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">QA Reports</span>
            <Package className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {mockTechnicianReports.filter(r => r.roleType === 'quality').length}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Today</span>
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {mockTechnicianReports.filter(r => {
              const reportDate = new Date(r.createdAt);
              const today = new Date();
              return reportDate.toDateString() === today.toDateString();
            }).length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="technician">Technician Reports</option>
              <option value="quality">Quality Reports</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Report Info</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Job Order</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Author</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Type</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Duration</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No reports found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredReports.map(report => (
                  <tr key={report.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-800">{report.operationName}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Device: {report.deviceSerial}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-sm text-gray-700">{report.jobOrderCode}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-700">{report.technicianName}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(report.roleType)}`}>
                        {report.roleType === 'technician' ? 'Technician' : 'Quality'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      {formatDuration(report.actualTimeSeconds)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(report.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleViewReport(report)}
                          className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium text-sm flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleExportSingleReport(report)}
                          className="px-3 py-1.5 text-green-600 hover:bg-green-50 rounded-lg transition font-medium text-sm flex items-center gap-1"
                          title="Export as PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Detail Dialog */}
      {showDetailDialog && selectedReport && (
        <ReportDetailDialog
          isOpen={showDetailDialog}
          onClose={() => {
            setShowDetailDialog(false);
            setSelectedReport(null);
          }}
          report={selectedReport}
        />
      )}
    </div>
  );
};
