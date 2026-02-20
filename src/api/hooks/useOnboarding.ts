import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OnboardingService } from '../services/onboardingService';
import { 
  Stage, 
  Industry, 
  FundingRange, 
  TeamSize,
  CreateReferenceDataRequest,
  UpdateReferenceDataRequest,
  ReferenceDataQueryParams 
} from '../types';
import { useToast } from '@/hooks/use-toast';

// ==================== STAGES HOOKS ====================
export const useStages = (params?: ReferenceDataQueryParams) => {
  return useQuery({
    queryKey: ['stages', params],
    queryFn: () => OnboardingService.getStages(params),
    select: (response) => response.data || [],
  });
};

export const useStage = (id: number | null) => {
  return useQuery({
    queryKey: ['stage', id],
    queryFn: () => OnboardingService.getStageById(id!),
    enabled: !!id,
    select: (response) => response.data,
  });
};

export const useCreateStage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateReferenceDataRequest) => OnboardingService.createStage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stages'] });
      toast({
        title: 'Success',
        description: 'Stage created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create stage',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateStage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateReferenceDataRequest }) =>
      OnboardingService.updateStage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stages'] });
      queryClient.invalidateQueries({ queryKey: ['stage'] });
      toast({
        title: 'Success',
        description: 'Stage updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update stage',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteStage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => OnboardingService.deleteStage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stages'] });
      toast({
        title: 'Success',
        description: 'Stage deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete stage',
        variant: 'destructive',
      });
    },
  });
};

// ==================== INDUSTRIES HOOKS ====================
export const useIndustries = (params?: ReferenceDataQueryParams) => {
  return useQuery({
    queryKey: ['industries', params],
    queryFn: () => OnboardingService.getIndustries(params),
    select: (response) => response.data || [],
  });
};

export const useIndustry = (id: number | null) => {
  return useQuery({
    queryKey: ['industry', id],
    queryFn: () => OnboardingService.getIndustryById(id!),
    enabled: !!id,
    select: (response) => response.data,
  });
};

export const useCreateIndustry = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateReferenceDataRequest) => OnboardingService.createIndustry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['industries'] });
      toast({
        title: 'Success',
        description: 'Industry created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create industry',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateIndustry = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateReferenceDataRequest }) =>
      OnboardingService.updateIndustry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['industries'] });
      queryClient.invalidateQueries({ queryKey: ['industry'] });
      toast({
        title: 'Success',
        description: 'Industry updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update industry',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteIndustry = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => OnboardingService.deleteIndustry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['industries'] });
      toast({
        title: 'Success',
        description: 'Industry deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete industry',
        variant: 'destructive',
      });
    },
  });
};

// ==================== FUNDING RANGES HOOKS ====================
export const useFundingRanges = (params?: ReferenceDataQueryParams) => {
  return useQuery({
    queryKey: ['funding-ranges', params],
    queryFn: () => OnboardingService.getFundingRanges(params),
    select: (response) => response.data || [],
  });
};

export const useFundingRange = (id: number | null) => {
  return useQuery({
    queryKey: ['funding-range', id],
    queryFn: () => OnboardingService.getFundingRangeById(id!),
    enabled: !!id,
    select: (response) => response.data,
  });
};

export const useCreateFundingRange = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateReferenceDataRequest) => OnboardingService.createFundingRange(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funding-ranges'] });
      toast({
        title: 'Success',
        description: 'Funding range created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create funding range',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateFundingRange = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateReferenceDataRequest }) =>
      OnboardingService.updateFundingRange(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funding-ranges'] });
      queryClient.invalidateQueries({ queryKey: ['funding-range'] });
      toast({
        title: 'Success',
        description: 'Funding range updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update funding range',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteFundingRange = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => OnboardingService.deleteFundingRange(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funding-ranges'] });
      toast({
        title: 'Success',
        description: 'Funding range deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete funding range',
        variant: 'destructive',
      });
    },
  });
};

// ==================== TEAM SIZES HOOKS ====================
export const useTeamSizes = (params?: ReferenceDataQueryParams) => {
  return useQuery({
    queryKey: ['team-sizes', params],
    queryFn: () => OnboardingService.getTeamSizes(params),
    select: (response) => response.data || [],
  });
};

export const useTeamSize = (id: number | null) => {
  return useQuery({
    queryKey: ['team-size', id],
    queryFn: () => OnboardingService.getTeamSizeById(id!),
    enabled: !!id,
    select: (response) => response.data,
  });
};

export const useCreateTeamSize = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateReferenceDataRequest) => OnboardingService.createTeamSize(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-sizes'] });
      toast({
        title: 'Success',
        description: 'Team size created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create team size',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateTeamSize = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateReferenceDataRequest }) =>
      OnboardingService.updateTeamSize(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-sizes'] });
      queryClient.invalidateQueries({ queryKey: ['team-size'] });
      toast({
        title: 'Success',
        description: 'Team size updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update team size',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteTeamSize = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => OnboardingService.deleteTeamSize(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-sizes'] });
      toast({
        title: 'Success',
        description: 'Team size deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete team size',
        variant: 'destructive',
      });
    },
  });
};
