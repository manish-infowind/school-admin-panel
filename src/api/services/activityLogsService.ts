import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { 
  ApiResponse, 
  ActivityLogQueryParams, 
  ActivityLogsResponse, 
  AdminUsersResponse
} from '../types';

export class ActivityLogsService {
  /**
   * Get activity logs with pagination and filters
   */
  static async getActivityLogs(params?: ActivityLogQueryParams): Promise<ApiResponse<ActivityLogsResponse>> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
          }
        });
      }

      const url = `${API_CONFIG.ENDPOINTS.ACTIVITY_LOGS.LIST}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await apiClient.get<ActivityLogsResponse>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all admin users for dropdown
   */
  static async getAdminUsers(): Promise<ApiResponse<AdminUsersResponse>> {
    try {
      const url = API_CONFIG.ENDPOINTS.ACTIVITY_LOGS.USERS;
      const response = await apiClient.get<AdminUsersResponse>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }
}
