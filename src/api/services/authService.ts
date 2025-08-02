import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { LoginRequest, LoginResponse, LoginResponse2FA, Verify2FARequest, RefreshTokenResponse, User, ApiResponse } from '../types';

export class AuthService {
  // Get device information
  private static getDeviceData() {
    const userAgent = navigator.userAgent;
    let deviceType = 'desktop';
    let os = 'Unknown';
    let browser = 'Unknown';

    // Detect device type
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      deviceType = 'mobile';
    } else if (/Tablet|iPad/i.test(userAgent)) {
      deviceType = 'tablet';
    }

    // Detect OS
    if (userAgent.includes('Windows')) {
      os = 'Windows';
    } else if (userAgent.includes('Mac')) {
      os = 'macOS';
    } else if (userAgent.includes('Linux')) {
      os = 'Linux';
    } else if (userAgent.includes('Android')) {
      os = 'Android';
    } else if (userAgent.includes('iOS')) {
      os = 'iOS';
    }

    // Detect browser
    if (userAgent.includes('Chrome')) {
      browser = 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
    } else if (userAgent.includes('Safari')) {
      browser = 'Safari';
    } else if (userAgent.includes('Edge')) {
      browser = 'Edge';
    } else if (userAgent.includes('Opera')) {
      browser = 'Opera';
    }

    return {
      deviceType,
      os,
      browser,
    };
  }

  // Get IP address from a public service
  private static async getIPAddress(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'Unknown';
    }
  }

  // Get location from IP address using multiple services for better accuracy
  private static async getLocationFromIP(ip: string): Promise<{ latitude: number; longitude: number }> {
    try {
      const services = [
        `https://ipapi.co/${ip}/json/`,
        `https://ip-api.com/json/${ip}`,
        `https://freegeoip.app/json/${ip}`
      ];

      for (const serviceUrl of services) {
        try {
          const response = await fetch(serviceUrl, { 
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            continue;
          }

          const data = await response.json();
          
          // Handle different response formats
          let lat, lng;
          
          if (data.latitude && data.longitude) {
            lat = parseFloat(data.latitude);
            lng = parseFloat(data.longitude);
          } else if (data.lat && data.lon) {
            lat = parseFloat(data.lat);
            lng = parseFloat(data.lon);
          } else if (data.lat && data.lng) {
            lat = parseFloat(data.lat);
            lng = parseFloat(data.lng);
          }
          
          if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
            return { latitude: lat, longitude: lng };
          }
        } catch (serviceError) {
          continue;
        }
      }
      
      throw new Error('All location services failed');
    } catch (error) {
      return {
        latitude: 20.5937, // India center coordinates as fallback
        longitude: 78.9629,
      };
    }
  }

  // Get geolocation from browser (if user allows)
  private static async getBrowserLocation(): Promise<{ latitude: number; longitude: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          resolve(coords);
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              break;
            case error.POSITION_UNAVAILABLE:
              break;
            case error.TIMEOUT:
              break;
            default:
              break;
          }
          resolve(null);
        },
        {
          enableHighAccuracy: true, // Try to get more accurate location
          timeout: 10000, // 10 seconds timeout
          maximumAge: 300000, // 5 minutes cache
        }
      );
    });
  }

  // Get accurate location using multiple methods
  private static async getAccurateLocation(ipAddress: string): Promise<{ latitude: number; longitude: number }> {
    // Method 1: Try browser geolocation first (most accurate)
    try {
      const browserLocation = await this.getBrowserLocation();
      if (browserLocation) {
        return browserLocation;
      }
    } catch (error) {
      // intentionally left blank
    }
    
    // Method 2: Try IP-based geolocation
    try {
      const ipLocation = await this.getLocationFromIP(ipAddress);
      return ipLocation;
    } catch (error) {
      // intentionally left blank
    }
    
    // Method 3: Fallback to default location
    return {
      latitude: 20.5937,
      longitude: 78.9629,
    };
  }

  // Login user
  static async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse2FA>> {
    try {
      // Get actual device data
      const deviceData = this.getDeviceData();

      // Get IP address
      const ipAddress = await this.getIPAddress();

      // Get location with multiple fallback methods
      let location = await this.getAccurateLocation(ipAddress);

      const loginData = {
        ...credentials,
        deviceData,
        ipAddress,
        location,
      };

      const response = await apiClient.post<LoginResponse2FA>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        loginData
      );

      if (response.success && response.data) {
        // Check if 2FA is required
        if (response.data.requiresOTP) {
          // Store temp token for 2FA verification
          if (response.data.tempToken) {
            localStorage.setItem('tempToken', response.data.tempToken);
          }
        } else {
          // Store tokens in localStorage
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }

      return response;
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

  // Verify 2FA OTP
  static async verify2FA(otpData: Verify2FARequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<LoginResponse>(
        API_CONFIG.ENDPOINTS.AUTH.VERIFY_2FA,
        otpData
      );

      if (response.success && response.data) {
        // Store tokens and user data
        localStorage.setItem('accessToken', response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default AuthService; 