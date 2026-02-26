import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { ApiResponse } from '../types';

// Dashboard data interfaces
export interface UserGrowthData {
  date: string;
  users: number;
  newUsers: number;
}

export interface UserGrowthMetadata {
  totalRecords: number;
  startDate: string;
  endDate: string;
  timeRange: string;
  selectedYears?: number[];
}

export interface UserGrowthResponse {
  userGrowth: UserGrowthData[];
  metadata: UserGrowthMetadata;
}

export interface ActiveUsersData {
  date: string;
  dailyActive: number;
  monthlyActive: number;
}

export interface ActiveUsersMetadata {
  totalRecords: number;
  startDate: string;
  endDate: string;
  timeRange: string;
  selectedYears?: number[];
}

export interface ActiveUsersResponse {
  activeUsers: ActiveUsersData[];
  metadata: ActiveUsersMetadata;
}

export interface UserGrowthSyncResponse {
  date: string;
  synced: boolean;
  externalServiceResponse?: any;
}

export interface AnalyticsRefreshData {
  date: string;
  duration_ms: number;
  userGrowth: {
    date: string;
    newUsers: number;
    totalUsers: number;
    action: 'created' | 'updated';
  };
  activeUsers: {
    date: string;
    dailyActive: number;
    monthlyActive: number;
    action: 'created' | 'updated';
  };
  errors?: Array<{
    type: string;
    message: string;
  }>;
}

export interface AnalyticsRefreshResponse {
  statusCode: number;
  responseCode: string;
  message: string;
  data: AnalyticsRefreshData;
}

// Dashboard stats summary (static, unfiltered)
export interface DashboardStatsSummary {
  totalUsers: number;
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  userGrowthThisMonth: number;  // Percentage (can be negative)
  newUsersThisMonth: number;
  swipeToMatchRate: number;  // Swipe to match rate (percentage)
  lastUpdated: string;  // ISO 8601 date string
}

// Conversion metric data point (matches API documentation)
export interface ConversionDataPoint {
  metric: string;      // e.g., "Jan 2024", "Week 1 (Jan 2024)", "Jan 01, 2024"
  date: string;         // ISO 8601: "2024-01-15T00:00:00.000Z"
  value: number;       // Numeric value for the conversion metric
  percentage: number;  // Percentage share (0-100)
}

// Metadata object for conversion analytics
export interface ConversionMetadata {
  timeRange: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate: string;           // ISO 8601
  endDate: string;             // ISO 8601
  conversionType: 'subscription';
  selectedYears?: number[];     // Only for monthly timeRange
}

// Complete API response for conversion analytics
export interface ConversionAnalyticsResponse {
  conversions: ConversionDataPoint[];
  metadata: ConversionMetadata;
}

export interface AnalyticsData {
  userGrowth: UserGrowthData[];
  activeUsers: ActiveUsersData[];
  conversions: ConversionDataPoint[];
}

