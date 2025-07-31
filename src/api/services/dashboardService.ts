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

export interface DashboardData {
  stats: DashboardStats;
  productStats: ProductStats;
  recentActivity: RecentActivity[];
  recentProducts: RecentProducts;
  systemHealth: SystemHealth;
}

export class DashboardService {
  // Get complete dashboard data
  static async getDashboard(): Promise<ApiResponse<DashboardData>> {
    try {
      console.log('🔗 DashboardService: Making GET request to get dashboard data');
      console.log('🔗 Endpoint:', API_CONFIG.ENDPOINTS.DASHBOARD.MAIN);
      
      const response = await apiClient.get<DashboardData>(
        API_CONFIG.ENDPOINTS.DASHBOARD.MAIN
      );
      
      console.log('✅ DashboardService: Dashboard data response:', response);
      return response;
    } catch (error) {
      console.error('❌ DashboardService: Get dashboard data error:', error);
      throw error;
    }
  }

  // Get dashboard stats only
  static async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      console.log('🔗 DashboardService: Making GET request to get dashboard stats');
      console.log('🔗 Endpoint:', API_CONFIG.ENDPOINTS.DASHBOARD.STATS);
      
      const response = await apiClient.get<DashboardStats>(
        API_CONFIG.ENDPOINTS.DASHBOARD.STATS
      );
      
      console.log('✅ DashboardService: Dashboard stats response:', response);
      return response;
    } catch (error) {
      console.error('❌ DashboardService: Get dashboard stats error:', error);
      throw error;
    }
  }

  // Get recent activity only
  static async getRecentActivity(): Promise<ApiResponse<RecentActivity[]>> {
    try {
      console.log('🔗 DashboardService: Making GET request to get recent activity');
      console.log('🔗 Endpoint:', API_CONFIG.ENDPOINTS.DASHBOARD.ACTIVITY);
      
      const response = await apiClient.get<RecentActivity[]>(
        API_CONFIG.ENDPOINTS.DASHBOARD.ACTIVITY
      );
      
      console.log('✅ DashboardService: Recent activity response:', response);
      return response;
    } catch (error) {
      console.error('❌ DashboardService: Get recent activity error:', error);
      throw error;
    }
  }
} 