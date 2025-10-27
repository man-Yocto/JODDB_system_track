import { type JobOrder } from '../types';

export const initialJobOrders: JobOrder[] = [
  { id: 'J-001', title: 'System Diagnostics on Unit 4', description: 'Perform full diagnostic check on main radar unit.', status: 'Assigned', detailsOfWork: '' },
  { id: 'J-002', title: 'Firmware Update for Terminal 12', description: 'Apply latest security patch and test functionality.', status: 'In Progress', detailsOfWork: 'Started patch deployment. Found initial dependency error.' },
  { id: 'J-003', title: 'Routine Maintenance Check B', description: 'Check power supply and cooling systems.', status: 'Assigned', detailsOfWork: '' },
  { id: 'J-004', title: 'Antenna Alignment Check', description: 'Verify physical alignment of main antenna array.', status: 'Assigned', detailsOfWork: '' },
  { id: 'J-005', title: 'Network Switch Replacement', description: 'Replace faulty network switch in comms rack.', status: 'In Progress', detailsOfWork: 'Switch isolated and replacement unit acquired.' },
  { id: 'J-006', title: 'Power System Load Test', description: 'Run a 30-minute load test on backup generators.', status: 'Assigned', detailsOfWork: '' },
  { id: 'J-007', title: 'Software Rollback on Server', description: 'Revert Server Alpha to previous stable build.', status: 'Assigned', detailsOfWork: '' },
  { id: 'J-008', title: 'Cable Management Cleanup', description: 'Re-bundle and label all patch panel cables.', status: 'Assigned', detailsOfWork: '' },
  { id: 'J-009', title: 'Quarterly Inventory Audit', description: 'Perform full physical inventory count.', status: 'Assigned', detailsOfWork: '' },
];