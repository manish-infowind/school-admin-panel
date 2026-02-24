import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { 
  ApiResponse, 
  Feature, 
  CreateFeatureRequest, 
  UpdateFeatureRequest, 
  FeaturesListResponse, 
  FeatureStats,
  FeaturesQueryParams 
} from '../types';

export class FeaturesService {
  // Get all features with pagination and filters
  static async getFeatures(params?: FeaturesQueryParams): Promise<ApiResponse<FeaturesListResponse>> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
          }
        });
      }

      const url = `${API_CONFIG.ENDPOINTS.FEATURES.LIST}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await apiClient.get<FeaturesListResponse>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get feature statistics
  static async getFeatureStats(): Promise<ApiResponse<FeatureStats>> {
    try {
      const response = await apiClient.get<FeatureStats>(
        API_CONFIG.ENDPOINTS.FEATURES.STATS
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get single feature details
  static async getFeature(id: number): Promise<ApiResponse<Feature>> {
    try {
      const url = API_CONFIG.ENDPOINTS.FEATURES.GET.replace(':id', String(id));
      const response = await apiClient.get<Feature>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Create new feature
  static async createFeature(data: CreateFeatureRequest): Promise<ApiResponse<Feature>> {
    try {
      const response = await apiClient.post<Feature>(
        API_CONFIG.ENDPOINTS.FEATURES.CREATE,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update feature
  static async updateFeature(id: number, data: UpdateFeatureRequest): Promise<ApiResponse<Feature>> {
    try {
      const url = API_CONFIG.ENDPOINTS.FEATURES.UPDATE.replace(':id', String(id));
      const response = await apiClient.put<Feature>(url, data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete feature (soft delete)
  static async deleteFeature(id: number): Promise<ApiResponse<void>> {
    try {
      const url = API_CONFIG.ENDPOINTS.FEATURES.DELETE.replace(':id', String(id));
      const response = await apiClient.delete<void>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Toggle feature status
  static async toggleFeatureStatus(id: number): Promise<ApiResponse<{ id: number; isActive: boolean }>> {
    try {
      const url = API_CONFIG.ENDPOINTS.FEATURES.TOGGLE_STATUS.replace(':id', String(id));
      const response = await apiClient.put<{ id: number; isActive: boolean }>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }
}
