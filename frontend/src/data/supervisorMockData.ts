import { type TechnicianPerformance, type Alert, type DeviceLog, type TechnicianSubmission, type SupervisorJobOrder, type ReviewQueueItem, type SupervisorQAReview, type TechnicianReport } from '../types';

export const mockTechnicians: TechnicianPerformance[] = [
  { id: 'T001', name: 'Ahmed Ali', productivity: 95, efficiency: 92, utilization: 88, status: 'normal' },
  { id: 'T002', name: 'Sara Hassan', productivity: 88, efficiency: 85, utilization: 90, status: 'normal' },
  { id: 'T003', name: 'Mohammed Ibrahim', productivity: 72, efficiency: 68, utilization: 75, status: 'at-risk' },
  { id: 'T004', name: 'Fatima Khalil', productivity: 91, efficiency: 89, utilization: 87, status: 'normal' },
  { id: 'T005', name: 'Omar Saeed', productivity: 58, efficiency: 55, utilization: 62, status: 'low' },
];

export const mockAlerts: Alert[] = [
  {
    id: 'A001',
    type: 'deadline',
    severity: 'high',
    title: 'Job J-002 approaching deadline',
    description: 'Only 2 days remaining with 35% completion',
    relatedJobId: 'J-002',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'new'
  },
  {
    id: 'A002',
    type: 'performance',
    severity: 'medium',
    title: 'Technician T005 below threshold',
    description: 'Omar Saeed efficiency at 55% (threshold: 70%)',
    relatedTechnicianId: 'T005',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    status: 'acknowledged'
  },
  {
    id: 'A003',
    type: 'data-integrity',
    severity: 'high',
    title: 'Tasks missing reviews',
    description: '8 tasks completed but not yet reviewed by supervisor',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    status: 'new'
  },
];

export const mockSupervisorJobs: SupervisorJobOrder[] = [
  {
    id: 'J-001',
    title: 'System Diagnostics on Unit 4',
    description: 'Perform full diagnostic check on main radar unit.',
    status: 'In Progress',
    detailsOfWork: '',
    percentComplete: 65,
    dueDate: '2024-03-15',
    assignedTechnicians: ['T001', 'T002'],
    priority: 'high',
    reviewStatus: 'partially-reviewed'
  },
  {
    id: 'J-002',
    title: 'Firmware Update for Terminal 12',
    description: 'Apply latest security patch and test functionality.',
    status: 'In Progress',
    detailsOfWork: '',
    percentComplete: 35,
    dueDate: '2024-03-10',
    assignedTechnicians: ['T003'],
    priority: 'high',
    reviewStatus: 'flagged'
  },
  {
    id: 'J-003',
    title: 'Routine Maintenance Check B',
    description: 'Check power supply and cooling systems.',
    status: 'Assigned',
    detailsOfWork: '',
    percentComplete: 0,
    dueDate: '2024-03-20',
    assignedTechnicians: ['T004', 'T005'],
    priority: 'medium',
    reviewStatus: 'not-reviewed'
  },
];

export const mockDeviceLogs: DeviceLog[] = [
  { 
    serialId: 'SN-10001', 
    technicianId: 'T001', 
    technicianName: 'Ahmed Ali', 
    status: 'completed', 
    timestamp: '2024-03-08 09:30', 
    jobId: 'J-001',
    qaStatus: 'approved',
    supervisorReview: {
      id: 'R001',
      reviewType: 'quality',
      note: 'Excellent work, all tests passed',
      createdAt: '2024-03-08 10:00',
      reviewedBy: 'SUP001',
      flaggedForQA: false
    }
  },
  { 
    serialId: 'SN-10002', 
    technicianId: 'T001', 
    technicianName: 'Ahmed Ali', 
    status: 'completed', 
    timestamp: '2024-03-08 10:15', 
    jobId: 'J-001',
    qaStatus: 'pending'
  },
  { 
    serialId: 'SN-10003', 
    technicianId: 'T002', 
    technicianName: 'Sara Hassan', 
    status: 'in-progress', 
    timestamp: '2024-03-08 11:00', 
    jobId: 'J-001',
    qaStatus: 'not-reviewed'
  },
  { 
    serialId: 'SN-20001', 
    technicianId: 'T003', 
    technicianName: 'Mohammed Ibrahim', 
    status: 'completed', 
    timestamp: '2024-03-08 08:45', 
    jobId: 'J-002',
    qaStatus: 'not-reviewed'
  },
];

export const mockSubmissions: TechnicianSubmission[] = [
  {
    id: 'SUB001',
    technicianId: 'T001',
    technicianName: 'Ahmed Ali',
    jobId: 'J-001',
    date: '2024-03-08',
    devicesCompleted: 12,
    timeSpent: '6.5 hrs',
    notes: 'All units tested successfully',
    qaStatus: 'pending',
    supervisorReview: {
      id: 'R002',
      reviewType: 'performance',
      note: 'Good pace, completed ahead of schedule',
      createdAt: '2024-03-08 16:00',
      reviewedBy: 'SUP001',
      flaggedForQA: false
    }
  },
  {
    id: 'SUB002',
    technicianId: 'T002',
    technicianName: 'Sara Hassan',
    jobId: 'J-001',
    date: '2024-03-08',
    devicesCompleted: 8,
    timeSpent: '5 hrs',
    notes: 'Minor issues on 2 units, documented',
    qaStatus: 'not-reviewed'
  },
  {
    id: 'SUB003',
    technicianId: 'T003',
    technicianName: 'Mohammed Ibrahim',
    jobId: 'J-002',
    date: '2024-03-08',
    devicesCompleted: 5,
    timeSpent: '7 hrs',
    notes: 'Encountered firmware compatibility issues',
    qaStatus: 'not-reviewed'
  },
];

