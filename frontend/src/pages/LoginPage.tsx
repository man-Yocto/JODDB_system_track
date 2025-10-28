import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginView } from '../components/LoginView';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();

  const handleLogin = async (username: string, password: string) => {
    const success = await login(username, password);
    
    if (success) {
      // On successful login, redirect to dashboard
      navigate('/dashboard');
    }
    // Error is handled by AuthContext
  };

  return <LoginView onLoginSuccess={handleLogin} error={error || undefined} isLoading={isLoading} />;
};