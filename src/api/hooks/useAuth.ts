import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '../services/authService';
import { LoginRequest, User } from '../types';
import { useNavigate } from 'react-router-dom';

// Query keys for authentication
export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
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

  // Get user profile from API
  const { data: profile, isLoading: isLoadingProfile, refetch: refetchProfile } = useQuery({
    queryKey: authKeys.profile(),
    queryFn: () => AuthService.getProfile(),
    enabled: !!AuthService.isAuthenticated(),
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
        // Update user in cache
        queryClient.setQueryData(authKeys.user(), response.data.user);
        queryClient.setQueryData(authKeys.profile(), response.data.user);
        
        // Invalidate and refetch profile
        queryClient.invalidateQueries({ queryKey: authKeys.profile() });
        
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

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (userData: Partial<User>) => AuthService.updateProfile(userData),
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Update user in cache
        queryClient.setQueryData(authKeys.user(), response.data);
        queryClient.setQueryData(authKeys.profile(), response.data);
        
        // Invalidate and refetch profile
        queryClient.invalidateQueries({ queryKey: authKeys.profile() });
      }
    },
    onError: (error) => {
      console.error('Profile update failed:', error);
    },
  });

  // Refresh token mutation
  const refreshTokenMutation = useMutation({
    mutationFn: () => AuthService.refreshToken(),
    onSuccess: (success) => {
      if (success) {
        // Refetch profile after token refresh
        queryClient.invalidateQueries({ queryKey: authKeys.profile() });
      } else {
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
    user: user || profile?.data,
    isAuthenticated: AuthService.isAuthenticated(),
    isLoading: isLoadingUser || isLoadingProfile,
    
    // Actions
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    refreshToken: refreshTokenMutation.mutate,
    refetchProfile,
    
    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isRefreshingToken: refreshTokenMutation.isPending,
    
    // Errors
    loginError: loginMutation.error,
    logoutError: logoutMutation.error,
    updateProfileError: updateProfileMutation.error,
    refreshTokenError: refreshTokenMutation.error,
  };
}; 