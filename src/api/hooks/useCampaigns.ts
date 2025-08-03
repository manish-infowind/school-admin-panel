import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CampaignService } from '../services/campaignService';
import { 
  Campaign, 
  CampaignListResponse, 
  CreateCampaignRequest, 
  UpdateCampaignRequest, 
  RunCampaignRequest,
  CampaignStats,
  CampaignQueryParams,
  FailedEmail,
  EmailRetryStats,
  DetailedCampaignStats
} from '../types';

// Hook for managing campaigns list
export const useCampaigns = (params?: CampaignQueryParams) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const { toast } = useToast();
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchCampaigns = useCallback(async () => {
    if (isLoadingRef.current) return; // Prevent multiple simultaneous calls
    
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);
      
      const response = await CampaignService.getCampaigns(params);
      
      if (response.success && response.data) {
        setCampaigns(response.data.campaigns);
        setPagination({
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          totalPages: response.data.totalPages,
          hasNextPage: response.data.hasNextPage,
          hasPrevPage: response.data.hasPrevPage,
        });
      } else {
        setError(response.message || 'Failed to fetch campaigns');
      }
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch campaigns';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [params?.page, params?.limit, params?.search, params?.status, params?.type, toast]);

  useEffect(() => {
    fetchCampaigns();
    
    // Cleanup function to abort request when component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchCampaigns]);

  return {
    campaigns,
    loading,
    error,
    pagination,
    refetch: fetchCampaigns,
  };
};

// Hook for campaign statistics
export const useCampaignStats = () => {
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchStats = useCallback(async () => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await CampaignService.getCampaignStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.message || 'Failed to fetch campaign statistics');
      }
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch campaign statistics';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStats();
    
    // Cleanup function to abort request when component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

// Hook for single campaign
export const useCampaign = (id: string) => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchCampaign = useCallback(async () => {
    if (!id) return;
    
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await CampaignService.getCampaign(id);
      
      if (response.success && response.data) {
        setCampaign(response.data);
      } else {
        setError(response.message || 'Failed to fetch campaign');
      }
    } catch (err) {
      // Don't set error if request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch campaign';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchCampaign();
    
    // Cleanup function to abort request when component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchCampaign]);

  return {
    campaign,
    loading,
    error,
    refetch: fetchCampaign,
  };
};

// Hook for failed emails
export const useFailedEmails = (campaignId: string) => {
  const [failedEmails, setFailedEmails] = useState<FailedEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFailedEmails = useCallback(async () => {
    if (!campaignId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await CampaignService.getFailedEmails(campaignId);
      
      if (response.success && response.data) {
        setFailedEmails(response.data);
      } else {
        setError(response.message || 'Failed to fetch failed emails');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch failed emails';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [campaignId, toast]);

  const retryFailedEmails = useCallback(async () => {
    if (!campaignId) return;
    
    try {
      setLoading(true);
      
      const response = await CampaignService.retryFailedEmails(campaignId);
      
      if (response.success && response.data) {
        toast({
          title: "Success",
          description: `${response.data.retriedCount} failed emails have been queued for retry`,
        });
        // Refresh the failed emails list
        await fetchFailedEmails();
        return response.data.retriedCount;
      } else {
        throw new Error(response.message || 'Failed to retry emails');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to retry emails';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [campaignId, toast, fetchFailedEmails]);

  return {
    failedEmails,
    loading,
    error,
    fetchFailedEmails,
    retryFailedEmails,
  };
};

// Hook for detailed campaign statistics
export const useDetailedCampaignStats = (campaignId: string) => {
  const [stats, setStats] = useState<DetailedCampaignStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDetailedStats = useCallback(async () => {
    if (!campaignId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await CampaignService.getDetailedCampaignStats(campaignId);
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.message || 'Failed to fetch detailed stats');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch detailed stats';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [campaignId, toast]);

  return {
    stats,
    loading,
    error,
    fetchDetailedStats,
  };
};

// Hook for email retry system
export const useEmailRetrySystem = () => {
  const [retryStats, setRetryStats] = useState<EmailRetryStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRetryStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await CampaignService.getEmailRetryStats();
      
      if (response.success && response.data) {
        setRetryStats(response.data);
      } else {
        setError(response.message || 'Failed to fetch retry stats');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch retry stats';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const triggerRetry = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await CampaignService.triggerEmailRetry();
      
      if (response.success && response.data) {
        toast({
          title: "Success",
          description: `Retry process triggered. ${response.data.processedCount} emails processed.`,
        });
        // Refresh retry stats
        await fetchRetryStats();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to trigger retry');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to trigger retry';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast, fetchRetryStats]);

  return {
    retryStats,
    loading,
    error,
    fetchRetryStats,
    triggerRetry,
  };
};

// Hook for campaign mutations
export const useCampaignMutations = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createCampaign = useCallback(async (data: CreateCampaignRequest) => {
    try {
      setLoading(true);
      
      const response = await CampaignService.createCampaign(data);
      
      if (response.success && response.data) {
        toast({
          title: "Success",
          description: "Campaign created successfully",
        });
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create campaign');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create campaign';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateCampaign = useCallback(async (id: string, data: UpdateCampaignRequest) => {
    try {
      setLoading(true);
      
      const response = await CampaignService.updateCampaign(id, data);
      
      if (response.success && response.data) {
        toast({
          title: "Success",
          description: "Campaign updated successfully",
        });
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update campaign');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update campaign';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteCampaign = useCallback(async (id: string) => {
    try {
      setLoading(true);
      
      const response = await CampaignService.deleteCampaign(id);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Campaign deleted successfully",
        });
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete campaign');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete campaign';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const runCampaign = useCallback(async (id: string, data?: RunCampaignRequest) => {
    try {
      setLoading(true);
      
      const response = await CampaignService.runCampaign(id, data);
      
      if (response.success && response.data) {
        toast({
          title: "Success",
          description: "Campaign started successfully",
        });
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to run campaign');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to run campaign';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const cancelCampaign = useCallback(async (id: string) => {
    try {
      setLoading(true);
      
      const response = await CampaignService.cancelCampaign(id);
      
      if (response.success && response.data) {
        toast({
          title: "Success",
          description: "Campaign cancelled successfully",
        });
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to cancel campaign');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel campaign';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateCampaignStatus = useCallback(async (id: string, status: Campaign['status']) => {
    try {
      setLoading(true);
      
      const response = await CampaignService.updateCampaignStatus(id, status);
      
      if (response.success && response.data) {
        toast({
          title: "Success",
          description: "Campaign status updated successfully",
        });
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update campaign status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update campaign status';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Scheduler management functions
  const getSchedulerStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await CampaignService.getSchedulerStatus();
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get scheduler status';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const refreshSchedulerCache = useCallback(async () => {
    try {
      setLoading(true);
      const response = await CampaignService.refreshSchedulerCache();
      if (response.success) {
        toast({
          title: "Success",
          description: "Scheduler cache refreshed successfully",
        });
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh scheduler cache';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const checkScheduledCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const response = await CampaignService.checkScheduledCampaigns();
      if (response.success) {
        toast({
          title: "Success",
          description: "Scheduled campaigns check completed",
        });
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check scheduled campaigns';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    runCampaign,
    cancelCampaign,
    updateCampaignStatus,
    getSchedulerStatus,
    refreshSchedulerCache,
    checkScheduledCampaigns,
  };
}; 