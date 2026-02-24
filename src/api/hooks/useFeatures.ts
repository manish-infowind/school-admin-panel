import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FeaturesService } from '../services/featuresService';
import { CreateFeatureRequest, UpdateFeatureRequest, FeaturesQueryParams } from '../types';
import { useToast } from '@/hooks/use-toast';

// Query keys for features
export const featureKeys = {
  all: ['features'] as const,
  lists: () => [...featureKeys.all, 'list'] as const,
  list: (params: FeaturesQueryParams) => [...featureKeys.lists(), params] as const,
  details: () => [...featureKeys.all, 'detail'] as const,
  detail: (id: number) => [...featureKeys.details(), id] as const,
  stats: () => [...featureKeys.all, 'stats'] as const,
};

export const useFeatures = (params?: FeaturesQueryParams) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get features list
  const {
    data: featuresData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: featureKeys.list(params || {}),
    queryFn: () => FeaturesService.getFeatures(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Get feature statistics
  const {
    data: statsData,
    isLoading: isLoadingStats,
  } = useQuery({
    queryKey: featureKeys.stats(),
    queryFn: () => FeaturesService.getFeatureStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Create feature mutation
  const createFeatureMutation = useMutation({
    mutationFn: (data: CreateFeatureRequest) => FeaturesService.createFeature(data),
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: "Feature Created",
          description: "New feature has been created successfully.",
        });
        queryClient.invalidateQueries({ queryKey: featureKeys.lists() });
        queryClient.invalidateQueries({ queryKey: featureKeys.stats() });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create feature. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update feature mutation
  const updateFeatureMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFeatureRequest }) =>
      FeaturesService.updateFeature(id, data),
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: "Feature Updated",
          description: "Feature details have been updated successfully.",
        });
        queryClient.invalidateQueries({ queryKey: featureKeys.lists() });
        queryClient.invalidateQueries({ queryKey: featureKeys.stats() });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update feature. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete feature mutation
  const deleteFeatureMutation = useMutation({
    mutationFn: (id: number) => FeaturesService.deleteFeature(id),
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: "Feature Deleted",
          description: "Feature has been deleted successfully.",
        });
        queryClient.invalidateQueries({ queryKey: featureKeys.lists() });
        queryClient.invalidateQueries({ queryKey: featureKeys.stats() });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete feature. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Toggle feature status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (id: number) => FeaturesService.toggleFeatureStatus(id),
    onSuccess: (response) => {
      if (response.success) {
        const isActive = response.data?.isActive;
        toast({
          title: isActive ? "Feature Activated" : "Feature Deactivated",
          description: `Feature has been ${isActive ? 'activated' : 'deactivated'} successfully.`,
        });
        queryClient.invalidateQueries({ queryKey: featureKeys.lists() });
        queryClient.invalidateQueries({ queryKey: featureKeys.stats() });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to toggle feature status. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Get single feature
  const useFeature = (id: number) => {
    return useQuery({
      queryKey: featureKeys.detail(id),
      queryFn: () => FeaturesService.getFeature(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    });
  };

  return {
    // Data
    features: featuresData?.data?.data || [],
    stats: statsData?.data,
    pagination: featuresData?.data?.pagination || { 
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
    isCreating: createFeatureMutation.isPending,
    isUpdating: updateFeatureMutation.isPending,
    isDeleting: deleteFeatureMutation.isPending,
    isTogglingStatus: toggleStatusMutation.isPending,

    // Error states
    error: error?.message || null,

    // Actions
    createFeature: createFeatureMutation.mutate,
    updateFeature: updateFeatureMutation.mutate,
    deleteFeature: deleteFeatureMutation.mutate,
    toggleStatus: toggleStatusMutation.mutate,
    useFeature,
    refetch,
  };
};
