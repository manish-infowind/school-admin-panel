import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { UserManagementService } from '../services/userManagementService';
import { UserListParams, UpdateUserRequest, UserListItem, UserDetails } from '../types';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: UserListParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};

export const useUserManagement = (params?: UserListParams) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get users list
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: userKeys.list(params || {}),
    queryFn: () => UserManagementService.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Extract users and pagination from response
  const users: UserListItem[] = usersData?.data?.data || [];
  const pagination = usersData?.data?.pagination;

  // Get user details (accepts UUID string or number)
  // If id is empty string, query is disabled (used when we have user data from navigation state)
  const useUserDetails = (id: string | number) => {
    return useQuery({
      queryKey: userKeys.detail(id),
      queryFn: () => UserManagementService.getUserById(id),
      enabled: !!id && id !== '', // Disable if id is empty string
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    });
  };

  // Update user mutation (accepts UUID string or number)
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: UpdateUserRequest }) =>
      UserManagementService.updateUser(id, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        toast({
          title: "User Updated",
          description: "User information has been updated successfully.",
        });
        // Invalidate and refetch users list and details
        queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update user. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Toggle user pause mutation (accepts UUID string or number)
  const togglePauseMutation = useMutation({
    mutationFn: (id: string | number) => UserManagementService.toggleUserPause(id),
    onSuccess: (response, id) => {
      if (response.success) {
        const isPaused = response.data?.isAccountPaused;
        toast({
          title: isPaused ? "User Paused" : "User Unpaused",
          description: `User has been ${isPaused ? 'paused' : 'unpaused'} successfully.`,
        });
        // Invalidate and refetch users list and details
        queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to toggle user pause status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation (accepts UUID string or number)
  const deleteUserMutation = useMutation({
    mutationFn: ({ id, deletionReason }: { id: string | number; deletionReason?: string }) =>
      UserManagementService.deleteUser(id, deletionReason),
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: "User Deleted",
          description: "User has been deleted successfully.",
          variant: "destructive",
        });
        // Invalidate and refetch users list
        queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Ban user mutation (accepts UUID string or number)
  const banUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: { actionType: string; reasonCode: string; reason?: string; relatedReportId: number; expiresAt?: string } }) =>
      UserManagementService.banUser(id, data),
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: "User Banned",
          description: "User has been banned successfully.",
          variant: "destructive",
        });
        // Invalidate and refetch users list
        queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to ban user. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Unban user mutation (accepts UUID string or number)
  const unbanUserMutation = useMutation({
    mutationFn: (id: string | number) => UserManagementService.unbanUser(id),
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: "User Unbanned",
          description: "User has been unbanned successfully.",
        });
        // Invalidate and refetch users list
        queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to unban user. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Fetch user moderation actions (on-demand, accepts UUID string or number)
  const getUserModerationActions = (id: string | number) => UserManagementService.getUserModerationActions(id);

  return {
    users,
    pagination,
    isLoading,
    error,
    refetch,
    useUserDetails,
    updateUser: updateUserMutation.mutate,
    isUpdating: updateUserMutation.isPending,
    togglePause: togglePauseMutation.mutate,
    isTogglingPause: togglePauseMutation.isPending,
    deleteUser: deleteUserMutation.mutate,
    isDeleting: deleteUserMutation.isPending,
    banUser: banUserMutation.mutate,
    isBanning: banUserMutation.isPending,
    unbanUser: unbanUserMutation.mutate,
    isUnbanning: unbanUserMutation.isPending,
    getUserModerationActions,
  };
};

