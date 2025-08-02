import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { EnquiryService } from '../services/enquiryService';
import { 
  Enquiry, 
  EnquiryListResponse, 
  CreateEnquiryRequest, 
  UpdateEnquiryRequest, 
  ReplyToEnquiryRequest,
  QueryParams,
  EnquiryStats,
  FilterOptions
} from '../types';
import { useToast } from '@/hooks/use-toast';

interface UseEnquiriesOptions extends QueryParams {
  autoFetch?: boolean;
}

interface UseEnquiriesReturn {
  // Data
  enquiries: Enquiry[];
  selectedEnquiry: Enquiry | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats: EnquiryStats | null;
  filterOptions: FilterOptions | null;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isLoadingStats: boolean;
  isLoadingFilters: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  fetchEnquiries: (params?: UseEnquiriesOptions) => Promise<void>;
  getEnquiry: (id: string) => Promise<void>;
  createEnquiry: (data: CreateEnquiryRequest) => Promise<Enquiry | null>;
  updateEnquiry: (id: string, data: UpdateEnquiryRequest) => Promise<boolean>;
  deleteEnquiry: (id: string) => Promise<boolean>;
  updateStatus: (id: string, status: Enquiry['status']) => Promise<boolean>;
  toggleStar: (id: string, isStarred: boolean) => Promise<boolean>;
  updateNotes: (id: string, adminNotes: string) => Promise<boolean>;
  replyToEnquiry: (id: string, data: ReplyToEnquiryRequest) => Promise<boolean>;
  getStats: () => Promise<void>;
  getFilterOptions: () => Promise<void>;
  submitContactForm: (data: CreateEnquiryRequest) => Promise<boolean>;
  
  // State setters
  setSelectedEnquiry: (enquiry: Enquiry | null) => void;
  clearError: () => void;
}

