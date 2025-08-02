import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { ApiResponse, AdminUser, CreateAdminRequest, UpdateAdminRequest, ChangePasswordRequest, AdminListResponse, AdminStats, QueryParams } from '../types';

export class AdminManagementService {
  // Get all admins with pagination and filters
  static async getAdmins(params?: QueryParams): Promise<ApiResponse<AdminListResponse>> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
          }
        });
      }

      const url = `${API_CONFIG.ENDPOINTS.ADMIN_MANAGEMENT.LIST}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await apiClient.get<AdminListResponse>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get admin statistics
  static async getAdminStats(): Promise<ApiResponse<AdminStats>> {
    try {
      const response = await apiClient.get<AdminStats>(
        API_CONFIG.ENDPOINTS.ADMIN_MANAGEMENT.STATS
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get single admin details
  static async getAdmin(id: string): Promise<ApiResponse<AdminUser>> {
    try {
      const url = API_CONFIG.ENDPOINTS.ADMIN_MANAGEMENT.DETAILS.replace(':id', id);
      const response = await apiClient.get<AdminUser>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Create new admin
  static async createAdmin(data: CreateAdminRequest): Promise<ApiResponse<AdminUser>> {
    try {
      const response = await apiClient.post<AdminUser>(
        API_CONFIG.ENDPOINTS.ADMIN_MANAGEMENT.CREATE,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update admin
  static async updateAdmin(id: string, data: UpdateAdminRequest): Promise<ApiResponse<AdminUser>> {
    try {
      const url = API_CONFIG.ENDPOINTS.ADMIN_MANAGEMENT.UPDATE.replace(':id', id);
      const response = await apiClient.put<AdminUser>(url, data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete admin
  static async deleteAdmin(id: string): Promise<ApiResponse<void>> {
    try {
      const url = API_CONFIG.ENDPOINTS.ADMIN_MANAGEMENT.DELETE.replace(':id', id);
      const response = await apiClient.delete<void>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Toggle admin status (activate/deactivate)
  static async toggleAdminStatus(id: string): Promise<ApiResponse<AdminUser>> {
    try {
      const url = API_CONFIG.ENDPOINTS.ADMIN_MANAGEMENT.TOGGLE_STATUS.replace(':id', id);
      const response = await apiClient.put<AdminUser>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Change admin password
  static async changeAdminPassword(id: string, data: ChangePasswordRequest): Promise<ApiResponse<void>> {
    try {
      const url = API_CONFIG.ENDPOINTS.ADMIN_MANAGEMENT.CHANGE_PASSWORD.replace(':id', id);
      const response = await apiClient.put<void>(url, data);
      return response;
    } catch (error) {
      throw error;
    }
  }
} 