import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  User,
  ApiResponse
} from '../types';

export class AuthService {
  /**
   * Login user - Minimized
   */
  static async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<LoginResponse>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        {
          email: credentials.email,
          password: credentials.password,
        }
      );

      if (response.success && response.data) {
        const data = response.data;

        if (data.tokens) {
          localStorage.setItem('accessToken', data.tokens.accessToken);
          localStorage.setItem('refreshToken', data.tokens.refreshToken);

          const userData: User = {
            id: data.id,
            email: data.email,
            username: data.email.split('@')[0],
            role: 'admin', // Default role
            profilePic: '',
            firstName: '',
            lastName: '',
            phone: '',
            location: '',
            isActive: true,
          };

          localStorage.setItem('user', JSON.stringify(userData));
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<ApiResponse<any>> {
    try {
      const accessToken = this.getAccessToken();
      if (accessToken) {
        await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
      }
      this.clearLocalStorage();
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      this.clearLocalStorage();
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return false;

      const response = await apiClient.post<RefreshTokenResponse>(
        API_CONFIG.ENDPOINTS.AUTH.REFRESH,
        { refreshToken }
      );

      if (response.success && response.data) {
        localStorage.setItem('accessToken', response.data.accessToken);
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  static isAuthenticated(): boolean {
    return !!(localStorage.getItem('accessToken') && localStorage.getItem('user'));
  }

  static getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  }

  static getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  static clearLocalStorage(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
}

export default AuthService;