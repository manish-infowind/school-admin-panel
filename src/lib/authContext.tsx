import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth as useAuthHook } from '@/api/hooks/useAuth';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  verify2FA: (data: { otp: string; tempToken: string }) => void; // COMMENTED OUT: No 2FA APIs available yet
  logout: () => void;
  loading: boolean;
  isLoggingIn: boolean;
  isVerifying2FA: boolean; // COMMENTED OUT: No 2FA APIs available yet
  loginError: any;
  verify2FAError: any; // COMMENTED OUT: No 2FA APIs available yet
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
    // Login with email and password only (no device data, IP, or location needed)
    authHook.login({ email, password } as any);
  };

  // Ensure we always have a valid value object
  const value: AuthContextType = {
    user: authHook.user || null,
    isAuthenticated: authHook.isAuthenticated || false,
    login,
    verify2FA: authHook.verify2FA,
    logout: authHook.logout,
    loading: authHook.isLoading || false,
    isLoggingIn: authHook.isLoggingIn || false,
    isVerifying2FA: authHook.isVerifying2FA || false,
    loginError: authHook.loginError || null,
    verify2FAError: authHook.verify2FAError || null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 