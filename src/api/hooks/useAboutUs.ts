import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AboutUsService } from '../services/aboutUsService';
import { 
  UpdateAboutUsRequest, 
  UpdateSectionRequest, 
  UpdateTeamMemberRequest 
} from '../types';

// Query keys for About Us
export const aboutUsKeys = {
  all: ['aboutUs'] as const,
  details: () => [...aboutUsKeys.all, 'details'] as const,
  sections: () => [...aboutUsKeys.all, 'sections'] as const,
  section: (id: string) => [...aboutUsKeys.sections(), id] as const,
  teamMembers: () => [...aboutUsKeys.all, 'teamMembers'] as const,
  teamMember: (id: string) => [...aboutUsKeys.teamMembers(), id] as const,
};

export const useAboutUs = () => {
  const queryClient = useQueryClient();

  // Get About Us data
  const { data: aboutUs, isLoading: isLoadingAboutUs, refetch: refetchAboutUs } = useQuery({
    queryKey: aboutUsKeys.details(),
    queryFn: () => AboutUsService.getAboutUs(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Update About Us mutation
  const updateAboutUsMutation = useMutation({
    mutationFn: (data: UpdateAboutUsRequest) => AboutUsService.updateAboutUs(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Update About Us in cache
        queryClient.setQueryData(aboutUsKeys.details(), response);
        
        // Invalidate and refetch About Us
        queryClient.invalidateQueries({ queryKey: aboutUsKeys.details() });
      }
    },
    onError: (error) => {
      // Removed console
    },
  });

  return {
    // State
    aboutUs: aboutUs?.data,
    isLoading: isLoadingAboutUs,
    
    // Actions
    updateAboutUs: updateAboutUsMutation.mutate,
    refetchAboutUs,
    
    // Mutation states
    isUpdating: updateAboutUsMutation.isPending,
    
    // Errors
    updateError: updateAboutUsMutation.error,
  };
};

// Hook for individual sections
export const useSection = (sectionId: string) => {
  const queryClient = useQueryClient();

  // Get section data
  const { data: section, isLoading: isLoadingSection } = useQuery({
    queryKey: aboutUsKeys.section(sectionId),
    queryFn: () => AboutUsService.getSection(sectionId),
    enabled: !!sectionId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Update section mutation
  const updateSectionMutation = useMutation({
    mutationFn: ({ sectionId, data }: { sectionId: string; data: UpdateSectionRequest }) =>
      AboutUsService.updateSection(sectionId, data),
    onSuccess: (response, { sectionId }) => {
      if (response.success) {
        // Update section in cache
        queryClient.setQueryData(aboutUsKeys.section(sectionId), response);
        
        // Invalidate About Us and sections
        queryClient.invalidateQueries({ queryKey: aboutUsKeys.details() });
        queryClient.invalidateQueries({ queryKey: aboutUsKeys.sections() });
      }
    },
    onError: (error) => {
      // Removed console
    },
  });

  // Delete section mutation
  const deleteSectionMutation = useMutation({
    mutationFn: (sectionId: string) => AboutUsService.deleteSection(sectionId),
    onSuccess: (response, sectionId) => {
      if (response.success) {
        // Remove section from cache
        queryClient.removeQueries({ queryKey: aboutUsKeys.section(sectionId) });
        
        // Invalidate About Us and sections
        queryClient.invalidateQueries({ queryKey: aboutUsKeys.details() });
        queryClient.invalidateQueries({ queryKey: aboutUsKeys.sections() });
      }
    },
    onError: (error) => {
      // Removed console
    },
  });

  // Upload section image mutation
  const uploadSectionImageMutation = useMutation({
    mutationFn: ({ sectionId, imageFile }: { sectionId: string; imageFile: File }) =>
      AboutUsService.uploadSectionImage(sectionId, imageFile),
    onSuccess: (response, { sectionId }) => {
      if (response.success) {
        // Invalidate About Us and sections
        queryClient.invalidateQueries({ queryKey: aboutUsKeys.details() });
        queryClient.invalidateQueries({ queryKey: aboutUsKeys.sections() });
        queryClient.invalidateQueries({ queryKey: aboutUsKeys.section(sectionId) });
      }
    },
    onError: (error) => {
      // Removed console
    },
  });

  return {
    // State
    section: section?.data,
    isLoading: isLoadingSection,
    
    // Actions
    updateSection: updateSectionMutation.mutate,
    deleteSection: deleteSectionMutation.mutate,
    uploadSectionImage: uploadSectionImageMutation.mutate,
    
    // Mutation states
    isUpdating: updateSectionMutation.isPending,
    isDeleting: deleteSectionMutation.isPending,
    isUploadingImage: uploadSectionImageMutation.isPending,
    
    // Errors
    updateError: updateSectionMutation.error,
    deleteError: deleteSectionMutation.error,
    uploadError: uploadSectionImageMutation.error,
  };
};

// Hook for creating sections
export const useCreateSection = () => {
  const queryClient = useQueryClient();

  const createSectionMutation = useMutation({
    mutationFn: (data: { 
      title: string; 
      content: string; 
      order: number;
      imageFile?: File;
    }) => {
      if (data.imageFile) {
        const { imageFile, ...sectionData } = data;
        return AboutUsService.createSectionWithImage(sectionData, imageFile);
      } else {
        const { imageFile, ...sectionData } = data;
        return AboutUsService.createSection(sectionData);
      }
    },
    onSuccess: (response) => {
      if (response.success) {
        // Invalidate About Us and sections
        queryClient.invalidateQueries({ queryKey: aboutUsKeys.details() });
        queryClient.invalidateQueries({ queryKey: aboutUsKeys.sections() });
      }
    },
    onError: (error) => {
      // Removed console
    },
  });

  return {
    createSection: createSectionMutation.mutate,
    isCreating: createSectionMutation.isPending,
    createError: createSectionMutation.error,
  };
};

// Hook for creating team members
export const useCreateTeamMember = () => {
  const queryClient = useQueryClient();

  const createTeamMemberMutation = useMutation({
    mutationFn: (data: {
      name: string;
      position: string;
      bio: string;
      email?: string;
      linkedin?: string;
      twitter?: string;
      order: number;
      imageFile?: File;
    }) => {
      if (data.imageFile) {
        const { imageFile, ...memberData } = data;
        return AboutUsService.createTeamMemberWithImage(memberData, imageFile);
      } else {
        const { imageFile, ...memberData } = data;
        return AboutUsService.createTeamMember(memberData);
      }
    },
    onSuccess: (response) => {
      if (response.success) {
        // Invalidate About Us and team members
        queryClient.invalidateQueries({ queryKey: aboutUsKeys.details() });
        queryClient.invalidateQueries({ queryKey: aboutUsKeys.teamMembers() });
      }
    },
    onError: (error) => {
      // Removed console
    },
  });

  return {
    createTeamMember: createTeamMemberMutation.mutate,
    isCreating: createTeamMemberMutation.isPending,
    createError: createTeamMemberMutation.error,
  };
};

// Hook for individual team members
export const useTeamMember = (memberId: string) => {
  const queryClient = useQueryClient();

  // Get team member data
  const { data: teamMember, isLoading: isLoadingTeamMember } = useQuery({
    queryKey: aboutUsKeys.teamMember(memberId),
    queryFn: () => AboutUsService.getTeamMember(memberId),
    enabled: !!memberId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Update team member mutation
  const updateTeamMemberMutation = useMutation({
    mutationFn: ({ memberId, data }: { memberId: string; data: UpdateTeamMemberRequest }) =>
      AboutUsService.updateTeamMember(memberId, data),
    onSuccess: (response, { memberId }) => {
      if (response.success) {
        // Update team member in cache
        queryClient.setQueryData(aboutUsKeys.teamMember(memberId), response);
        
        // Invalidate About Us and team members
        queryClient.invalidateQueries({ queryKey: aboutUsKeys.details() });
        queryClient.invalidateQueries({ queryKey: aboutUsKeys.teamMembers() });
      }
    },
    onError: (error) => {
      // Removed console
    },
  });

  // Delete team member mutation
  const deleteTeamMemberMutation = useMutation({
    mutationFn: (memberId: string) => AboutUsService.deleteTeamMember(memberId),
    onSuccess: (response, memberId) => {
      if (response.success) {
        // Remove team member from cache
        queryClient.removeQueries({ queryKey: aboutUsKeys.teamMember(memberId) });
        
        // Invalidate About Us and team members
        queryClient.invalidateQueries({ queryKey: aboutUsKeys.details() });
        queryClient.invalidateQueries({ queryKey: aboutUsKeys.teamMembers() });
      }
    },
    onError: (error) => {
      // Removed console
    },
  });

  // Upload team member image mutation
  const uploadTeamMemberImageMutation = useMutation({
    mutationFn: ({ memberId, imageFile }: { memberId: string; imageFile: File }) =>
      AboutUsService.uploadTeamMemberImage(memberId, imageFile),
    onSuccess: (response, { memberId }) => {
      if (response.success) {
        // Invalidate About Us and team members
        queryClient.invalidateQueries({ queryKey: aboutUsKeys.details() });
        queryClient.invalidateQueries({ queryKey: aboutUsKeys.teamMembers() });
        queryClient.invalidateQueries({ queryKey: aboutUsKeys.teamMember(memberId) });
      }
    },
    onError: (error) => {
      // Removed console
    },
  });

  return {
    // State
    teamMember: teamMember?.data,
    isLoading: isLoadingTeamMember,
    
    // Actions
    updateTeamMember: updateTeamMemberMutation.mutate,
    deleteTeamMember: deleteTeamMemberMutation.mutate,
    uploadTeamMemberImage: uploadTeamMemberImageMutation.mutate,
    
    // Mutation states
    isUpdating: updateTeamMemberMutation.isPending,
    isDeleting: deleteTeamMemberMutation.isPending,
    isUploadingImage: uploadTeamMemberImageMutation.isPending,
    
    // Errors
    updateError: updateTeamMemberMutation.error,
    deleteError: deleteTeamMemberMutation.error,
    uploadError: uploadTeamMemberImageMutation.error,
  };
}; 