export class DashboardService {
  // Get user growth analytics data
  static async getUserGrowth(
    timeRange: 'daily' | 'weekly' | 'monthly' | 'custom',
    options: {
      month?: number;
      year?: number;
      years?: number[];
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<ApiResponse<UserGrowthResponse>> {
    try {
      const params = new URLSearchParams({
        timeRange,
      });

      // Add conditional parameters based on timeRange
      if (timeRange === 'daily' || timeRange === 'weekly') {
        if (options.month !== undefined) {
          params.append('month', options.month.toString());
        }
        if (options.year !== undefined) {
          params.append('year', options.year.toString());
        }
      } else if (timeRange === 'monthly') {
        if (options.years && options.years.length > 0) {
          options.years.forEach(year => {
            params.append('years', year.toString());
          });
        }
      } else if (timeRange === 'custom') {
        if (options.startDate) {
          params.append('startDate', options.startDate.toISOString());
        }
        if (options.endDate) {
          params.append('endDate', options.endDate.toISOString());
        }
      }

      const url = `${API_CONFIG.ENDPOINTS.DASHBOARD.USER_GROWTH}?${params.toString()}`;
      // Use extended timeout for analytics API (2 minutes)
      const response = await apiClient.get<UserGrowthResponse>(url, {
        timeout: API_CONFIG.ANALYTICS_TIMEOUT
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get active users analytics data
  static async getActiveUsers(
    timeRange: 'daily' | 'weekly' | 'monthly' | 'custom',
    options: {
      month?: number;
      year?: number;
      years?: number[];
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<ApiResponse<ActiveUsersResponse>> {
    try {
      const params = new URLSearchParams({
        timeRange,
      });

      // Add conditional parameters based on timeRange
      if (timeRange === 'daily' || timeRange === 'weekly') {
        if (options.month !== undefined) {
          params.append('month', options.month.toString());
        }
        if (options.year !== undefined) {
          params.append('year', options.year.toString());
        }
      } else if (timeRange === 'monthly') {
        if (options.years && options.years.length > 0) {
          options.years.forEach(year => {
            params.append('years', year.toString());
          });
        }
      } else if (timeRange === 'custom') {
        if (options.startDate) {
          params.append('startDate', options.startDate.toISOString());
        }
        if (options.endDate) {
          params.append('endDate', options.endDate.toISOString());
        }
      }

      const url = `${API_CONFIG.ENDPOINTS.DASHBOARD.ACTIVE_USERS}?${params.toString()}`;
      // Use extended timeout for analytics API (2 minutes)
      const response = await apiClient.get<ActiveUsersResponse>(url, {
        timeout: API_CONFIG.ANALYTICS_TIMEOUT
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get conversion analytics data
  static async getConversions(
    timeRange: 'daily' | 'weekly' | 'monthly' | 'custom',
    conversionType: 'subscription',
    options: {
      month?: number;
      year?: number;
      years?: number[];
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<ApiResponse<ConversionAnalyticsResponse>> {
    try {
      const params = new URLSearchParams({
        timeRange,
        conversionType,
      });

      // Add conditional parameters based on timeRange
      if (timeRange === 'daily' || timeRange === 'weekly') {
        if (options.month !== undefined) {
          params.append('month', options.month.toString());
        }
        if (options.year !== undefined) {
          params.append('year', options.year.toString());
        }
      } else if (timeRange === 'monthly') {
        if (options.years && options.years.length > 0) {
          options.years.forEach(year => {
            params.append('years', year.toString());
          });
        }
      } else if (timeRange === 'custom') {
        if (options.startDate) {
          params.append('startDate', options.startDate.toISOString());
        }
        if (options.endDate) {
          params.append('endDate', options.endDate.toISOString());
        }
      }

      const url = `${API_CONFIG.ENDPOINTS.DASHBOARD.CONVERSIONS}?${params.toString()}`;
      // Use extended timeout for analytics API (2 minutes)
      const response = await apiClient.get<ConversionAnalyticsResponse>(url, {
        timeout: API_CONFIG.ANALYTICS_TIMEOUT
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get dashboard stats summary (static, unfiltered)
  static async getDashboardStatsSummary(): Promise<ApiResponse<DashboardStatsSummary>> {
    try {
      const response = await apiClient.get<DashboardStatsSummary>(
        API_CONFIG.ENDPOINTS.DASHBOARD.STATS_SUMMARY
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Sync user growth analytics data from external service
  static async syncUserGrowth(date?: Date): Promise<ApiResponse<UserGrowthSyncResponse>> {
    try {
      let url = API_CONFIG.ENDPOINTS.DASHBOARD.USER_GROWTH_SYNC;

      // Add date parameter if provided
      if (date) {
        const dateStr = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        url += `?date=${dateStr}`;
      }

      // Use extended timeout for sync API (2 minutes)
      const response = await apiClient.get<UserGrowthSyncResponse>(url, {
        timeout: API_CONFIG.ANALYTICS_TIMEOUT
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Refresh analytics data for a specific date or current date
  static async refreshAnalytics(date?: string): Promise<ApiResponse<AnalyticsRefreshData>> {
    try {
      let url = API_CONFIG.ENDPOINTS.DASHBOARD.ANALYTICS_REFRESH;

      // Add date parameter if provided (format: YYYY-MM-DD)
      if (date) {
        url += `?date=${date}`;
      }

      // Use extended timeout for refresh API (2 minutes)
      const response = await apiClient.post<AnalyticsRefreshData>(url, {}, {
        timeout: API_CONFIG.ANALYTICS_TIMEOUT
      });

      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default DashboardService;