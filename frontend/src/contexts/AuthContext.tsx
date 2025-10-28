import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User, type UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Failed to restore session:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
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
    try {
      const response = await api.auth.login(username, password);
      
      console.log('Login response:', response); // Debug log
      
      // Store tokens and user data
      if (response.access && response.refresh && response.user) {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        
        // Map backend user format to frontend User type
        const mappedUser: any = {
          id: String(response.user.id),
          name: response.user.full_name || response.user.username,
          email: response.user.email || response.user.username,
          username: response.user.username,
          role: response.user.role as UserRole
        };
        
        localStorage.setItem('user', JSON.stringify(mappedUser));
        setUser(mappedUser);
        
        console.log('Login successful, user set:', mappedUser); // Debug log
        return true;
      } else {
        console.error('Invalid login response format:', response);
        return false;
      }
    } catch (err: any) {
      console.error('Login error:', err);
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
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
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
