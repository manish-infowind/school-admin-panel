import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PrivacyPolicyService } from '../services/privacyPolicyService';
import { UpdatePrivacyPolicyRequest } from '../types';

// Query keys for privacy policy
export const privacyPolicyKeys = {
  all: ['privacyPolicy'] as const,
  details: () => [...privacyPolicyKeys.all, 'details'] as const,
};

export const usePrivacyPolicy = () => {
  const queryClient = useQueryClient();

  // Get privacy policy
  const { data: privacyPolicy, isLoading: isLoadingPrivacyPolicy, refetch: refetchPrivacyPolicy } = useQuery({
    queryKey: privacyPolicyKeys.details(),
    queryFn: () => PrivacyPolicyService.getPrivacyPolicy(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Update privacy policy mutation
  const updatePrivacyPolicyMutation = useMutation({
    mutationFn: (data: UpdatePrivacyPolicyRequest) => PrivacyPolicyService.updatePrivacyPolicy(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Update privacy policy in cache
        queryClient.setQueryData(privacyPolicyKeys.details(), response);
        
        // Invalidate and refetch privacy policy
        queryClient.invalidateQueries({ queryKey: privacyPolicyKeys.details() });
      }
    },
    onError: (error) => {
    },
  });

  return {
    // State
    privacyPolicy: privacyPolicy?.data,
    isLoading: isLoadingPrivacyPolicy,
    
    // Actions
    updatePrivacyPolicy: updatePrivacyPolicyMutation.mutate,
    refetchPrivacyPolicy,
    
    // Mutation states
    isUpdating: updatePrivacyPolicyMutation.isPending,
    
    // Errors
    updateError: updatePrivacyPolicyMutation.error,
  };
}; 