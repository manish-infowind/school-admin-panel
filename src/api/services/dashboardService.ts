import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { ApiResponse } from '../types';

// Dashboard data interfaces
export interface DashboardStats {
  totalPages: number;
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  totalEnquiries: number;
  newEnquiriesThisWeek: number;
  activeUsers: number;
  userGrowthThisMonth: number;
}

export interface ProductStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
}

export interface RecentActivity {
  action: string;
  page: string;
  time: string;
  type: string;
}

export interface RecentProduct {
  _id: string;
  name: string;
  status: string;
  isPublished: boolean;
  updatedAt: string;
}

export interface RecentProducts {
  products: RecentProduct[];
  count: number;
}

export interface SystemHealth {
  database: {
    status: string;
    message: string;
  };
  products: {
    status: string;
    message: string;
    total: number;
    published: number;
  };
  pages: {
    status: string;
    message: string;
    pages: number;
    faqs: number;
  };
  overall: boolean;
}

export interface UserGrowthData {
  date: string;
  users: number;
  newUsers: number;
}

export interface ActiveUsersData {
  date: string;
  dailyActive: number;
  monthlyActive: number;
}

export interface ConversionData {
  metric: string;
  value: number;
  percentage: number;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  uptime: number;
  errorRate: number;
  throughput: number;
}

export interface AnalyticsData {
  userGrowth: UserGrowthData[];
  activeUsers: ActiveUsersData[];
  conversions: ConversionData[];
  performance: PerformanceMetrics;
}

export interface DashboardData {
  stats: DashboardStats;
  productStats: ProductStats;
  recentActivity: RecentActivity[];
  recentProducts: RecentProducts;
  systemHealth: SystemHealth;
  analytics?: AnalyticsData;
}

export class DashboardService {
  // Get complete dashboard data
  static async getDashboard(): Promise<ApiResponse<DashboardData>> {
    try {
      const response = await apiClient.get<DashboardData>(
        API_CONFIG.ENDPOINTS.DASHBOARD.MAIN
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get dashboard stats only
  static async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      const response = await apiClient.get<DashboardStats>(
        API_CONFIG.ENDPOINTS.DASHBOARD.STATS
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get recent activity only
  static async getRecentActivity(): Promise<ApiResponse<RecentActivity[]>> {
    try {
      const response = await apiClient.get<RecentActivity[]>(
        API_CONFIG.ENDPOINTS.DASHBOARD.ACTIVITY
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get analytics data
  static async getAnalytics(
    timeRange: 'daily' | 'weekly' | 'monthly' | 'custom' = 'monthly',
    startDate?: Date,
    endDate?: Date
  ): Promise<ApiResponse<AnalyticsData>> {
    try {
      let url = `${API_CONFIG.ENDPOINTS.DASHBOARD.MAIN}/analytics?range=${timeRange}`;
      
      if (timeRange === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      }
      
      const response = await apiClient.get<AnalyticsData>(url);
      
      return response;
    } catch (error) {
      throw error;
    }
  }
} 