import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginView } from '../components/LoginView';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string>('');

  const handleLogin = (username: string, password: string) => {
    const success = login(username, password);
    
    if (success) {
      setError('');
      // On successful login, redirect to dashboard
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. Please check username and password.');
    }
  };

  return <LoginView onLoginSuccess={handleLogin} error={error} />;
};