export const mockReviewQueue: ReviewQueueItem[] = [
  {
    id: 'RQ001',
    type: 'device',
    jobId: 'J-001',
    jobTitle: 'System Diagnostics on Unit 4',
    technicianId: 'T002',
    technicianName: 'Sara Hassan',
    itemDescription: 'Device SN-10003',
    submittedAt: '2024-03-08 11:00',
    priority: 'high'
  },
  {
    id: 'RQ002',
    type: 'task',
    jobId: 'J-001',
    jobTitle: 'System Diagnostics on Unit 4',
    technicianId: 'T002',
    technicianName: 'Sara Hassan',
    itemDescription: 'Daily task submission - 8 devices',
    submittedAt: '2024-03-08 15:30',
    priority: 'medium'
  },
  {
    id: 'RQ003',
    type: 'task',
    jobId: 'J-002',
    jobTitle: 'Firmware Update for Terminal 12',
    technicianId: 'T003',
    technicianName: 'Mohammed Ibrahim',
    itemDescription: 'Daily task submission - 5 devices',
    submittedAt: '2024-03-08 16:00',
    priority: 'high'
  },
];

export const mockSupervisorQAReviews: SupervisorQAReview[] = [
  {
    id: 'SQAR001',
    inspectionId: 'INS001',
    taskId: 'T010',
    deviceSerial: 'SN-10010',
    jobOrderCode: 'RADAR-DIAG-001',
    technicianName: 'Ahmed Ali',
    operationName: 'System Diagnostics',
    qaDecision: 'accepted',
    qaComments: 'Work meets quality standards. All tests passed.',
    qaInspector: 'Fatima Quality',
    qaInspectedAt: '2024-03-08 10:30',
    status: 'pending-supervisor'
  },
  {
    id: 'SQAR002',
    inspectionId: 'INS002',
    taskId: 'T011',
    deviceSerial: 'SN-10011',
    jobOrderCode: 'RADAR-DIAG-001',
    technicianName: 'Sara Hassan',
    operationName: 'System Diagnostics',
    qaDecision: 'rejected',
    qaComments: 'Incomplete calibration data. Sensor readings show variance beyond acceptable range.',
    qaInspector: 'Fatima Quality',
    qaInspectedAt: '2024-03-08 09:45',
    status: 'pending-supervisor'
  },
  {
    id: 'SQAR003',
    inspectionId: 'INS003',
    taskId: 'T012',
    deviceSerial: 'SN-20005',
    jobOrderCode: 'FW-UPDATE-002',
    technicianName: 'Mohammed Ibrahim',
    operationName: 'Firmware Update',
    qaDecision: 'accepted',
    qaComments: 'Update verification successful. All functionality tests passed.',
    qaInspector: 'Fatima Quality',
    qaInspectedAt: '2024-03-08 08:15',
    supervisorDecision: 'accepted',
    supervisorComments: 'Approved. Work meets standards.',
    supervisorReviewedAt: '2024-03-08 14:20',
    status: 'supervisor-approved'
  },
];

export const mockTechnicianReports: TechnicianReport[] = [
  {
    id: 'REP001',
    taskId: 'T001',
    jobOrderId: 'JO-001',
    jobOrderCode: 'RADAR-DIAG-001',
    technicianId: 'U001',
    technicianName: 'Ahmed Ali',
    deviceSerial: 'SN-10001',
    operationName: 'System Diagnostics',
    roleType: 'technician',
    content: 'Assembly completed successfully. All components fitted correctly. Minor issue with connector B-3 required additional adjustment. Resolved by re-seating the connector.',
    quantity: 1,
    startTime: '2024-03-08 09:00',
    endTime: '2024-03-08 11:15',
    actualTimeSeconds: 8100,
    createdAt: '2024-03-08 11:20',
    updatedAt: '2024-03-08 11:20'
  },
  {
    id: 'REP002',
    taskId: 'T001',
    jobOrderId: 'JO-001',
    jobOrderCode: 'RADAR-DIAG-001',
    technicianId: 'QI001',
    technicianName: 'Fatima Quality',
    deviceSerial: 'SN-10001',
    operationName: 'System Diagnostics',
    roleType: 'quality',
    content: 'Visual inspection passed. Electrical continuity test: OK. Dimensions within tolerance. All quality checks completed successfully.',
    quantity: 1,
    startTime: '2024-03-08 11:30',
    endTime: '2024-03-08 11:45',
    actualTimeSeconds: 900,
    createdAt: '2024-03-08 11:50',
    updatedAt: '2024-03-08 11:50'
  },
  {
    id: 'REP003',
    taskId: 'T002',
    jobOrderId: 'JO-001',
    jobOrderCode: 'RADAR-DIAG-001',
    technicianId: 'U002',
    technicianName: 'Sara Hassan',
    deviceSerial: 'SN-10002',
    operationName: 'System Diagnostics',
    roleType: 'technician',
    content: 'Encountered firmware compatibility issue during initial testing. Required additional troubleshooting. Updated firmware to version 2.1.4. All systems operational.',
    quantity: 1,
    startTime: '2024-03-08 08:00',
    endTime: '2024-03-08 11:00',
    actualTimeSeconds: 10800,
    createdAt: '2024-03-08 11:10',
    updatedAt: '2024-03-08 11:10'
  },
];
