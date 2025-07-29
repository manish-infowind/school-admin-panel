import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth as useAuthHook } from '@/api/hooks/useAuth';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
  loading: boolean;
  isLoggingIn: boolean;
  loginError: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authHook = useAuthHook();

  const login = (email: string, password: string) => {
    authHook.login({ email, password });
  };

  const value: AuthContextType = {
    user: authHook.user,
    isAuthenticated: authHook.isAuthenticated,
    login,
    logout: authHook.logout,
    loading: authHook.isLoading,
    isLoggingIn: authHook.isLoggingIn,
    loginError: authHook.loginError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 