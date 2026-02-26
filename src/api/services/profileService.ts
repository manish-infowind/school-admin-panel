import { API_CONFIG } from '../config';
import { apiClient } from '../client';

export interface UserProfile {
  id?: string;
  firstName?: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phone: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

class ProfileService {
  private baseUrl = API_CONFIG.BASE_URL;

  /**
   * Get user profile
   */
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await apiClient.get(`${this.baseUrl}${API_CONFIG.ENDPOINTS.ADMIN_PROFILE.PROFILE}`);

      if (response && typeof response === 'object') {
        if ('success' in response && 'data' in response) {
          return response as ApiResponse<UserProfile>;
        } else if ('data' in response && response.data) {
          return {
            success: true,
            data: response.data as UserProfile,
            message: 'Profile retrieved successfully'
          };
        } else {
          return {
            success: true,
            data: response as unknown as UserProfile,
            message: 'Profile retrieved successfully'
          };
        }
      }

      return {
        success: false,
        message: 'Invalid response format'
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await apiClient.put(`${this.baseUrl}${API_CONFIG.ENDPOINTS.ADMIN_PROFILE.PROFILE}`, profileData);

      if (response && typeof response === 'object') {
        if ('success' in response && 'data' in response) {
          return response as ApiResponse<UserProfile>;
        } else if ('data' in response && response.data) {
          return {
            success: true,
            data: response.data as UserProfile,
            message: 'Profile updated successfully'
          };
        } else {
          return {
            success: true,
            data: response as unknown as UserProfile,
            message: 'Profile updated successfully'
          };
        }
      }

      return {
        success: false,
        message: 'Invalid response format'
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post(`${this.baseUrl}${API_CONFIG.ENDPOINTS.ADMIN_PROFILE.PROFILE_AVATAR}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response && typeof response === 'object') {
        if ('success' in response && 'data' in response) {
          return response as ApiResponse<{ avatarUrl: string }>;
        } else if ('data' in response && response.data) {
          return {
            success: true,
            data: response.data as { avatarUrl: string },
            message: 'Avatar uploaded successfully'
          };
        } else {
          return {
            success: true,
            data: response as unknown as { avatarUrl: string },
            message: 'Avatar uploaded successfully'
          };
        }
      }

      return {
        success: false,
        message: 'Invalid response format'
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error.response) {
      const { data } = error.response;
      if (data?.message) {
        return new Error(data.message);
      }
      return new Error('An error occurred');
    }
    return new Error('Network error');
  }
}

export const profileService = new ProfileService();