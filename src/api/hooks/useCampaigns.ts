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
  CampaignQueryParams
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

  const fetchCampaigns = useCallback(async () => {
    if (isLoadingRef.current) return; // Prevent multiple simultaneous calls
    
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
        
        // Log success for debugging
        console.log('Campaigns fetched successfully:', response.data);
      } else {
        setError(response.message || 'Failed to fetch campaigns');
      }
    } catch (err) {
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
  }, [params?.page, params?.limit, params?.search, params?.status, params?.type]);

  useEffect(() => {
    fetchCampaigns();
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

  const fetchStats = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchStats();
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

  const fetchCampaign = useCallback(async () => {
    if (!id) return;
    
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
  }, [id]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  return {
    campaign,
    loading,
    error,
    refetch: fetchCampaign,
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