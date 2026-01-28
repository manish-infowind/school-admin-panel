import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { FaceVerificationService } from '../services/faceVerificationService';
import { userKeys } from './useUserManagement';
import {
  FaceVerificationListParams,
  ApprovalData,
  ReverifyData,
  FlaggedUsersParams,
  StatisticsParams,
} from '../types';

export const faceVerificationKeys = {
  all: ['faceVerifications'] as const,
  lists: () => [...faceVerificationKeys.all, 'list'] as const,
  list: (params?: FaceVerificationListParams) => [...faceVerificationKeys.lists(), params] as const,
  pending: (params?: Pick<FaceVerificationListParams, 'page' | 'limit' | 'search'>) =>
    [...faceVerificationKeys.all, 'pending', params] as const,
  details: () => [...faceVerificationKeys.all, 'detail'] as const,
  detail: (id: number) => [...faceVerificationKeys.details(), id] as const,
  flagged: (params?: FlaggedUsersParams) => [...faceVerificationKeys.all, 'flagged', params] as const,
  statistics: (params?: StatisticsParams) => [...faceVerificationKeys.all, 'statistics', params] as const,
  retryHistory: (groupId: number) => [...faceVerificationKeys.all, 'retryHistory', groupId] as const,
};

export const useFaceVerifications = (params?: FaceVerificationListParams) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: verificationsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: faceVerificationKeys.list(params),
    queryFn: () => FaceVerificationService.getAllVerifications(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const verifications = verificationsData?.data?.data || [];
  const pagination = verificationsData?.data?.pagination;

  return {
    verifications,
    pagination,
    isLoading,
    error,
    refetch,
  };
};

export const usePendingVerifications = (
  params?: Pick<FaceVerificationListParams, 'page' | 'limit' | 'search'>
) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: verificationsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: faceVerificationKeys.pending(params),
    queryFn: () => FaceVerificationService.getPendingVerifications(params),
    staleTime: 2 * 60 * 1000, // 2 minutes for pending queue
    gcTime: 5 * 60 * 1000,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  const verifications = verificationsData?.data?.data || [];
  const pagination = verificationsData?.data?.pagination;

  return {
    verifications,
    pagination,
    isLoading,
    error,
    refetch,
  };
};

export const useVerificationDetails = (id: number) => {
  return useQuery({
    queryKey: faceVerificationKeys.detail(id),
    queryFn: () => FaceVerificationService.getVerificationDetails(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useApproveOrRejectVerification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ApprovalData }) =>
      FaceVerificationService.approveOrReject(id, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        toast({
          title: variables.data.isApproved ? 'Verification Approved' : 'Verification Rejected',
          description: `Verification has been ${variables.data.isApproved ? 'approved' : 'rejected'} successfully.`,
        });
        queryClient.invalidateQueries({ queryKey: faceVerificationKeys.lists() });
        queryClient.invalidateQueries({ queryKey: faceVerificationKeys.pending() });
        queryClient.invalidateQueries({ queryKey: faceVerificationKeys.detail(variables.id) });
        queryClient.invalidateQueries({ queryKey: faceVerificationKeys.statistics() });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update verification. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useTriggerReverification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data?: ReverifyData }) =>
      FaceVerificationService.triggerReverification(userId, data),
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: 'Re-verification Triggered',
          description: 'User will need to submit a new verification video.',
        });
        queryClient.invalidateQueries({ queryKey: faceVerificationKeys.flagged() });
        queryClient.invalidateQueries({ queryKey: faceVerificationKeys.lists() });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to trigger re-verification. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useFlaggedUsers = (params?: FlaggedUsersParams) => {
  const {
    data: flaggedUsersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: faceVerificationKeys.flagged(params),
    queryFn: () => FaceVerificationService.getFlaggedUsers(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const flaggedUsers = flaggedUsersData?.data?.data || [];
  const pagination = flaggedUsersData?.data?.pagination;

  return {
    flaggedUsers,
    pagination,
    isLoading,
    error,
    refetch,
  };
};

export const useVerificationStatistics = (params?: StatisticsParams) => {
  const {
    data: statisticsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: faceVerificationKeys.statistics(params),
    queryFn: () => FaceVerificationService.getStatistics(params),
    staleTime: 2 * 60 * 1000, // 2 minutes for statistics
    gcTime: 5 * 60 * 1000,
  });

  const statistics = statisticsData?.data;

  return {
    statistics,
    isLoading,
    error,
    refetch,
  };
};

export const useRetryHistory = (groupId: number | null) => {
  return useQuery({
    queryKey: faceVerificationKeys.retryHistory(groupId || 0),
    queryFn: () => FaceVerificationService.getRetryHistory(groupId!),
    enabled: !!groupId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useManualVerification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: { isVerified: boolean; adminNotes?: string } }) =>
      FaceVerificationService.manualUpdateFaceVerification(userId, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        toast({
          title: variables.data.isVerified ? 'User Verified' : 'User De-verified',
          description: response.data?.message || `User has been ${variables.data.isVerified ? 'verified' : 'de-verified'} successfully.`,
        });
        // Invalidate relevant queries - both face verification and user details
        queryClient.invalidateQueries({ queryKey: faceVerificationKeys.lists() });
        queryClient.invalidateQueries({ queryKey: faceVerificationKeys.details() });
        queryClient.invalidateQueries({ queryKey: faceVerificationKeys.statistics() });
        // Invalidate user details to update isFaceVerified flag
        queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.userId) });
        queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update face verification. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

