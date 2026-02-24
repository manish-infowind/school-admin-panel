import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlansService } from '../services/plansService';
import { CreatePlanRequest, UpdatePlanRequest, PlansQueryParams, AssociateFeaturesRequest, Plan } from '../types';
import { useToast } from '@/hooks/use-toast';

// Query keys for plans
export const planKeys = {
  all: ['plans'] as const,
  lists: () => [...planKeys.all, 'list'] as const,
  list: (params?: PlansQueryParams) => {
    // Stabilize the query key by creating a consistent object
    const stableParams = params ? {
      page: params.page,
      limit: params.limit,
      search: params.search || undefined,
      isActive: params.isActive || undefined,
    } : {};
    return [...planKeys.lists(), stableParams] as const;
  },
  details: () => [...planKeys.all, 'detail'] as const,
  detail: (id: number) => [...planKeys.details(), id] as const,
  stats: () => [...planKeys.all, 'stats'] as const,
};

export const usePlans = (params?: PlansQueryParams) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  console.log('[usePlans] Hook called with params:', params);

  // Stabilize query key to prevent unnecessary re-renders
  const stableQueryKey = useMemo(() => planKeys.list(params), [
    params?.page,
    params?.limit,
    params?.search,
    params?.isActive,
  ]);

  // Get plans list
  const {
    data: plansData,
    isLoading,
    error,
    refetch: refetchPlans,
  } = useQuery({
    queryKey: stableQueryKey,
    queryFn: () => {
      console.log('[usePlans] Fetching plans with params:', params);
      return PlansService.getPlans(params);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false, // Only refetch if data is stale
    refetchOnReconnect: false, // Prevent refetch on reconnect
    structuralSharing: true, // Use structural sharing to prevent unnecessary re-renders when data hasn't changed
  });

  // Get plan statistics
  const {
    data: statsData,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: planKeys.stats(),
    queryFn: () => {
      console.log('[usePlans] Fetching plan stats');
      return PlansService.getPlanStats();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    structuralSharing: true, // Use structural sharing to prevent unnecessary re-renders when data hasn't changed
  });

  // Create plan mutation
  const createPlanMutation = useMutation({
    mutationFn: (data: CreatePlanRequest) => {
      console.log('[usePlans] Creating plan:', data);
      return PlansService.createPlan(data);
    },
    onSuccess: (response) => {
      console.log('[usePlans] Create plan success:', response);
      if (response.success) {
        toast({
          title: "Plan Created",
          description: "New plan has been created successfully.",
        });
        // Debounce the query invalidation to prevent render loops
        console.log('[usePlans] Scheduling debounced query invalidation after create');
        setTimeout(() => {
          queryClient.invalidateQueries({ 
            queryKey: planKeys.lists(),
            refetchType: 'active'
          });
          queryClient.invalidateQueries({ 
            queryKey: planKeys.stats(),
            refetchType: 'active'
          });
        }, 100);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update plan mutation
  const updatePlanMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePlanRequest }) => {
      console.log('[usePlans] Updating plan:', id, data);
      return PlansService.updatePlan(id, data);
    },
    onSuccess: (response, variables) => {
      console.log('[usePlans] Update plan success:', response, variables);
      if (response.success) {
        toast({
          title: "Plan Updated",
          description: "Plan details have been updated successfully.",
        });
        // Remove the specific plan detail from cache
        queryClient.removeQueries({ queryKey: planKeys.detail(variables.id) });
        // Debounce the query invalidation to prevent render loops
        console.log('[usePlans] Scheduling debounced query invalidation after update');
        setTimeout(() => {
          queryClient.invalidateQueries({ 
            queryKey: planKeys.lists(),
            refetchType: 'active'
          });
          queryClient.invalidateQueries({ 
            queryKey: planKeys.stats(),
            refetchType: 'active'
          });
        }, 100);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: (id: number) => {
      console.log('[usePlans] Deleting plan:', id);
      return PlansService.deletePlan(id);
    },
    onSuccess: (response, deletedPlanId) => {
      console.log('[usePlans] Delete plan success:', response, deletedPlanId);
      if (response.success) {
        // Remove the specific plan detail from cache
        queryClient.removeQueries({ queryKey: planKeys.detail(deletedPlanId) });
        
        toast({
          title: "Plan Deleted",
          description: "Plan has been deleted successfully.",
        });
        
        // For soft delete, don't optimistically update - let server response handle it
        // Use invalidateQueries with refetchType: 'none' to mark as stale, then manually refetch after delay
        // This prevents immediate refetch that causes render loops
        console.log('[usePlans] Marking queries as stale after delete');
        queryClient.invalidateQueries({ 
          queryKey: planKeys.lists(),
          refetchType: 'none' // Mark as stale but don't refetch immediately
        });
        queryClient.invalidateQueries({ 
          queryKey: planKeys.stats(),
          refetchType: 'none'
        });
        
        // Manually refetch after a delay to allow UI to settle
        console.log('[usePlans] Scheduling delayed refetch after delete');
        setTimeout(() => {
          console.log('[usePlans] Executing delayed refetch after delete');
          // Use a single refetch call to prevent multiple updates
          Promise.all([
            queryClient.refetchQueries({ 
              queryKey: planKeys.lists(),
              type: 'active'
            }),
            queryClient.refetchQueries({ 
              queryKey: planKeys.stats(),
              type: 'active'
            })
          ]).catch((error) => {
            console.error('[usePlans] Error refetching after delete:', error);
            // Silently handle errors to prevent UI freeze
          });
        }, 300);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Toggle plan status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (id: number) => PlansService.togglePlanStatus(id),
    onSuccess: (response) => {
      if (response.success) {
        const isActive = response.data?.isActive;
        toast({
          title: isActive ? "Plan Activated" : "Plan Deactivated",
          description: `Plan has been ${isActive ? 'activated' : 'deactivated'} successfully.`,
        });
        // Debounce the query invalidation to prevent render loops
        setTimeout(() => {
          queryClient.invalidateQueries({ 
            queryKey: planKeys.lists(),
            refetchType: 'active'
          });
          queryClient.invalidateQueries({ 
            queryKey: planKeys.stats(),
            refetchType: 'active'
          });
        }, 100);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to toggle plan status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Associate features mutation
  const associateFeaturesMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AssociateFeaturesRequest }) =>
      PlansService.associateFeatures(id, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        toast({
          title: "Features Associated",
          description: "Features have been associated with the plan successfully.",
        });
        // Remove the specific plan detail from cache
        queryClient.removeQueries({ queryKey: planKeys.detail(variables.id) });
        // Debounce the query invalidation to prevent render loops
        setTimeout(() => {
          queryClient.invalidateQueries({ 
            queryKey: planKeys.lists(),
            refetchType: 'active'
          });
        }, 100);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to associate features. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Get single plan
  const usePlan = (id: number) => {
    return useQuery({
      queryKey: planKeys.detail(id),
      queryFn: () => PlansService.getPlan(id),
      enabled: !!id && id > 0, // Only enable if id is valid
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false, // Prevent refetch on window focus
      refetchOnMount: false, // Only refetch if data is stale
    });
  };

  const plans = plansData?.data?.data || [];
  const stats = statsData?.data;
  const pagination = plansData?.data?.pagination || { 
    page: 1, 
    limit: 10, 
    total: 0, 
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  };

  console.log('[usePlans] Returning data - plans count:', plans.length, 'isLoading:', isLoading, 'pagination:', pagination);

  return {
    // Data
    plans,
    stats,
    pagination,

    // Loading states
    isLoading,
    isLoadingStats,
    isCreating: createPlanMutation.isPending,
    isUpdating: updatePlanMutation.isPending,
    isDeleting: deletePlanMutation.isPending,
    isTogglingStatus: toggleStatusMutation.isPending,
    isAssociatingFeatures: associateFeaturesMutation.isPending,

    // Error states
    error: error?.message || null,

    // Actions
    createPlan: createPlanMutation.mutate,
    updatePlan: updatePlanMutation.mutate,
    deletePlan: deletePlanMutation.mutate,
    toggleStatus: toggleStatusMutation.mutate,
    associateFeatures: associateFeaturesMutation.mutate,
    refetch: refetchPlans,
  };
};
