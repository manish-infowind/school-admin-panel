import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '../services/authService';
import { LoginRequest, User, Verify2FARequest } from '../types';
import { useNavigate } from 'react-router-dom';

// Query keys for authentication
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Get current user
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: authKeys.user(),
    queryFn: () => AuthService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => {
      console.log('🚀 Login mutation triggered with credentials:', credentials);
      return AuthService.login(credentials);
    },
    onSuccess: (response) => {
      console.log('🎉 Login mutation success:', response);
      if (response.success && response.data) {
        // Check if 2FA is required
        if (response.data.requiresOTP) {
          console.log('🔐 2FA required, not navigating yet');
          // Don't navigate - 2FA verification is needed
          return;
        }
        
        // Update user in cache
        queryClient.setQueryData(authKeys.user(), response.data.user);
        
        // Navigate to admin dashboard after successful login
        console.log('🔄 Navigating to admin dashboard...');
        navigate('/admin', { replace: true });
      }
    },
    onError: (error) => {
      console.error('💥 Login mutation error:', error);
      // Don't navigate on error - let the component handle it
    },
  });

  // Verify 2FA mutation
  const verify2FAMutation = useMutation({
    mutationFn: (otpData: Verify2FARequest) => {
      console.log('🔐 2FA verification triggered with data:', otpData);
      return AuthService.verify2FA(otpData);
    },
    onSuccess: (response) => {
      console.log('🎉 2FA verification success:', response);
      if (response.success && response.data) {
        // Update user in cache
        queryClient.setQueryData(authKeys.user(), response.data.user);
        
        // Navigate to admin dashboard after successful 2FA verification
        console.log('🔄 Navigating to admin dashboard after 2FA...');
        navigate('/admin', { replace: true });
      }
    },
    onError: (error) => {
      console.error('💥 2FA verification error:', error);
      // Don't navigate on error - let the component handle it
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => AuthService.logout(),
    onSuccess: () => {
      // Clear all queries from cache
      queryClient.clear();
      
      // Navigate to login page
      navigate('/login');
    },
    onError: () => {
      // Clear cache even if API call fails
      queryClient.clear();
      navigate('/login');
    },
  });

  // Refresh token mutation
  const refreshTokenMutation = useMutation({
    mutationFn: () => AuthService.refreshToken(),
    onSuccess: (success) => {
      if (!success) {
        // Token refresh failed, logout user
        logoutMutation.mutate();
      }
    },
    onError: () => {
      // Token refresh failed, logout user
      logoutMutation.mutate();
    },
  });

  return {
    // State
    user,
    isAuthenticated: AuthService.isAuthenticated(),
    isLoading: isLoadingUser,
    
    // Actions
    login: loginMutation.mutate,
    verify2FA: verify2FAMutation.mutate,
    logout: logoutMutation.mutate,
    refreshToken: refreshTokenMutation.mutate,
    
    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isVerifying2FA: verify2FAMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isRefreshingToken: refreshTokenMutation.isPending,
    
    // Errors
    loginError: loginMutation.error,
    verify2FAError: verify2FAMutation.error,
    logoutError: logoutMutation.error,
    refreshTokenError: refreshTokenMutation.error,
  };
}; 