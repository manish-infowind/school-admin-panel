import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlansService } from '../services/plansService';
import { CreatePlanRequest, UpdatePlanRequest, PlansQueryParams, AssociateFeaturesRequest } from '../types';
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

  // Get plans list
  const {
    data: plansData,
    isLoading,
    error,
    refetch: refetchPlans,
  } = useQuery({
    queryKey: planKeys.list(params),
    queryFn: () => PlansService.getPlans(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false, // Only refetch if data is stale
    refetchOnReconnect: false, // Prevent refetch on reconnect
  });

  // Get plan statistics
  const {
    data: statsData,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: planKeys.stats(),
    queryFn: () => PlansService.getPlanStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Create plan mutation
  const createPlanMutation = useMutation({
    mutationFn: (data: CreatePlanRequest) => PlansService.createPlan(data),
    onSuccess: async (response) => {
      if (response.success) {
        toast({
          title: "Plan Created",
          description: "New plan has been created successfully.",
        });
        // Use direct refetch to prevent infinite loops
        await refetchPlans();
        await refetchStats();
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
    mutationFn: ({ id, data }: { id: number; data: UpdatePlanRequest }) =>
      PlansService.updatePlan(id, data),
    onSuccess: async (response, variables) => {
      if (response.success) {
        toast({
          title: "Plan Updated",
          description: "Plan details have been updated successfully.",
        });
        // Remove the specific plan detail from cache
        queryClient.removeQueries({ queryKey: planKeys.detail(variables.id) });
        // Use direct refetch to prevent infinite loops
        await refetchPlans();
        await refetchStats();
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
    mutationFn: (id: number) => PlansService.deletePlan(id),
    onSuccess: (response, deletedPlanId) => {
      if (response.success) {
        // Remove the specific plan detail from cache
        queryClient.removeQueries({ queryKey: planKeys.detail(deletedPlanId) });
        
        toast({
          title: "Plan Deleted",
          description: "Plan has been deleted successfully.",
        });
        
        // Schedule refetch with a longer delay to ensure UI is not blocked
        // Use a microtask to defer to next event loop cycle
        Promise.resolve().then(() => {
          setTimeout(() => {
            refetchPlans().catch(() => {
              // Silently fail to prevent UI freeze
            });
            refetchStats().catch(() => {
              // Silently fail to prevent UI freeze
            });
          }, 300);
        });
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
    onSuccess: async (response) => {
      if (response.success) {
        const isActive = response.data?.isActive;
        toast({
          title: isActive ? "Plan Activated" : "Plan Deactivated",
          description: `Plan has been ${isActive ? 'activated' : 'deactivated'} successfully.`,
        });
        // Use direct refetch to prevent infinite loops
        await refetchPlans();
        await refetchStats();
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
    onSuccess: async (response, variables) => {
      if (response.success) {
        toast({
          title: "Features Associated",
          description: "Features have been associated with the plan successfully.",
        });
        // Remove the specific plan detail from cache
        queryClient.removeQueries({ queryKey: planKeys.detail(variables.id) });
        // Use direct refetch to prevent infinite loops
        await refetchPlans();
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

  return {
    // Data
    plans: plansData?.data?.data || [],
    stats: statsData?.data,
    pagination: plansData?.data?.pagination || { 
      page: 1, 
      limit: 10, 
      total: 0, 
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false
    },

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
