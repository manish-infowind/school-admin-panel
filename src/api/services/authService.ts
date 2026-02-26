import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { LoginRequest, LoginResponse, LoginResponse2FA, LoginResponseLegacy, Verify2FARequest, RefreshTokenResponse, User, ApiResponse, UserPermission } from '../types';

export class AuthService {
  // Login user - simplified to only send email and password as per API documentation
  static async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse2FA | LoginResponse>> {
    try {
      // API only requires email and password - no device data, IP, or location needed
      const loginData = {
        email: credentials.email,
        password: credentials.password,
      };

      const response = await apiClient.post<LoginResponse>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        loginData
      );

      if (response.success && response.data) {
        const loginData = response.data;

        // Handle new API response structure
        if (loginData.tokens) {
          // Store tokens in localStorage
          localStorage.setItem('accessToken', loginData.tokens.accessToken);
          localStorage.setItem('refreshToken', loginData.tokens.refreshToken);

          // Ensure permissions and roles are properly formatted
          const permissions: UserPermission[] = Array.isArray(loginData.permissions)
            ? loginData.permissions.map((p: any) => ({
              permissionName: p.permissionName || p.permission_name || p.name || '',
              allowedActions: p.allowedActions || p.allowed_actions || p.actions || null,
            }))
            : [];

          const roles = Array.isArray(loginData.roles)
            ? loginData.roles.map((r: any) => ({
              id: r.id || 0,
              roleName: r.roleName || r.role_name || r.name || '',
              description: r.description || '',
            }))
            : [];

          // Store user data in a format compatible with existing code
          const userData: User = {
            id: loginData.id,
            email: loginData.email,
            username: loginData.email.split('@')[0],
            role: loginData.is_super_admin ? 'super_admin' : 'admin',
            profilePic: '',
            firstName: '',
            lastName: '',
            phone: '',
            location: '',
            isActive: true,
            permissions: permissions, // Properly formatted UserPermission[] objects
            roles: roles, // Properly formatted roles array
            isSuperAdmin: loginData.is_super_admin || false,
          };

          // Store all user data synchronously before any navigation
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('sessionId', loginData.sessionId || '');
          localStorage.setItem('isSuperAdmin', String(userData.isSuperAdmin));

          // Debug: Log stored user data for verification
          console.log('✅ Login successful - User data stored:', {
            id: userData.id,
            email: userData.email,
            isSuperAdmin: userData.isSuperAdmin,
            rolesCount: userData.roles?.length || 0,
            permissionsCount: userData.permissions?.length || 0,
            roles: userData.roles,
            permissions: userData.permissions,
          });

          // Force a small delay to ensure localStorage is written
          // This helps prevent race conditions with context updates
          await new Promise(resolve => setTimeout(resolve, 0));
        } else {
          // Handle legacy response structure (for backward compatibility)
          // TODO: 2FA logic commented out - no APIs available yet
          // const legacyData = loginData as any;
          // if (legacyData.requiresOTP) {
          //   // Store temp token for 2FA verification
          //   if (legacyData.tempToken) {
          //     localStorage.setItem('tempToken', legacyData.tempToken);
          //   }
          // } else if (legacyData.accessToken) {
          //   // Store tokens in localStorage
          //   localStorage.setItem('accessToken', legacyData.accessToken);
          //   localStorage.setItem('refreshToken', legacyData.refreshToken);
          //   localStorage.setItem('user', JSON.stringify(legacyData.user));
          // }

          // Fallback for legacy format without tokens structure
          const legacyData = loginData as any;
          if (legacyData.accessToken) {
            // Store tokens in localStorage
            localStorage.setItem('accessToken', legacyData.accessToken);
            localStorage.setItem('refreshToken', legacyData.refreshToken);
            localStorage.setItem('user', JSON.stringify(legacyData.user));
          }
        }
      }

      return response as ApiResponse<LoginResponse2FA | LoginResponse>;
    } catch (error) {
      throw error;
    }
  }

  // Logout user
  static async logout(): Promise<ApiResponse<any>> {
    try {
      const accessToken = this.getAccessToken();
      if (!accessToken) {
        // Clear local storage only
        this.clearLocalStorage();
        return { success: true, message: 'Logged out successfully' };
      }

      // Call logout endpoint
      const response = await apiClient.post<any>(
        API_CONFIG.ENDPOINTS.AUTH.LOGOUT,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      // Clear local storage regardless of API response
      this.clearLocalStorage();

      return response;
    } catch (error) {
      // Clear local storage even if API call fails
      this.clearLocalStorage();
      throw error;
    }
  }

  // Refresh access token
  static async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();

      if (!refreshToken) {
        return false;
      }

      const response = await apiClient.post<RefreshTokenResponse>(
        API_CONFIG.ENDPOINTS.AUTH.REFRESH,
        { refreshToken }
      );

      if (response.success && response.data) {
        // Update access token in localStorage
        localStorage.setItem('accessToken', response.data.accessToken);

        // Update user data if provided
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // Get current user from localStorage
  static getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  }

  // Get access token
  static getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // Get refresh token
  static getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  // Get temp token for 2FA
  static getTempToken(): string | null {
    return localStorage.getItem('tempToken');
  }

  // Clear all authentication data from localStorage
  static clearLocalStorage(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tempToken');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('isSuperAdmin');
  }

  // Check if token is expired (basic check)
  static isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      // Decode JWT token (basic implementation)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  // Verify 2FA OTP - COMMENTED OUT: No 2FA APIs available yet
  // static async verify2FA(otpData: Verify2FARequest): Promise<ApiResponse<LoginResponseLegacy>> {
  //   try {
  //     const response = await apiClient.post<LoginResponseLegacy>(
  //       API_CONFIG.ENDPOINTS.AUTH.VERIFY_2FA,
  //       otpData
  //     );

  //     if (response.success && response.data) {
  //       // Store tokens and user data (legacy format)
  //       const legacyData = response.data as any;
  //       if (legacyData.accessToken) {
  //         localStorage.setItem('accessToken', legacyData.accessToken);
  //       }
  //       if (legacyData.refreshToken) {
  //         localStorage.setItem('refreshToken', legacyData.refreshToken);
  //       }
  //       if (legacyData.user) {
  //         localStorage.setItem('user', JSON.stringify(legacyData.user));
  //       }
  //     }

  //     return response;
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}

export default AuthService; 