export function useEnquiries(options: UseEnquiriesOptions = {}): UseEnquiriesReturn {
  const { toast } = useToast();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Stats and filter options
  const [stats, setStats] = useState<EnquiryStats | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);

  // Loading states for stats and filters
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);

  // Ref to prevent multiple simultaneous API calls
  const isFetchingRef = useRef(false);

  // Memoize options to prevent unnecessary re-renders
  const memoizedOptions = useMemo(() => options, [
    options.page,
    options.limit,
    options.search,
    options.status,
    options.category,
    options.autoFetch
  ]);

  // Fetch enquiries
  const fetchEnquiries = useCallback(async (params?: UseEnquiriesOptions) => {
    // Prevent multiple simultaneous API calls
    if (isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);
      
      const response = await EnquiryService.getEnquiries({
        page: params?.page || memoizedOptions.page || 1,
        limit: params?.limit || memoizedOptions.limit || 10,
        search: params?.search || memoizedOptions.search,
        status: params?.status || memoizedOptions.status,
        category: params?.category || memoizedOptions.category,
      });
      
      if (response.success && response.data) {
        setEnquiries(response.data.enquiries);
        setPagination({
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages,
          hasNextPage: response.data.hasNextPage,
          hasPrevPage: response.data.hasPrevPage,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch enquiries';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [memoizedOptions, toast]);

  // Get single enquiry
  const getEnquiry = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await EnquiryService.getEnquiry(id);
      
      if (response.success && response.data) {
        setSelectedEnquiry(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch enquiry';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Create enquiry
  const createEnquiry = useCallback(async (data: CreateEnquiryRequest): Promise<Enquiry | null> => {
    try {
      setIsCreating(true);
      setError(null);
      
      const response = await EnquiryService.createEnquiry(data);
      
      if (response.success && response.data) {
        toast({
          title: "Success",
          description: "Enquiry created successfully",
        });
        return response.data;
      }
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create enquiry';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [toast]);

  // Update enquiry
  const updateEnquiry = useCallback(async (id: string, data: UpdateEnquiryRequest): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const response = await EnquiryService.updateEnquiry(id, data);
      
      if (response.success) {
        // Update local state
        setEnquiries(prev => prev.map(enquiry => 
          enquiry.id === id ? { ...enquiry, ...data } : enquiry
        ));
        
        if (selectedEnquiry?.id === id) {
          setSelectedEnquiry(prev => prev ? { ...prev, ...data } : null);
        }
        
        toast({
          title: "Success",
          description: "Enquiry updated successfully",
        });
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update enquiry';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [selectedEnquiry, toast]);

  // Update status
  const updateStatus = useCallback(async (id: string, status: Enquiry['status']): Promise<boolean> => {
    return updateEnquiry(id, { status });
  }, [updateEnquiry]);

  // Toggle star
  const toggleStar = useCallback(async (id: string, isStarred: boolean): Promise<boolean> => {
    return updateEnquiry(id, { isStarred });
  }, [updateEnquiry]);

  // Update notes
  const updateNotes = useCallback(async (id: string, adminNotes: string): Promise<boolean> => {
    return updateEnquiry(id, { adminNotes });
  }, [updateEnquiry]);

  // Reply to enquiry
  const replyToEnquiry = useCallback(async (id: string, data: ReplyToEnquiryRequest): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const response = await EnquiryService.replyToEnquiry(id, data);
      
      if (response.success) {
        // Refresh the specific enquiry to get updated replies
        try {
          const enquiryResponse = await EnquiryService.getEnquiry(id);
          if (enquiryResponse.success && enquiryResponse.data) {
            // Update the enquiry in the list
            setEnquiries(prev => prev.map(enquiry => 
              enquiry.id === id ? enquiryResponse.data : enquiry
            ));
            
            // Update selected enquiry if it's the same one
            if (selectedEnquiry?.id === id) {
              setSelectedEnquiry(enquiryResponse.data);
            }
          }
        } catch (refreshError) {
          // Fallback: just update status if refresh fails
          setEnquiries(prev => prev.map(enquiry => 
            enquiry.id === id 
              ? { ...enquiry, status: 'replied', repliedAt: new Date().toISOString() }
              : enquiry
          ));
          
          if (selectedEnquiry?.id === id) {
            setSelectedEnquiry(prev => prev ? { 
              ...prev, 
              status: 'replied', 
              repliedAt: new Date().toISOString() 
            } : null);
          }
        }
        
        toast({
          title: "Reply Sent",
          description: "Your reply has been sent successfully.",
        });
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reply';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [selectedEnquiry, toast]);

  // Delete enquiry
  const deleteEnquiry = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setError(null);
      
      const response = await EnquiryService.deleteEnquiry(id);
      
      if (response.success) {
        // Remove from local state
        setEnquiries(prev => prev.filter(enquiry => enquiry.id !== id));
        
        if (selectedEnquiry?.id === id) {
          setSelectedEnquiry(null);
        }
        
        toast({
          title: "Success",
          description: "Enquiry deleted successfully",
        });
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete enquiry';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [selectedEnquiry, toast]);

  // Get statistics
  const getStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      setError(null);
      
      const response = await EnquiryService.getEnquiryStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch statistics';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingStats(false);
    }
  }, [toast]);

  // Get filter options
  const getFilterOptions = useCallback(async () => {
    try {
      setIsLoadingFilters(true);
      setError(null);
      
      const response = await EnquiryService.getFilterOptions();
      
      if (response.success && response.data) {
        setFilterOptions(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch filter options';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingFilters(false);
    }
  }, [toast]);

  // Submit contact form
  const submitContactForm = useCallback(async (data: CreateEnquiryRequest): Promise<boolean> => {
    try {
      setIsCreating(true);
      setError(null);
      
      const response = await EnquiryService.submitContactForm(data);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Your message has been sent successfully. We'll get back to you soon!",
        });
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit contact form';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsCreating(false);
    }
  }, [toast]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (memoizedOptions.autoFetch !== false) {
      fetchEnquiries();
    }
  }, [fetchEnquiries, memoizedOptions.autoFetch]);

  return {
    // Data
    enquiries,
    selectedEnquiry,
    pagination,
    stats,
    filterOptions,
    
    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isLoadingStats,
    isLoadingFilters,
    
    // Error state
    error,
    
    // Actions
    fetchEnquiries,
    getEnquiry,
    createEnquiry,
    updateEnquiry,
    deleteEnquiry,
    updateStatus,
    toggleStar,
    updateNotes,
    replyToEnquiry,
    getStats,
    getFilterOptions,
    submitContactForm,
    
    // State setters
    setSelectedEnquiry,
    clearError,
  };
} 