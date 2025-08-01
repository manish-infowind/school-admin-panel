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
      console.warn('Could not fetch IP address:', error);
      return 'Unknown';
    }
  }

  // Get location from IP address using multiple services for better accuracy
  private static async getLocationFromIP(ip: string): Promise<{ latitude: number; longitude: number }> {
    try {
      // Try multiple IP geolocation services for better accuracy
      const services = [
        `https://ipapi.co/${ip}/json/`,
        `https://ip-api.com/json/${ip}`,
        `https://freegeoip.app/json/${ip}`
      ];

      for (const serviceUrl of services) {
        try {
          console.log(`🌍 Trying location service: ${serviceUrl}`);
          const response = await fetch(serviceUrl, { 
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          });
          
          if (!response.ok) {
            console.warn(`Service ${serviceUrl} returned ${response.status}`);
            continue;
          }

          const data = await response.json();
          console.log(`📍 Location data from ${serviceUrl}:`, data);
          
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
            console.log(`✅ Successfully got location: ${lat}, ${lng}`);
            return { latitude: lat, longitude: lng };
          }
        } catch (serviceError) {
          console.warn(`❌ Service ${serviceUrl} failed:`, serviceError);
          continue;
        }
      }
      
      throw new Error('All location services failed');
    } catch (error) {
      console.warn('❌ Could not fetch location from any service:', error);
      // Return a more reasonable fallback location (you can customize this)
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
        console.log('❌ Browser geolocation not supported');
        resolve(null);
        return;
      }

      console.log('📍 Requesting browser geolocation...');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          console.log('✅ Browser geolocation successful:', coords);
          console.log('📍 Accuracy:', position.coords.accuracy, 'meters');
          resolve(coords);
        },
        (error) => {
          console.warn('❌ Browser geolocation failed:', error);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.log('📍 User denied geolocation permission');
              break;
            case error.POSITION_UNAVAILABLE:
              console.log('📍 Location information unavailable');
              break;
            case error.TIMEOUT:
              console.log('📍 Geolocation request timed out');
              break;
            default:
              console.log('📍 Unknown geolocation error');
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
    console.log('🌍 Starting location detection...');
    
    // Method 1: Try browser geolocation first (most accurate)
    try {
      const browserLocation = await this.getBrowserLocation();
      if (browserLocation) {
        console.log('✅ Using browser geolocation (most accurate)');
        return browserLocation;
      }
    } catch (error) {
      console.warn('❌ Browser geolocation failed, trying IP-based location');
    }
    
    // Method 2: Try IP-based geolocation
    try {
      const ipLocation = await this.getLocationFromIP(ipAddress);
      console.log('✅ Using IP-based location');
      return ipLocation;
    } catch (error) {
      console.warn('❌ IP-based location failed');
    }
    
    // Method 3: Fallback to default location
    console.log('⚠️ Using fallback location (India center)');
    return {
      latitude: 20.5937,
      longitude: 78.9629,
    };
  }

  // Login user
  static async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse2FA>> {
    try {
      console.log('🔐 Starting login process...');
      
      // Get actual device data
      const deviceData = this.getDeviceData();
      console.log('📱 Device data:', deviceData);

      // Get IP address
      const ipAddress = await this.getIPAddress();
      console.log('🌐 IP Address:', ipAddress);

      // Get location with multiple fallback methods
      let location = await this.getAccurateLocation(ipAddress);
      console.log('📍 Final location:', location);

      const loginData = {
        ...credentials,
        deviceData,
        ipAddress,
        location,
      };

      console.log('📤 Sending login request to:', API_CONFIG.ENDPOINTS.AUTH.LOGIN);
      console.log('📦 Login payload:', loginData);

      const response = await apiClient.post<LoginResponse2FA>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        loginData
      );

      console.log('📥 Login response:', response);

      if (response.success && response.data) {
        // Check if 2FA is required
        if (response.data.requiresOTP) {
          console.log('✅ Login successful (2FA required)');
          // Store temp token for 2FA verification
          if (response.data.tempToken) {
            localStorage.setItem('tempToken', response.data.tempToken);
          }
        } else {
          console.log('✅ Login successful (no 2FA required)');
          // Store tokens in localStorage
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }

      return response;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  // Logout user
  static async logout(): Promise<ApiResponse<any>> {
    try {
      console.log('🚪 Starting logout process...');
      
      const accessToken = this.getAccessToken();
      if (!accessToken) {
        console.log('⚠️ No access token found, clearing local storage only');
        this.clearLocalStorage();
        return {
          success: true,
          message: 'Logout successful',
          data: {}
        };
      }

      console.log('📤 Sending logout request...');
      const response = await apiClient.post<void>(
        API_CONFIG.ENDPOINTS.AUTH.LOGOUT,
        { accessToken }
      );

      console.log('📥 Logout response:', response);

      // Clear local storage regardless of API response
      this.clearLocalStorage();
      console.log('✅ Local storage cleared');
      
      return response;
    } catch (error) {
      console.error('❌ Logout API failed:', error);
      
      // Clear local storage even if API call fails
      this.clearLocalStorage();
      console.log('✅ Local storage cleared despite API failure');
      
      // Return success response even if API fails
      return {
        success: true,
        message: 'Logout successful',
        data: {}
      };
    }
  }

  // Refresh access token
  static async refreshToken(): Promise<boolean> {
    try {
      console.log('🔄 Starting token refresh...');
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        console.log('❌ No refresh token found');
        return false;
      }

      console.log('📤 Sending refresh token request...');
      const response = await apiClient.post<RefreshTokenResponse>(
        API_CONFIG.ENDPOINTS.AUTH.REFRESH,
        { refreshToken }
      );

      console.log('📥 Refresh token response:', response);

      if (response.success && response.data) {
        // Update access token in localStorage
        localStorage.setItem('accessToken', response.data.accessToken);
        
        // Update user data if provided
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        console.log('✅ Token refresh successful');
        return true;
      }

      console.log('❌ Token refresh failed - no success response');
      return false;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
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
      console.log('🔄 Verifying 2FA OTP...');
      
      const response = await apiClient.post<LoginResponse>(
        API_CONFIG.ENDPOINTS.AUTH.VERIFY_2FA,
        otpData
      );

      console.log('📥 Verify 2FA response:', response);

      if (response.success && response.data) {
        console.log('✅ 2FA verification successful');
        
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
      console.error('💥 Error verifying 2FA:', error);
      throw error;
    }
  }
}

export default AuthService; 