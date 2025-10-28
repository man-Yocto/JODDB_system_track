import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginView } from '../components/LoginView';

export const LoginPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      const roleRoutes: Record<string, string> = {
        technician: '/technician',
        quality_inspector: '/quality',
        supervisor: '/supervisor',
        planner: '/planner',
      };
      
      const route = roleRoutes[user.role] || '/dashboard';
      console.log('Redirecting to:', route);
      navigate(route, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Don't render LoginView if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return <LoginView />;
};