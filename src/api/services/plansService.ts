import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { 
  ApiResponse, 
  Plan, 
  CreatePlanRequest, 
  UpdatePlanRequest, 
  PlansListResponse, 
  PlanStats,
  PlansQueryParams,
  AssociateFeaturesRequest,
  PlanFeature
} from '../types';

export class PlansService {
  // Get all plans with pagination and filters
  static async getPlans(params?: PlansQueryParams): Promise<ApiResponse<PlansListResponse>> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
          }
        });
      }

      const url = `${API_CONFIG.ENDPOINTS.PLANS.LIST}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await apiClient.get<PlansListResponse>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get plan statistics
  static async getPlanStats(): Promise<ApiResponse<PlanStats>> {
    try {
      const response = await apiClient.get<PlanStats>(
        API_CONFIG.ENDPOINTS.PLANS.STATS
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get single plan details
  static async getPlan(id: number): Promise<ApiResponse<Plan>> {
    try {
      const url = API_CONFIG.ENDPOINTS.PLANS.GET.replace(':id', String(id));
      const response = await apiClient.get<Plan>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Create new plan
  static async createPlan(data: CreatePlanRequest): Promise<ApiResponse<Plan>> {
    try {
      const response = await apiClient.post<Plan>(
        API_CONFIG.ENDPOINTS.PLANS.CREATE,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update plan
  static async updatePlan(id: number, data: UpdatePlanRequest): Promise<ApiResponse<Plan>> {
    try {
      const url = API_CONFIG.ENDPOINTS.PLANS.UPDATE.replace(':id', String(id));
      const response = await apiClient.put<Plan>(url, data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete plan (soft delete)
  static async deletePlan(id: number): Promise<ApiResponse<void>> {
    try {
      const url = API_CONFIG.ENDPOINTS.PLANS.DELETE.replace(':id', String(id));
      const response = await apiClient.delete<void>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Toggle plan status
  static async togglePlanStatus(id: number): Promise<ApiResponse<{ id: number; isActive: boolean }>> {
    try {
      const url = API_CONFIG.ENDPOINTS.PLANS.TOGGLE_STATUS.replace(':id', String(id));
      const response = await apiClient.put<{ id: number; isActive: boolean }>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Associate features with plan
  static async associateFeatures(id: number, data: AssociateFeaturesRequest): Promise<ApiResponse<{ planId: number; features: PlanFeature[] }>> {
    try {
      const url = API_CONFIG.ENDPOINTS.PLANS.ASSOCIATE_FEATURES.replace(':id', String(id));
      const response = await apiClient.put<{ planId: number; features: PlanFeature[] }>(url, data);
      return response;
    } catch (error) {
      throw error;
    }
  }
}
