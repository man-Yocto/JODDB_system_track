import React, { useState, useCallback, useMemo } from 'react';
import { User, Lock, Menu, Briefcase, PlusCircle, CheckCircle } from 'lucide-react';
import "./App.css"

// --- TYPE DEFINITIONS ---

interface JobOrder {
  id: string;
  title: string;
  description: string;
  status: 'Assigned' | 'In Progress' | 'Completed';
  detailsOfWork: string; // User-added details
}

// Data structure for the detailed completion report
interface CompletionReportData {
  amountCompleted: number;
  timeFrom: string;
  timeTo: string;
  reportDetails: string;
  serialNumbers: string; // Stored as a single string of numbers/text
}

type View = 'login' | 'jobs';

// --- MOCK DATA ---
const initialJobOrders: JobOrder[] = [
  { id: 'J-001', title: 'System Diagnostics on Unit 4', description: 'Perform full diagnostic check on main radar unit.', status: 'Assigned', detailsOfWork: '' },
  { id: 'J-002', title: 'Firmware Update for Terminal 12', description: 'Apply latest security patch and test functionality.', status: 'In Progress', detailsOfWork: 'Started patch deployment. Found initial dependency error.' },
  { id: 'J-003', title: 'Routine Maintenance Check B', description: 'Check power supply and cooling systems.', status: 'Assigned', detailsOfWork: '' },
  // Adding more mock jobs to ensure the scrollbar is visible
  { id: 'J-004', title: 'Antenna Alignment Check', description: 'Verify physical alignment of main antenna array.', status: 'Assigned', detailsOfWork: '' },
  { id: 'J-005', title: 'Network Switch Replacement', description: 'Replace faulty network switch in comms rack.', status: 'In Progress', detailsOfWork: 'Switch isolated and replacement unit acquired.' },
  { id: 'J-006', title: 'Power System Load Test', description: 'Run a 30-minute load test on backup generators.', status: 'Assigned', detailsOfWork: '' },
  { id: 'J-007', title: 'Software Rollback on Server', description: 'Revert Server Alpha to previous stable build.', status: 'Assigned', detailsOfWork: '' },
  { id: 'J-008', title: 'Cable Management Cleanup', description: 'Re-bundle and label all patch panel cables.', status: 'Assigned', detailsOfWork: '' },
  { id: 'J-009', title: 'Quarterly Inventory Audit', description: 'Perform full physical inventory count.', status: 'Assigned', detailsOfWork: '' },
];

// --- COMPONENTS ---

/**
 * Universal Modal Dialog Component
 * Uses a fixed position and simple gray backdrop for the dialogs.
 */
