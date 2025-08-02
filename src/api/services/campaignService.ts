import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { 
  ApiResponse, 
  Campaign, 
  CampaignListResponse, 
  CreateCampaignRequest, 
  UpdateCampaignRequest, 
  RunCampaignRequest,
  CampaignStats,
  CampaignQueryParams
} from '../types';

export class CampaignService {
  // Get all campaigns with pagination, search, and filters
  static async getCampaigns(params?: CampaignQueryParams): Promise<ApiResponse<CampaignListResponse>> {
    try {
      const queryParams = new URLSearchParams();
      
      // Pagination
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      // Search and filters
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.type) queryParams.append('type', params.type);
      
      // Date range filters
      if (params?.startDate) {
        queryParams.append('startDate', params.startDate);
      }
      if (params?.endDate) {
        queryParams.append('endDate', params.endDate);
      }
      
      // Sorting
      if (params?.sortBy) {
        queryParams.append('sortBy', params.sortBy);
      }
      if (params?.sortOrder) {
        queryParams.append('sortOrder', params.sortOrder);
      }

      const url = `${API_CONFIG.ENDPOINTS.CAMPAIGNS.LIST}?${queryParams.toString()}`;
      
      const response = await apiClient.get<CampaignListResponse>(url);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get campaign statistics
  static async getCampaignStats(): Promise<ApiResponse<CampaignStats>> {
    try {
      const response = await apiClient.get<CampaignStats>(API_CONFIG.ENDPOINTS.CAMPAIGNS.STATS);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get single campaign by ID
  static async getCampaign(id: string): Promise<ApiResponse<Campaign>> {
    try {
      const url = API_CONFIG.ENDPOINTS.CAMPAIGNS.DETAILS.replace(':id', id);
      const response = await apiClient.get<Campaign>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Create new campaign
  static async createCampaign(data: CreateCampaignRequest): Promise<ApiResponse<Campaign>> {
    try {
      // Debug: Log the API call
      console.log('CampaignService: Creating campaign with data:', data);
      console.log('CampaignService: Endpoint:', API_CONFIG.ENDPOINTS.CAMPAIGNS.CREATE);
      
      const response = await apiClient.post<Campaign>(API_CONFIG.ENDPOINTS.CAMPAIGNS.CREATE, data);
      
      // Debug: Log the response
      console.log('CampaignService: Response:', response);
      
      return response;
    } catch (error) {
      // Debug: Log any errors
      console.error('CampaignService: Error creating campaign:', error);
      throw error;
    }
  }

  // Update campaign
  static async updateCampaign(id: string, data: UpdateCampaignRequest): Promise<ApiResponse<Campaign>> {
    try {
      const url = API_CONFIG.ENDPOINTS.CAMPAIGNS.UPDATE.replace(':id', id);
      const response = await apiClient.put<Campaign>(url, data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete campaign
  static async deleteCampaign(id: string): Promise<ApiResponse<void>> {
    try {
      const url = API_CONFIG.ENDPOINTS.CAMPAIGNS.DELETE.replace(':id', id);
      const response = await apiClient.delete<void>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Run campaign immediately
  static async runCampaign(id: string, data?: RunCampaignRequest): Promise<ApiResponse<Campaign>> {
    try {
      const url = API_CONFIG.ENDPOINTS.CAMPAIGNS.RUN.replace(':id', id);
      const response = await apiClient.post<Campaign>(url, data || {});
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Cancel campaign
  static async cancelCampaign(id: string): Promise<ApiResponse<Campaign>> {
    try {
      const url = API_CONFIG.ENDPOINTS.CAMPAIGNS.CANCEL.replace(':id', id);
      const response = await apiClient.post<Campaign>(url, {});
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update campaign status
  static async updateCampaignStatus(id: string, status: Campaign['status']): Promise<ApiResponse<Campaign>> {
    try {
      const url = API_CONFIG.ENDPOINTS.CAMPAIGNS.STATUS.replace(':id', id);
      const response = await apiClient.patch<Campaign>(url, { status });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get scheduler status
  static async getSchedulerStatus(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.CAMPAIGNS.SCHEDULER_STATUS);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Force refresh scheduler cache
  static async refreshSchedulerCache(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.CAMPAIGNS.SCHEDULER_REFRESH);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Manual check for scheduled campaigns
  static async checkScheduledCampaigns(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.CAMPAIGNS.SCHEDULER_CHECK);
      return response;
    } catch (error) {
      throw error;
    }
  }
} 