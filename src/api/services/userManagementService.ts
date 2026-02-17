import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { ApiResponse, UserListItem, UserDetails, UpdateUserRequest, UserListResponse, UserListParams, DeleteUserRequest } from '../types';

export class UserManagementService {
  /**
   * Get all users with pagination and filters
   */
  static async getUsers(params?: UserListParams): Promise<ApiResponse<UserListResponse>> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
          }
        });
      }

      const url = `${API_CONFIG.ENDPOINTS.USERS.LIST}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await apiClient.get<UserListResponse>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user details by ID (accepts UUID string)
   */
  static async getUserById(id: string | number): Promise<ApiResponse<UserDetails>> {
    try {
      const url = API_CONFIG.ENDPOINTS.USERS.DETAILS.replace(':id', String(id));
      const response = await apiClient.get<UserDetails>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user information (accepts UUID string)
   */
  static async updateUser(id: string | number, data: UpdateUserRequest): Promise<ApiResponse<UserDetails>> {
    try {
      const url = API_CONFIG.ENDPOINTS.USERS.UPDATE.replace(':id', String(id));
      const response = await apiClient.put<UserDetails>(url, data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Toggle user pause status (accepts UUID string)
   */
  static async toggleUserPause(id: string | number): Promise<ApiResponse<{ id: string; isPaused: boolean; pausedAt: string | null; updatedAt: string }>> {
    try {
      const url = API_CONFIG.ENDPOINTS.USERS.PAUSE.replace(':id', String(id));
      const response = await apiClient.put<{ id: string; isPaused: boolean; pausedAt: string | null; updatedAt: string }>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user (soft delete) (accepts UUID string)
   */
  static async deleteUser(id: string | number, deletionReason?: string): Promise<ApiResponse<null>> {
    try {
      const url = API_CONFIG.ENDPOINTS.USERS.DELETE.replace(':id', String(id));
      const requestData: DeleteUserRequest = deletionReason ? { deletionReason } : {};
      const response = await apiClient.delete<null>(url, deletionReason ? { body: requestData } : {});
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Ban user (accepts UUID string)
   */
  static async banUser(id: string | number, data: { actionType: string; reasonCode: string; reason?: string; relatedReportId: number; expiresAt?: string }): Promise<ApiResponse<null>> {
    try {
      const url = API_CONFIG.ENDPOINTS.USERS.BAN.replace(':id', String(id));
      const response = await apiClient.put<null>(url, data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user moderation actions (including bans) (accepts UUID string)
   */
  static async getUserModerationActions(id: string | number): Promise<ApiResponse<any>> {
    try {
      const url = API_CONFIG.ENDPOINTS.USERS.MODERATION_ACTIONS.replace(':id', String(id));
      const response = await apiClient.get<any>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Unban user (accepts UUID string)
   */
  static async unbanUser(id: string | number): Promise<ApiResponse<null>> {
    try {
      const url = API_CONFIG.ENDPOINTS.USERS.UNBAN.replace(':id', String(id));
      // Currently the unban endpoint does not require a request body
      const response = await apiClient.put<null>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

