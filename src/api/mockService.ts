import { ApiResponse } from './types';
import { API_CONFIG } from './config';
import {
  mockUser,
  mockDashboardData,
  delay,
} from './mockData';

// Check if we should use mock data.
// Default: false (use real backend). Enable by setting VITE_USE_MOCK_DATA=true in `.env`.
const USE_MOCK_DATA = (import.meta.env.VITE_USE_MOCK_DATA ?? 'false') === 'true';

export const shouldUseMockData = (): boolean => {
  return USE_MOCK_DATA;
};

export const getMockResponse = async <T>(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  _params?: any
): Promise<ApiResponse<T> | null> => {
  if (!shouldUseMockData()) {
    return null;
  }

  // Normalize endpoint
  let normalizedEndpoint = endpoint.replace(API_CONFIG.BASE_URL, '').replace(/^\/admin/, '');
  const urlParts = normalizedEndpoint.split('?');
  normalizedEndpoint = urlParts[0];

  // Simulation delay
  await delay(300);

  // Auth endpoints
  if (normalizedEndpoint === API_CONFIG.ENDPOINTS.AUTH.LOGIN) {
    if (method === 'POST') {
      const { email, password } = body || {};
      if (email === 'admin@gmail.com' && password === 'Admin@123') {
        return {
          success: true,
          data: {
            accessToken: 'mock-access-token-' + Date.now(),
            refreshToken: 'mock-refresh-token-' + Date.now(),
            user: {
              id: mockUser.id,
              username: mockUser.username,
              email: mockUser.email,
              role: mockUser.role,
              profilePic: mockUser.profilePic,
              fullName: `${mockUser.firstName} ${mockUser.lastName}`,
              phone: mockUser.phone,
              address: mockUser.location,
            },
            requiresOTP: false,
          } as any,
          message: 'Login successful',
        };
      } else {
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }
    }
  }

  if (normalizedEndpoint === API_CONFIG.ENDPOINTS.AUTH.REFRESH) {
    return {
      success: true,
      data: {
        accessToken: 'mock-access-token-' + Date.now(),
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          role: mockUser.role,
          profilePic: mockUser.profilePic,
          fullName: `${mockUser.firstName} ${mockUser.lastName}`,
          phone: mockUser.phone,
          address: mockUser.location,
        },
      } as any,
    };
  }

  if (normalizedEndpoint === API_CONFIG.ENDPOINTS.AUTH.LOGOUT) {
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  // Admin Profile endpoints
  if (normalizedEndpoint === API_CONFIG.ENDPOINTS.ADMIN_PROFILE.PROFILE) {
    if (method === 'GET') {
      return {
        success: true,
        data: mockUser as any,
      };
    }
    if (method === 'PUT' || method === 'PATCH') {
      return {
        success: true,
        data: { ...mockUser, ...body } as any,
        message: 'Profile updated successfully',
      };
    }
  }

  // Dashboard endpoints
  if (normalizedEndpoint === API_CONFIG.ENDPOINTS.DASHBOARD.MAIN) {
    return {
      success: true,
      data: mockDashboardData as any,
    };
  }

  if (normalizedEndpoint === API_CONFIG.ENDPOINTS.DASHBOARD.STATS) {
    return {
      success: true,
      data: mockDashboardData.stats as any,
    };
  }

  return null;
};
