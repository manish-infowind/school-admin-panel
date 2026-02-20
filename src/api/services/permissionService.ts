import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { 
  ApiResponse, 
  CreatePermissionRequest,
  CreatePermissionResponse,
  UpdatePermissionRequest,
  UpdatePermissionResponse,
  PermissionsListResponse,
  AssignPermissionsRequest,
  AssignPermissionsResponse,
  AdminPermissionsResponse
} from '../types';

export class PermissionService {
  // Create a new permission
  static async createPermission(data: CreatePermissionRequest): Promise<ApiResponse<CreatePermissionResponse>> {
    try {
      const response = await apiClient.post<CreatePermissionResponse>(
        API_CONFIG.ENDPOINTS.PERMISSIONS.CREATE,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get all permissions
  static async getAllPermissions(): Promise<ApiResponse<PermissionsListResponse>> {
    try {
      const response = await apiClient.get<PermissionsListResponse>(
        API_CONFIG.ENDPOINTS.PERMISSIONS.LIST
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Assign permissions to an admin
  static async assignPermissions(data: AssignPermissionsRequest): Promise<ApiResponse<AssignPermissionsResponse>> {
    try {
      const response = await apiClient.post<AssignPermissionsResponse>(
        API_CONFIG.ENDPOINTS.PERMISSIONS.ASSIGN,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get permissions for a specific admin
  static async getAdminPermissions(adminId: string): Promise<ApiResponse<AdminPermissionsResponse>> {
    try {
      const url = API_CONFIG.ENDPOINTS.PERMISSIONS.GET_BY_ADMIN.replace(':adminId', adminId);
      const response = await apiClient.get<AdminPermissionsResponse>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update a permission (only allowedActions can be updated, permissionName is immutable)
  static async updatePermission(permissionId: number, data: UpdatePermissionRequest): Promise<ApiResponse<UpdatePermissionResponse>> {
    try {
      const url = API_CONFIG.ENDPOINTS.PERMISSIONS.UPDATE.replace(':permissionId', String(permissionId));
      const response = await apiClient.put<UpdatePermissionResponse>(url, data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete a permission
  static async deletePermission(permissionId: number): Promise<ApiResponse<{ permissionId: number }>> {
    try {
      const url = API_CONFIG.ENDPOINTS.PERMISSIONS.DELETE.replace(':permissionId', String(permissionId));
      const response = await apiClient.delete<{ permissionId: number }>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default PermissionService;
