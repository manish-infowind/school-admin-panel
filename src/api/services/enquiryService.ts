import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { 
  ApiResponse, 
  Enquiry, 
  EnquiryListResponse, 
  CreateEnquiryRequest, 
  UpdateEnquiryRequest, 
  ReplyToEnquiryRequest,
  QueryParams,
  EnquiryStats,
  FilterOptions
} from '../types';

export class EnquiryService {
  // Get all enquiries with pagination, search, and filters
  static async getEnquiries(params?: QueryParams): Promise<ApiResponse<EnquiryListResponse>> {
    try {
      const queryParams = new URLSearchParams();
      
      // Pagination
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      // Search and filters
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.category) queryParams.append('category', params.category);
      if (params?.starred !== undefined) queryParams.append('starred', params.starred.toString());
      if (params?.email) queryParams.append('email', params.email);
      if (params?.phone) queryParams.append('phone', params.phone);
      
      // Date range filters
      if (params?.startDate) {
        queryParams.append('startDate', params.startDate);
      }
      if (params?.endDate) {
        queryParams.append('endDate', params.endDate);
      }
      
      // Additional filters
      if (params?.hasReplies !== undefined) queryParams.append('hasReplies', params.hasReplies.toString());
      if (params?.hasAdminNotes !== undefined) queryParams.append('hasAdminNotes', params.hasAdminNotes.toString());
      
      // Sorting
      if (params?.sortBy) {
        queryParams.append('sortBy', params.sortBy);
      }
      if (params?.sortOrder) {
        queryParams.append('sortOrder', params.sortOrder);
      }

      const url = `${API_CONFIG.ENDPOINTS.ENQUIRIES.LIST}?${queryParams.toString()}`;
      
      const response = await apiClient.get<EnquiryListResponse>(url);
      
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch enquiries:', error);
      throw error;
    }
  }

  // Get single enquiry by ID
  static async getEnquiry(enquiryId: string): Promise<ApiResponse<Enquiry>> {
    try {
      const response = await apiClient.get<Enquiry>(
        `${API_CONFIG.ENDPOINTS.ENQUIRIES.UPDATE.replace(':id', enquiryId)}`
      );
      
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch enquiry:', error);
      throw error;
    }
  }

  // Create new enquiry
  static async createEnquiry(data: CreateEnquiryRequest): Promise<ApiResponse<Enquiry>> {
    try {
      const response = await apiClient.post<Enquiry>(
        API_CONFIG.ENDPOINTS.ENQUIRIES.CREATE,
        data
      );
      
      return response;
    } catch (error) {
      console.error('❌ Failed to create enquiry:', error);
      throw error;
    }
  }

  // Update enquiry
  static async updateEnquiry(enquiryId: string, data: UpdateEnquiryRequest): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.put<{ message: string }>(
        `${API_CONFIG.ENDPOINTS.ENQUIRIES.UPDATE.replace(':id', enquiryId)}`,
        data
      );
      
      return response;
    } catch (error) {
      console.error('❌ Failed to update enquiry:', error);
      throw error;
    }
  }

  // Update enquiry status
  static async updateEnquiryStatus(enquiryId: string, status: Enquiry['status']): Promise<ApiResponse<{ message: string }>> {
    return this.updateEnquiry(enquiryId, { status });
  }

  // Star/Unstar enquiry
  static async toggleEnquiryStar(enquiryId: string, isStarred: boolean): Promise<ApiResponse<{ message: string }>> {
    return this.updateEnquiry(enquiryId, { isStarred });
  }

  // Update admin notes
  static async updateAdminNotes(enquiryId: string, adminNotes: string): Promise<ApiResponse<{ message: string }>> {
    return this.updateEnquiry(enquiryId, { adminNotes });
  }

  // Reply to enquiry
  static async replyToEnquiry(enquiryId: string, data: ReplyToEnquiryRequest): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.post<{ message: string }>(
        `${API_CONFIG.ENDPOINTS.ENQUIRIES.REPLY.replace(':id', enquiryId)}`,
        data
      );
      
      return response;
    } catch (error) {
      console.error('❌ Failed to send reply:', error);
      throw error;
    }
  }

  // Delete enquiry
  static async deleteEnquiry(enquiryId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        `${API_CONFIG.ENDPOINTS.ENQUIRIES.DELETE.replace(':id', enquiryId)}`
      );
      
      return response;
    } catch (error) {
      console.error('❌ Failed to delete enquiry:', error);
      throw error;
    }
  }

  // Get enquiry statistics
  static async getEnquiryStats(): Promise<ApiResponse<EnquiryStats>> {
    try {
      const response = await apiClient.get<EnquiryStats>(
        API_CONFIG.ENDPOINTS.ENQUIRIES.STATS
      );
      
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch enquiry statistics:', error);
      throw error;
    }
  }

  // Get filter options
  static async getFilterOptions(): Promise<ApiResponse<FilterOptions>> {
    try {
      const response = await apiClient.get<FilterOptions>(
        API_CONFIG.ENDPOINTS.ENQUIRIES.FILTER_OPTIONS
      );
      
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch filter options:', error);
      throw error;
    }
  }

  // Submit contact form (public endpoint)
  static async submitContactForm(data: CreateEnquiryRequest): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.post<{ message: string }>(
        API_CONFIG.ENDPOINTS.CONTACT.SUBMIT,
        data
      );
      
      return response;
    } catch (error) {
      console.error('❌ Failed to submit contact form:', error);
      throw error;
    }
  }

  // Export enquiries to CSV
  static async exportEnquiries(data: {
    dateFilter: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{
    enquiries: Array<{
      fullName: string;
      email: string;
      phone: string;
      message: string;
      contactDate: string;
    }>;
    totalCount: number;
    exportDate: string;
    filters: {
      dateFilter: string;
    };
  }>> {
    try {
      const response = await apiClient.post<{
        enquiries: Array<{
          fullName: string;
          email: string;
          phone: string;
          message: string;
          contactDate: string;
        }>;
        totalCount: number;
        exportDate: string;
        filters: {
          dateFilter: string;
        };
      }>(
        API_CONFIG.ENDPOINTS.ENQUIRIES.EXPORT,
        data
      );
      
      return response;
    } catch (error) {
      console.error('❌ Failed to export enquiries:', error);
      throw error;
    }
  }
} 