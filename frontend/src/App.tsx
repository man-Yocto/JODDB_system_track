import React, { useState, useCallback } from 'react';
import { type JobOrder, type View } from './types';
import { initialJobOrders } from './data/mockData.ts';
import { Header } from './components/Header.tsx';
import { LoginView } from './components/LoginView.tsx';
import { JobOrdersView } from './components/JobOrdersView.tsx';
import "./App.css"

const App: React.FC = () => {
  const [view, setView] = useState<View>('login');
  const [jobOrders, setJobOrders] = useState<JobOrder[]>(initialJobOrders);

  const handleLoginSuccess = useCallback(() => {
    setView('jobs');
  }, []);

  const handleLogout = useCallback(() => {
    setView('login');
  }, []);

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
      
      {view === 'jobs' && <Header onLogout={handleLogout} />}

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