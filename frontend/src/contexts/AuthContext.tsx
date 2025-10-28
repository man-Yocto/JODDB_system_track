import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User, type UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser);
        setUser({
          id: userData.id.toString(),
          role: mapBackendRoleToFrontend(userData.role),
          name: userData.full_name || userData.username,
        });
      } catch (err) {
        console.error('Failed to restore user session:', err);
        localStorage.clear();
      }
    }
  }, []);

  // Map backend roles to frontend roles
  const mapBackendRoleToFrontend = (backendRole: string): UserRole => {
    const roleMapping: Record<string, UserRole> = {
      'technician': 'technician',
      'supervisor': 'supervisor',
      'planning': 'planner',
      'quality': 'quality',
      'admin': 'planner', // Admin treated as planner in UI
    };
    return roleMapping[backendRole] || 'technician';
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Call the real backend API
      const response = await api.auth.login(username, password);

      // Set user state from backend response
      setUser({
        id: response.user.id.toString(),
        role: mapBackendRoleToFrontend(response.user.role),
        name: response.user.full_name || response.user.username,
      });

      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      // Call backend logout to blacklist token
      await api.auth.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear user state
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