interface DialogProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const Dialog: React.FC<DialogProps> = ({ title, isOpen, onClose, children, className = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-2xl w-full max-w-lg transform transition-all overflow-hidden ${className}`}>
        {/* Modal Header mimicking the theme's clean lines */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition duration-150">
            &times;
          </button>
        </div>
        {/* Modal Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};


/**
 * Dialog for adding details to a job order (renamed to reflect "Work Timing Details")
 */
interface WorkTimingDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string | null;
  onSaveDetails: (jobId: string, details: string) => void;
  currentDetails: string;
}

const WorkTimingDetailsDialog: React.FC<WorkTimingDetailsDialogProps> = ({ isOpen, onClose, jobId, onSaveDetails, currentDetails }) => {
  const [details, setDetails] = useState(currentDetails);

  React.useEffect(() => {
    // Reset state only when the dialog opens
    if (isOpen) {
      setDetails(currentDetails);
    }
  }, [currentDetails, isOpen]);

  const handleSave = () => {
    if (jobId) {
      onSaveDetails(jobId, details);
      onClose();
    }
  };

  return (
    <Dialog title="Work Timing Details" isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700" htmlFor="workDetails">
          Intermediate Details for Job ID: {jobId}
        </label>
        <textarea
          id="workDetails"
          rows={6}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
          placeholder="Log your work progress or timing notes here..."
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={!details.trim()}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 disabled:opacity-50"
          >
            Save Work Details
          </button>
        </div>
      </div>
    </Dialog>
  );
};

/**
 * Dialog for completing a job order with detailed reporting (New requirement, based on Screenshot 1 content)
 */
interface CompletionReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string | null;
  onComplete: (jobId: string, reportData: CompletionReportData) => void;
}

const CompletionReportDialog: React.FC<CompletionReportDialogProps> = ({ isOpen, onClose, jobId, onComplete }) => {
  const [reportData, setReportData] = useState<CompletionReportData>({
    amountCompleted: 0,
    timeFrom: '',
    timeTo: '',
    reportDetails: '',
    serialNumbers: '',
  });

  // State reset on open/close
  React.useEffect(() => {
    if (isOpen) {
      setReportData({
        amountCompleted: 0,
        timeFrom: '',
        timeTo: '',
        reportDetails: '',
        serialNumbers: '',
      });
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setReportData(prev => ({
      ...prev,
      [id]: value,
    }));
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setReportData(prev => ({
          ...prev,
          amountCompleted: parseInt(e.target.value, 10) || 0,
      }));
  }

  const handleConfirm = () => {
    // Basic validation check
    if (jobId && reportData.amountCompleted > 0 && reportData.timeFrom && reportData.timeTo) {
      onComplete(jobId, reportData);
      onClose();
    } else {
      // In a real app, show a proper feedback message instead of console error
      console.error("Please fill in all required fields (Amount, Time From/To, and Completed Amount > 0).");
    }
  };

  const isFormValid = reportData.amountCompleted > 0 && !!reportData.timeFrom && !!reportData.timeTo;

  return (
    <Dialog title={`Final Report for Job: ${jobId}`} isOpen={isOpen} onClose={onClose} className="!max-w-4xl">
      {/* Two-column layout based on Screenshot 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT COLUMN: Serial Numbers */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Enter serial numbers</h3>
          
          {/* Mock Serial Number Dropdown/Input (Styled like the screenshot) */}
          <div className="mb-4 relative">
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm pr-10"
              placeholder="type here..."
              // This is a mock input based on the screenshot, it doesn't store state
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
              <span className="text-xl">v</span> {/* Simple down arrow mock */}
            </div>
          </div>

          <label className="block text-base font-medium text-gray-700 mb-2" htmlFor="serialNumbers">
            Serial Numbers
          </label>
          <textarea
            id="serialNumbers"
            rows={10}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
            placeholder="Enter a list of serial numbers, one per line..."
            value={reportData.serialNumbers}
            onChange={handleChange}
          />
        </div>

        {/* RIGHT COLUMN: Amount, Time, Details */}
        <div className="space-y-6">
          {/* Enter Amount */}
          <div>
            <label className="block text-xl font-semibold text-gray-800 mb-2" htmlFor="amountCompleted">
              Enter the amount
            </label>
            <input
              id="amountCompleted"
              type="number"
              min="0"
              value={reportData.amountCompleted}
              onChange={handleAmountChange}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-lg"
              placeholder="0"
              required
            />
          </div>

          {/* Enter Time From/To */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              Enter the time from to
            </label>
            <div className="flex gap-4">
              <input
                id="timeFrom"
                type="time"
                value={reportData.timeFrom}
                onChange={handleChange}
                className="flex-1 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              />
              <input
                id="timeTo"
                type="time"
                value={reportData.timeTo}
                onChange={handleChange}
                className="flex-1 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              />
            </div>
          </div>

          {/* Any Details */}
          <div>
            <label className="block text-xl font-semibold text-gray-800 mb-2" htmlFor="reportDetails">
              Any Details
            </label>
            <textarea
              id="reportDetails"
              rows={5}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
              placeholder="Type here....."
              value={reportData.reportDetails}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t mt-6">
        <button
          onClick={handleConfirm}
          disabled={!isFormValid}
          className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 disabled:opacity-50"
        >
          <CheckCircle className="inline w-5 h-5 mr-2" />
          Finalize Report and Complete Task
        </button>
      </div>
    </Dialog>
  );
};


/**
 * Job Order List Item
 */
interface JobItemProps {
  job: JobOrder;
  onSelect: (jobId: string) => void;
  isActive: boolean;
}

const JobItem: React.FC<JobItemProps> = ({ job, onSelect, isActive }) => {
  let statusColor = '';
  switch (job.status) {
    case 'Completed':
      statusColor = 'bg-green-100 text-green-800';
      break;
    case 'In Progress':
      statusColor = 'bg-yellow-100 text-yellow-800';
      break;
    case 'Assigned':
    default:
      statusColor = 'bg-blue-100 text-blue-800';
      break;
  }

  return (
    <div
      className={`p-4 border-b border-gray-200 cursor-pointer transition duration-200 ${isActive ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50'}`}
      onClick={() => onSelect(job.id)}
    >
      <div className="flex justify-between items-start">
        <p className="font-semibold text-gray-800">{job.title}</p>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor}`}>
          {job.status}
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-1">ID: {job.id}</p>
    </div>
  );
};


/**
 * Main Job Orders View (Jobs Screen)
 */
interface JobOrdersViewProps {
  jobOrders: JobOrder[];
  onUpdateJob: (jobId: string, details: Partial<JobOrder>) => void;
}

const JobOrdersView: React.FC<JobOrdersViewProps> = ({ jobOrders, onUpdateJob }) => {
  const [activeJobId, setActiveJobId] = useState<string | null>(initialJobOrders[0]?.id || null);
  // Renamed state variable to match the new button name
  const [showWorkTimingDialog, setShowWorkTimingDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const activeJob = useMemo(() => jobOrders.find(job => job.id === activeJobId), [jobOrders, activeJobId]);

  const handleSaveDetails = (id: string, details: string) => {
    onUpdateJob(id, { detailsOfWork: details, status: 'In Progress' });
  };

  const handleCompleteJob = (id: string, reportData: CompletionReportData) => {
    // In a real application, you would send reportData to a server here.
    console.log(`Job ${id} Completed with Report Data:`, reportData);

    // Update job status and details with a completion summary
    onUpdateJob(id, {
      status: 'Completed',
      detailsOfWork: (activeJob?.detailsOfWork || '') +
                     `\n\n--- COMPLETED REPORT ---\n` +
                     `Completed: ${reportData.amountCompleted} devices.\n` +
                     `Work Time: ${reportData.timeFrom} to ${reportData.timeTo}\n` +
                     `Serial Nos: ${reportData.serialNumbers.split('\n').filter(s => s).length} entries.\n` +
                     `Report Notes: ${reportData.reportDetails}`
    });
    // Move to the next assigned job after completion
    const nextJob = jobOrders.find(job => job.status !== 'Completed' && job.id !== id);
    setActiveJobId(nextJob?.id || null);
  };

  // Handler for the "Work Timing Details" button in the left panel
  const handleWorkTimingDetailsClick = () => {
    if (activeJob && activeJob.status !== 'Completed') {
      setShowWorkTimingDialog(true);
    }
  };

  // Handler for the "Complete Report" button in the right panel
  const handleCompleteReportClick = () => {
    if (activeJob && activeJob.status !== 'Completed') {
      setShowReportDialog(true);
    }
  };

  if (!activeJob) {
    return (
      <div className="p-8 text-center text-gray-600">
        <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-semibold">No Active Job Orders</h2>
        <p>All assigned tasks are currently completed.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full">
      {/* Job Orders List (Left Panel) - Configured for scrolling and button placement */}
      <div className="md:w-1/3 bg-white border-r border-gray-200 shadow-md flex flex-col">
        <h2 className="text-lg font-bold p-4 border-b border-gray-200 bg-gray-50 text-center uppercase tracking-wider flex-shrink-0">JOB ORDERS</h2>
        
        {/* Job List area - takes available space and scrolls */}
        <div className="flex-grow overflow-y-auto">
          {jobOrders.map(job => (
            <JobItem
              key={job.id}
              job={job}
              onSelect={setActiveJobId}
              isActive={job.id === activeJobId}
            />
          ))}
        </div>
        
        {/* Work Timing Details button fixed at the bottom of the list panel */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={handleWorkTimingDetailsClick}
            disabled={activeJob.status === 'Completed'}
            className="w-full px-4 py-3 bg-blue-100 text-blue-800 font-medium rounded-lg shadow-sm hover:bg-blue-200 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusCircle className="inline w-4 h-4 mr-1.5" />
            Work Timing Details
          </button>
        </div>
      </div>

      {/* Job Details and Actions (Right Panel) */}
      <div className="md:w-2/3 bg-gray-50 p-6 flex flex-col justify-between">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{activeJob.title}</h1>
          <p className="text-sm font-medium text-blue-600 mb-4">Job ID: {activeJob.id}</p>

          <div className="bg-white p-6 rounded-lg shadow-inner border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Task Description</h3>
            <p className="text-gray-600">{activeJob.description}</p>
          </div>

          <div className="mt-6 bg-white p-6 rounded-lg shadow-inner border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Current Work Details</h3>
            <div className="min-h-[100px] text-gray-600 whitespace-pre-wrap">
              {activeJob.detailsOfWork || <span className="text-gray-400 italic">No details added yet.</span>}
            </div>
          </div>
        </div>

        {/* Action Buttons (Only Complete Report, which is full width) */}
        <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-lg">
          {/* Complete Report (Full Width) */}
          <button
            onClick={handleCompleteReportClick}
            disabled={activeJob.status === 'Completed'}
            className="w-full px-8 py-4 bg-gray-300 text-gray-800 font-bold rounded-lg shadow-md hover:bg-gray-400 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            <CheckCircle className="inline w-5 h-5 mr-2" />
            Complete Report
          </button>
        </div>
      </div>

      {/* Modals */}
      <WorkTimingDetailsDialog
        isOpen={showWorkTimingDialog}
        onClose={() => setShowWorkTimingDialog(false)}
        jobId={activeJobId}
        onSaveDetails={handleSaveDetails}
        currentDetails={activeJob?.detailsOfWork || ''}
      />
      <CompletionReportDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        jobId={activeJobId}
        onComplete={handleCompleteJob}
      />
    </div>
  );
};


/**
 * Login Screen (Based on Screenshot 3)
 */
interface LoginViewProps {
  onLoginSuccess: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock authentication for redirection
    if (userId && password) {
      console.log('Attempting login...');
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
        <div className="text-center mb-6">
          {/* Logo element styled after Aselsan theme */}
          <div className="text-3xl font-extrabold text-blue-600 mb-2">
            aselsan<span className="text-gray-500 font-light text-base ml-1">Middle East</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* User ID Input */}
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700">User ID</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="User"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Password"
                required
              />
            </div>
          </div>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="mt-6 w-full py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 transition duration-200 uppercase tracking-wider disabled:opacity-75"
          disabled={!userId || !password}
        >
          Login
        </button>
      </form>
    </div>
  );
};

/**
 * Global Header component
 * Always visible (except on the dedicated Login screen for simplicity)
 */
const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center border-b border-gray-200">
      <div className="flex items-center space-x-4">
        <User className="w-8 h-8 text-gray-700 border border-gray-300 rounded-full p-1" />
        <div className="text-2xl font-extrabold text-blue-600">
            aselsan<span className="text-gray-500 font-light text-base ml-1">Middle East</span>
        </div>
      </div>
      <Menu className="w-6 h-6 text-gray-700 cursor-pointer" />
    </header>
  );
};


/**
 * Main Application Component (App)
 */
const App: React.FC = () => {
  const [view, setView] = useState<View>('login');
  const [jobOrders, setJobOrders] = useState<JobOrder[]>(initialJobOrders);

  // Function to handle login success
  const handleLoginSuccess = useCallback(() => {
    setView('jobs');
  }, []);

  // Function to handle updating a job order
  const handleUpdateJob = useCallback((jobId: string, details: Partial<JobOrder>) => {
    setJobOrders(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId
          ? { ...job, ...details }
          : job
      )
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased">
      {/* Load Tailwind CSS */}
      <script src="https://cdn.tailwindcss.com"></script>
      <style>{`
        /* Custom Font for a cleaner look */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
        .font-sans {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
      
      {view === 'jobs' && <Header />}

      <main className={view === 'jobs' ? 'h-[calc(100vh-65px)]' : 'h-screen'}>
        {view === 'login' ? (
          <LoginView onLoginSuccess={handleLoginSuccess} />
        ) : (
          <JobOrdersView jobOrders={jobOrders} onUpdateJob={handleUpdateJob} />
        )}
      </main>
    </div>
  );
};

export default App;