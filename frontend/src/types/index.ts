export interface JobOrder {
  id: string;
  title: string;
  description: string;
  status: 'Assigned' | 'In Progress' | 'Completed';
  detailsOfWork: string; // User-added details
}

export interface CompletionReportData {
  amountCompleted: number;
  timeFrom: string;
  timeTo: string;
  reportDetails: string;
  serialNumbers: string; // Stored as a single string of numbers/text
}

export type View = 'login' | 'jobs';