import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FAQService, type FAQ, type CreateFAQRequest, type UpdateFAQRequest, type UpdateFAQStatusRequest } from '../services/faqService';
import { useToast } from '@/hooks/use-toast';

// Query keys for FAQ data
export const faqKeys = {
  all: ['faqs'] as const,
  lists: () => [...faqKeys.all, 'list'] as const,
  list: (params?: { page?: number; limit?: number; search?: string }) => 
    [...faqKeys.lists(), params] as const,
  details: () => [...faqKeys.all, 'detail'] as const,
  detail: (id: string) => [...faqKeys.details(), id] as const,
};

// Get all FAQs
export const useFAQs = (params?: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: faqKeys.list(params),
    queryFn: () => FAQService.getFAQs(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get single FAQ
export const useFAQ = (faqId: string) => {
  return useQuery({
    queryKey: faqKeys.detail(faqId),
    queryFn: () => FAQService.getFAQ(faqId),
    enabled: !!faqId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Create FAQ mutation
export const useCreateFAQ = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateFAQRequest) => FAQService.createFAQ(data),
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: "FAQ created successfully",
        variant: "default",
      });
      
      // Invalidate and refetch FAQs list
      queryClient.invalidateQueries({ queryKey: faqKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Create FAQ error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create FAQ",
        variant: "destructive",
      });
    },
  });
};

// Update FAQ mutation
export const useUpdateFAQ = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ faqId, data }: { faqId: string; data: UpdateFAQRequest }) =>
      FAQService.updateFAQ(faqId, data),
    onSuccess: (response, { faqId }) => {
      toast({
        title: "Success",
        description: "FAQ updated successfully",
        variant: "default",
      });
      
      // Invalidate and refetch specific FAQ and FAQs list
      queryClient.invalidateQueries({ queryKey: faqKeys.detail(faqId) });
      queryClient.invalidateQueries({ queryKey: faqKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Update FAQ error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update FAQ",
        variant: "destructive",
      });
    },
  });
};

// Delete FAQ mutation
export const useDeleteFAQ = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (faqId: string) => FAQService.deleteFAQ(faqId),
    onSuccess: (response, faqId) => {
      toast({
        title: "Success",
        description: "FAQ deleted successfully",
        variant: "default",
      });
      
      // Invalidate and refetch FAQs list
      queryClient.invalidateQueries({ queryKey: faqKeys.lists() });
      
      // Remove the deleted FAQ from cache
      queryClient.removeQueries({ queryKey: faqKeys.detail(faqId) });
    },
    onError: (error: any) => {
      console.error('Delete FAQ error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete FAQ",
        variant: "destructive",
      });
    },
  });
};

// Update FAQ status mutation
export const useUpdateFAQStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ faqId, data }: { faqId: string; data: UpdateFAQStatusRequest }) =>
      FAQService.updateFAQStatus(faqId, data),
    onSuccess: (response, { faqId }) => {
      toast({
        title: "Success",
        description: "FAQ status updated successfully",
        variant: "default",
      });
      
      // Invalidate and refetch specific FAQ and FAQs list
      queryClient.invalidateQueries({ queryKey: faqKeys.detail(faqId) });
      queryClient.invalidateQueries({ queryKey: faqKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Update FAQ status error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update FAQ status",
        variant: "destructive",
      });
    },
  });
}; 