import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { ApiResponse, QueryParams } from '../types';

// Report interfaces
export interface ReportCategory {
  name: string;
  parent?: string;
}

export interface Report {
  id: string;
  category: ReportCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt?: string;
  description?: string;
  reportedBy?: string;
  assignedTo?: string;
  notes?: string;
}

export interface ReportListResponse {
  reports: Report[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreateReportRequest {
  category: {
    name: string;
    parent?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  description?: string;
  reportedBy?: string;
}

export interface UpdateReportRequest {
  category?: {
    name: string;
    parent?: string;
  };
  severity?: 'low' | 'medium' | 'high' | 'critical';
  reason?: string;
  status?: 'new' | 'in-progress' | 'resolved' | 'closed';
  description?: string;
  assignedTo?: string;
  notes?: string;
}

export interface ReportStats {
  total: number;
  byStatus: {
    new: number;
    'in-progress': number;
    resolved: number;
    closed: number;
  };
  bySeverity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  byCategory: Record<string, number>;
}

export interface ReportFilterOptions {
  statuses: string[];
  severities: string[];
  categories: Array<{
    name: string;
    parent?: string;
  }>;
}

export interface ReportQueryParams extends QueryParams {
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  parentCategory?: string;
}

export class ReportService {
  // Get all reports with pagination, search, and filters
  static async getReports(params?: ReportQueryParams): Promise<ApiResponse<ReportListResponse>> {
    try {
      const queryParams = new URLSearchParams();
      
      // Pagination
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      // Search and filters
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.severity) queryParams.append('severity', params.severity);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.parentCategory) queryParams.append('parentCategory', params.parentCategory);
      
      // Date range filters
      if (params?.startDate) {
        queryParams.append('startDate', params.startDate);
      }
      if (params?.endDate) {
        queryParams.append('endDate', params.endDate);
      }
      
      // Sorting
      if (params?.sortBy) {
        queryParams.append('sortBy', params.sortBy);
      }
      if (params?.sortOrder) {
        queryParams.append('sortOrder', params.sortOrder);
      }

      const url = `${API_CONFIG.ENDPOINTS.REPORTS.LIST}?${queryParams.toString()}`;
      
      const response = await apiClient.get<ReportListResponse>(url);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get single report by ID
  static async getReport(reportId: string): Promise<ApiResponse<Report>> {
    try {
      const response = await apiClient.get<Report>(
        API_CONFIG.ENDPOINTS.REPORTS.DETAILS.replace(':id', reportId)
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Create new report
  static async createReport(data: CreateReportRequest): Promise<ApiResponse<Report>> {
    try {
      const response = await apiClient.post<Report>(
        API_CONFIG.ENDPOINTS.REPORTS.CREATE,
        data
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update report
  static async updateReport(reportId: string, data: UpdateReportRequest): Promise<ApiResponse<Report>> {
    try {
      const response = await apiClient.put<Report>(
        API_CONFIG.ENDPOINTS.REPORTS.UPDATE.replace(':id', reportId),
        data
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete report
  static async deleteReport(reportId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        API_CONFIG.ENDPOINTS.REPORTS.DELETE.replace(':id', reportId)
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get report statistics
  static async getReportStats(): Promise<ApiResponse<ReportStats>> {
    try {
      const response = await apiClient.get<ReportStats>(
        API_CONFIG.ENDPOINTS.REPORTS.STATS
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get filter options
  static async getFilterOptions(): Promise<ApiResponse<ReportFilterOptions>> {
    try {
      const response = await apiClient.get<ReportFilterOptions>(
        API_CONFIG.ENDPOINTS.REPORTS.FILTER_OPTIONS
      );
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Export reports
  static async exportReports(params?: ReportQueryParams): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.severity) queryParams.append('severity', params.severity);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      
      const url = `${API_CONFIG.ENDPOINTS.REPORTS.EXPORT}?${queryParams.toString()}`;
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      return await response.blob();
    } catch (error) {
      throw error;
    }
  }
}
