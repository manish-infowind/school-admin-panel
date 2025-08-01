import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth as useAuthHook } from '@/api/hooks/useAuth';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  verify2FA: (data: { otp: string; tempToken: string }) => void;
  logout: () => void;
  loading: boolean;
  isLoggingIn: boolean;
  isVerifying2FA: boolean;
  loginError: any;
  verify2FAError: any;
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
    // The AuthService.login method will handle device data, IP, and location automatically
    authHook.login({ email, password } as any);
  };

  const value: AuthContextType = {
    user: authHook.user,
    isAuthenticated: authHook.isAuthenticated,
    login,
    verify2FA: authHook.verify2FA,
    logout: authHook.logout,
    loading: authHook.isLoading,
    isLoggingIn: authHook.isLoggingIn,
    isVerifying2FA: authHook.isVerifying2FA,
    loginError: authHook.loginError,
    verify2FAError: authHook.verify2FAError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 