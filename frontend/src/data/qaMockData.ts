import { type QATask, type QAInspection, type QAMetrics } from '../types';

export const mockQATasks: QATask[] = [
  {
    id: 'T001',
    deviceSerial: 'SN-10001',
    jobOrderCode: 'RADAR-DIAG-001',
    jobOrderId: 'JO-001',
    technicianId: 'U001',
    technicianName: 'Ahmed Ali',
    operationName: 'System Diagnostics',
    standardTime: 9000, // 2.5 hours
    actualTime: 8100, // 2.25 hours
    startTime: '2024-03-08 09:00',
    endTime: '2024-03-08 11:15',
    status: 'pending_qa',
    technicianNotes: 'All diagnostics completed successfully. Minor calibration adjustment made to sensor array.',
    efficiency: 111,
    submittedAt: '2024-03-08 11:20'
  },
  {
    id: 'T002',
    deviceSerial: 'SN-10002',
    jobOrderCode: 'RADAR-DIAG-001',
    jobOrderId: 'JO-001',
    technicianId: 'U002',
    technicianName: 'Sara Hassan',
    operationName: 'System Diagnostics',
    standardTime: 9000,
    actualTime: 10800, // 3 hours - overtime
    startTime: '2024-03-08 08:00',
    endTime: '2024-03-08 11:00',
    status: 'pending_qa',
    technicianNotes: 'Encountered firmware compatibility issue. Required additional troubleshooting. Issue resolved.',
    efficiency: 83,
    submittedAt: '2024-03-08 11:10'
  },
  {
    id: 'T003',
    deviceSerial: 'SN-20001',
    jobOrderCode: 'FW-UPDATE-002',
    jobOrderId: 'JO-002',
    technicianId: 'U003',
    technicianName: 'Mohammed Ibrahim',
    operationName: 'Firmware Update',
    standardTime: 5400, // 1.5 hours
    actualTime: 5100,
    startTime: '2024-03-08 13:00',
    endTime: '2024-03-08 14:25',
    status: 'done',
    technicianNotes: 'Update completed without issues. All post-update tests passed.',
    efficiency: 106,
    submittedAt: '2024-03-08 14:30'
  },
];

export const mockQAInspections: QAInspection[] = [
  {
    id: 'INS001',
    taskId: 'T010',
    deviceSerial: 'SN-10010',
    jobOrderCode: 'RADAR-DIAG-001',
    technicianName: 'Ahmed Ali',
    operationName: 'System Diagnostics',
    decision: 'accepted',
    comments: 'Work meets quality standards. All tests passed.',
    inspectorId: 'QI001',
    inspectorName: 'Fatima Quality',
    inspectedAt: '2024-03-08 10:30'
  },
  {
    id: 'INS002',
    taskId: 'T011',
    deviceSerial: 'SN-10011',
    jobOrderCode: 'RADAR-DIAG-001',
    technicianName: 'Sara Hassan',
    operationName: 'System Diagnostics',
    decision: 'rejected',
    comments: 'Incomplete calibration data. Sensor readings show variance beyond acceptable range. Please recalibrate and retest.',
    inspectorId: 'QI001',
    inspectorName: 'Fatima Quality',
    inspectedAt: '2024-03-08 09:45'
  },
  {
    id: 'INS003',
    taskId: 'T012',
    deviceSerial: 'SN-20005',
    jobOrderCode: 'FW-UPDATE-002',
    technicianName: 'Mohammed Ibrahim',
    operationName: 'Firmware Update',
    decision: 'accepted',
    comments: 'Update verification successful. All functionality tests passed.',
    inspectorId: 'QI001',
    inspectorName: 'Fatima Quality',
    inspectedAt: '2024-03-08 08:15'
  },
];

export const mockQAMetrics: QAMetrics = {
  pendingInspections: 3,
  acceptedToday: 12,
  rejectedToday: 2,
  reworkTasks: 1,
  acceptanceRate: 85.7
};

export const mockQADeviceLogs = [
  { serialId: 'SN-10001', technicianId: 'U001', technicianName: 'Ahmed Ali', status: 'completed' as const, timestamp: '2024-03-08 09:30', jobId: 'JO-001', qaStatus: 'approved' as const },
  { serialId: 'SN-10002', technicianId: 'U001', technicianName: 'Ahmed Ali', status: 'completed' as const, timestamp: '2024-03-08 10:15', jobId: 'JO-001', qaStatus: 'pending' as const },
  { serialId: 'SN-10003', technicianId: 'U002', technicianName: 'Sara Hassan', status: 'in-progress' as const, timestamp: '2024-03-08 11:00', jobId: 'JO-001', qaStatus: 'not-reviewed' as const },
  { serialId: 'SN-20001', technicianId: 'U003', technicianName: 'Mohammed Ibrahim', status: 'completed' as const, timestamp: '2024-03-08 08:45', jobId: 'JO-002', qaStatus: 'not-reviewed' as const },
  { serialId: 'SN-20002', technicianId: 'U001', technicianName: 'Ahmed Ali', status: 'completed' as const, timestamp: '2024-03-08 14:20', jobId: 'JO-002', qaStatus: 'approved' as const },
];
