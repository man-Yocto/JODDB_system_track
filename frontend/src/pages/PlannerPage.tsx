import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Calendar } from 'lucide-react';

export const PlannerPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onLogout={handleLogout} />
      <main className="h-[calc(100vh-65px)] flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Planner Dashboard</h1>
          <p className="text-gray-600 mb-4">
            Create job orders, assign tasks, and manage scheduling.
          </p>
          <div className="text-sm text-gray-500 italic">
            This page is under development.
          </div>
        </div>
      </main>
    </div>
  );
};
