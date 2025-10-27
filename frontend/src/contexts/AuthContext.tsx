import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { type User, type UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (userId: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database
const mockUsers: Record<string, { id: string; role: UserRole; name: string }> = {
  user: { id: '1', role: 'user', name: 'Technician User' },
  supervisor: { id: '2', role: 'supervisor', name: 'Supervisor User' },
  planner: { id: '3', role: 'planner', name: 'Planning Engineer' },
  quality: { id: '4', role: 'quality', name: 'Quality Inspector' }
};

// Mock passwords database
const mockPasswords: Record<string, string> = {
  user: 'user123',
  supervisor: 'super123',
  planner: 'plan123',
  quality: 'qa123'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string): boolean => {
    const userData = mockUsers[username];
    const correctPassword = mockPasswords[username];

    if (userData && correctPassword === password) {
      setUser({
        id: userData.id,
        role: userData.role,
        name: userData.name
      });
      return true;
    }
    
    return false;
  };

  const logout = () => {
    // Clear user state immediately
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
