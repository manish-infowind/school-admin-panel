import { API_CONFIG } from '../config';
import { apiClient } from '../client';

export interface UserProfile {
  id?: string;
  firstName?: string;
  lastName: string;
  email: string;
  phone: string;
  location?: string;
  bio?: string;
  avatar: string;
  role: string;
  joinDate: string;
  lastLogin: string;
  lastPasswordChange?: {
    changedAt: string;
    changedAtFormatted: string;
    changedBy: string;
    reason: string;
    timeAgo: string;
  };
  isActive: boolean;
  twoFactorEnabled: boolean;
  permissions: string[];
  preferences?: {
    theme?: string;
    language?: string;
    notifications: {
      email: boolean;
      push?: boolean;
    };
  };
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location?: string;
  bio?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyOtpRequest {
  otp: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirmRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface TwoFactorSetupRequest {
  // No additional data needed for setup
}

export interface TwoFactorEnableRequest {
  otp: string;
}

export interface TwoFactorDisableRequest {
  otp: string;
}

export interface Verify2FARequest {
  otp: string;
  tempToken: string;
}

export interface UserActivity {
  id: string;
  action: string;
  entity: string;
  entityName: string;
  timestamp: string;
  type: string;
  details: string;
}

export interface UpdatePreferencesRequest {
  theme?: string;
  language?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

class ProfileService {
  private baseUrl = API_CONFIG.BASE_URL;

  /**
   * Get user ID from localStorage
   */
  private getUserId(): string | null {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        const userId = userData.id || userData.userId;
        if (userId) {
          console.log('User ID retrieved from localStorage:', userId);
          return userId;
        }
      }
      console.warn('No user ID found in localStorage');
      return null;
    } catch (error) {
      console.error('Error getting user ID from localStorage:', error);
      return null;
    }
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      const userId = this.getUserId();
      const url = userId 
        ? `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.PROFILE}?userId=${userId}`
        : `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.PROFILE}`;
      
      console.log('Fetching profile from:', url);
      const response = await apiClient.get(url);
      console.log('Profile response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response));
      console.log('Response.data:', response.data);
      
      // Handle both wrapped and direct response formats
      if (response && typeof response === 'object') {
        if ('success' in response && 'data' in response) {
          // Wrapped format: { success: true, data: {...} }
          console.log('Detected wrapped format');
          return response as ApiResponse<UserProfile>;
        } else if ('data' in response && response.data) {
          // Direct format: { data: {...} }
          console.log('Detected direct format with data wrapper');
          return {
            success: true,
            data: response.data as UserProfile,
            message: 'Profile retrieved successfully'
          };
        } else {
          // Direct format: { id: "...", firstName: "...", ... }
          console.log('Detected direct format');
          return {
            success: true,
            data: response as unknown as UserProfile,
            message: 'Profile retrieved successfully'
          };
        }
      }
      
      console.log('Invalid response format');
      return {
        success: false,
        message: 'Invalid response format'
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
    try {
      const userId = this.getUserId();
      const url = userId 
        ? `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.PROFILE}?userId=${userId}`
        : `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.PROFILE}`;
      
      console.log('Updating profile at:', url);
      console.log('Profile data:', profileData);
      
      const response = await apiClient.put(url, profileData);
      console.log('Update profile response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response));
      console.log('Response.data:', response.data);
      
      // Handle both wrapped and direct response formats
      if (response && typeof response === 'object') {
        if ('success' in response && 'data' in response) {
          // Wrapped format: { success: true, data: {...} }
          console.log('Detected wrapped format');
          return response as ApiResponse<UserProfile>;
        } else if ('data' in response && response.data) {
          // Direct format: { data: {...} }
          console.log('Detected direct format with data wrapper');
          return {
            success: true,
            data: response.data as UserProfile,
            message: 'Profile updated successfully'
          };
        } else {
          // Direct format: { id: "...", firstName: "...", ... }
          console.log('Detected direct format');
          return {
            success: true,
            data: response as unknown as UserProfile,
            message: 'Profile updated successfully'
          };
        }
      }
      
      console.log('Invalid response format');
      return {
        success: false,
        message: 'Invalid response format'
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(file: File): Promise<ApiResponse<{ avatar: string; avatarUrl: string }>> {
    try {
      const userId = this.getUserId();
      const formData = new FormData();
      formData.append('file', file);
      if (userId) {
        formData.append('userId', userId);
      }

      const url = userId 
        ? `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.PROFILE}/avatar?userId=${userId}`
        : `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.PROFILE}/avatar`;

      console.log('Uploading avatar to:', url);
      console.log('FormData:', formData);

      const response = await apiClient.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Avatar upload response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response));
      console.log('Response.data:', response.data);
      
      // Handle both wrapped and direct response formats
      if (response && typeof response === 'object') {
        if ('success' in response && 'data' in response) {
          // Wrapped format: { success: true, data: {...} }
          console.log('Detected wrapped format for avatar upload');
          return response as ApiResponse<{ avatar: string; avatarUrl: string }>;
        } else if ('data' in response && response.data) {
          // Direct format: { data: {...} }
          console.log('Detected direct format with data wrapper for avatar upload');
          return {
            success: true,
            data: response.data as { avatar: string; avatarUrl: string },
            message: 'Avatar uploaded successfully'
          };
        } else {
          // Direct format: { avatar: "...", avatarUrl: "..." }
          console.log('Detected direct format for avatar upload');
          return {
            success: true,
            data: response as unknown as { avatar: string; avatarUrl: string },
            message: 'Avatar uploaded successfully'
          };
        }
      }
      
      console.log('Invalid response format for avatar upload');
      return {
        success: false,
        message: 'Invalid response format'
      };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Change password (sends OTP)
   */
  async changePassword(passwordData: ChangePasswordRequest): Promise<ApiResponse<void>> {
    try {
      const userId = this.getUserId();
      const url = userId 
        ? `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.PROFILE}/password?userId=${userId}`
        : `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.PROFILE}/password`;
      
      console.log('Changing password at:', url);
      console.log('Password data:', passwordData);
      
      const response = await apiClient.put(url, passwordData);
      console.log('Change password response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response));
      console.log('Response.data:', response.data);
      
      // Handle both wrapped and direct response formats
      if (response && typeof response === 'object') {
        if ('success' in response && 'data' in response) {
          // Wrapped format: { success: true, data: {...} }
          console.log('Detected wrapped format for password change');
          return response as ApiResponse<void>;
        } else if ('data' in response && response.data) {
          // Direct format: { data: {...} }
          console.log('Detected direct format with data wrapper for password change');
          return {
            success: true,
            data: response.data,
            message: 'OTP sent successfully'
          };
        } else {
          // Direct format: { success: true, message: "..." }
          console.log('Detected direct format for password change');
          return {
            success: true,
            data: undefined,
            message: response.message || 'OTP sent successfully'
          };
        }
      }
      
      console.log('Invalid response format for password change');
      return {
        success: false,
        message: 'Invalid response format'
      };
    } catch (error) {
      console.error('Error changing password:', error);
      // Let the ApiClient's error handling work - don't override it
      throw error;
    }
  }

  /**
   * Verify OTP for password change
   */
  async verifyOtp(otpData: VerifyOtpRequest): Promise<ApiResponse<void>> {
    try {
      const userId = this.getUserId();
      const url = userId 
        ? `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.PROFILE}/password/verify-otp?userId=${userId}`
        : `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.PROFILE}/password/verify-otp`;
      
      console.log('Verifying OTP at:', url);
      console.log('OTP data:', otpData);
      
      const response = await apiClient.post(url, otpData);
      console.log('Verify OTP response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response));
      console.log('Response.data:', response.data);
      
      // Handle both wrapped and direct response formats
      if (response && typeof response === 'object') {
        if ('success' in response && 'data' in response) {
          // Wrapped format: { success: true, data: {...} }
          console.log('Detected wrapped format for OTP verification');
          return response as ApiResponse<void>;
        } else if ('data' in response && response.data) {
          // Direct format: { data: {...} }
          console.log('Detected direct format with data wrapper for OTP verification');
          return {
            success: true,
            data: response.data,
            message: 'OTP verified successfully'
          };
        } else {
          // Direct format: { success: true, message: "..." }
          console.log('Detected direct format for OTP verification');
          return {
            success: true,
            data: undefined,
            message: response.message || 'OTP verified successfully'
          };
        }
      }
      
      console.log('Invalid response format for OTP verification');
      return {
        success: false,
        message: 'Invalid response format'
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      // Let the ApiClient's error handling work - don't override it
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(resetData: ResetPasswordRequest): Promise<ApiResponse<void>> {
    try {
      const userId = this.getUserId();
      const url = userId 
        ? `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.PROFILE}/password/reset-request?userId=${userId}`
        : `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.PROFILE}/password/reset-request`;
      
      console.log('Requesting password reset at:', url);
      console.log('Reset data:', resetData);
      
      const response = await apiClient.post(url, resetData);
      console.log('Password reset request response:', response);
      
      // Handle both wrapped and direct response formats
      if (response && typeof response === 'object') {
        if ('success' in response && 'data' in response) {
          return response as ApiResponse<void>;
        } else if ('data' in response && response.data) {
          return {
            success: true,
            data: response.data,
            message: 'Password reset link sent successfully'
          };
        } else {
          return {
            success: true,
            data: undefined,
            message: response.message || 'Password reset link sent successfully'
          };
        }
      }
      
      return {
        success: false,
        message: 'Invalid response format'
      };
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(resetData: ResetPasswordConfirmRequest): Promise<ApiResponse<void>> {
    try {
      const userId = this.getUserId();
      const url = userId 
        ? `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.PROFILE}/password/reset?userId=${userId}`
        : `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.PROFILE}/password/reset`;
      
      console.log('Resetting password at:', url);
      console.log('Reset data:', resetData);
      
      const response = await apiClient.post(url, resetData);
      console.log('Password reset response:', response);
      
      // Handle both wrapped and direct response formats
      if (response && typeof response === 'object') {
        if ('success' in response && 'data' in response) {
          return response as ApiResponse<void>;
        } else if ('data' in response && response.data) {
          return {
            success: true,
            data: response.data,
            message: 'Password reset successfully'
          };
        } else {
          return {
            success: true,
            data: undefined,
            message: response.message || 'Password reset successfully'
          };
        }
      }
      
      return {
        success: false,
        message: 'Invalid response format'
      };
    } catch (error) {
      console.error('Error resetting password:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Setup 2FA (send OTP)
   */
  async setup2FA(): Promise<ApiResponse<void>> {
    try {
      const userId = this.getUserId();
      const url = userId 
        ? `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.PROFILE_2FA_SETUP}?userId=${userId}`
        : `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.PROFILE_2FA_SETUP}`;
      
      console.log('🔄 Setting up 2FA...');
      const response = await apiClient.post<void>(url);
      console.log('📥 Setup 2FA response:', response);
      return response;
    } catch (error) {
      console.error('❌ Error setting up 2FA:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Enable 2FA
   */
  async enable2FA(otpData: TwoFactorEnableRequest): Promise<ApiResponse<void>> {
    try {
      const userId = this.getUserId();
      const url = userId 
        ? `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.PROFILE_2FA_ENABLE}?userId=${userId}`
        : `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.PROFILE_2FA_ENABLE}`;
      
      console.log('🔄 Enabling 2FA with OTP:', otpData);
      const response = await apiClient.post<void>(url, otpData);
      console.log('📥 Enable 2FA response:', response);
      return response;
    } catch (error) {
      console.error('❌ Error enabling 2FA:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Disable 2FA
   */
  async disable2FA(otpData: TwoFactorDisableRequest): Promise<ApiResponse<void>> {
    try {
      const userId = this.getUserId();
      const url = userId 
        ? `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.PROFILE_2FA_DISABLE}?userId=${userId}`
        : `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.PROFILE_2FA_DISABLE}`;
      
      console.log('🔄 Disabling 2FA with OTP:', otpData);
      const response = await apiClient.post<void>(url, otpData);
      console.log('📥 Disable 2FA response:', response);
      return response;
    } catch (error) {
      console.error('❌ Error disabling 2FA:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get user activity
   */
  async getUserActivity(page: number = 1, limit: number = 10): Promise<ApiResponse<UserActivity[]>> {
    try {
      const userId = this.getUserId();
      const url = userId 
        ? `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.PROFILE_ACTIVITY}?userId=${userId}&page=${page}&limit=${limit}`
        : `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.PROFILE_ACTIVITY}?page=${page}&limit=${limit}`;
      
      console.log('🔄 Getting user activity from:', url);
      const response = await apiClient.get(url);
      console.log('📥 User activity response:', response);
      return response;
    } catch (error) {
      console.error('❌ Error getting user activity:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: UpdatePreferencesRequest): Promise<ApiResponse<UserProfile>> {
    try {
      const userId = this.getUserId();
      const url = userId 
        ? `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.PROFILE_PREFERENCES}?userId=${userId}`
        : `${this.baseUrl}${API_CONFIG.ENDPOINTS.USERS.PROFILE_PREFERENCES}`;
      
      console.log('🔄 Updating preferences with data:', preferences);
      const response = await apiClient.put(url, preferences);
      console.log('📥 Update preferences response:', response);
      return response;
    } catch (error) {
      console.error('❌ Error updating preferences:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error.response) {
      const { data, status } = error.response;
      
      // Check for specific error message in the response
      if (data?.message) {
        return new Error(data.message);
      }
      
      if (data?.error) {
        return new Error(data.error.message || 'An error occurred');
      }
      
      switch (status) {
        case 401:
          // For 401 errors, return the specific message from the response
          return new Error(data?.message || 'Unauthorized. Please login again.');
        case 403:
          return new Error('Access denied. You do not have permission to perform this action.');
        case 404:
          return new Error('Profile not found.');
        case 422:
          return new Error('Validation failed. Please check your input.');
        case 500:
          return new Error('Server error. Please try again later.');
        default:
          return new Error('An unexpected error occurred.');
      }
    }
    
    if (error.request) {
      return new Error('Network error. Please check your connection.');
    }
    
    return new Error('An error occurred while processing your request.');
  }
}

export const profileService = new ProfileService(); 