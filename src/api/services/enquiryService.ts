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
      console.log('📋 Fetching enquiries...', params);
      
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
        console.log('📅 Adding startDate to query:', params.startDate);
        queryParams.append('startDate', params.startDate);
      }
      if (params?.endDate) {
        console.log('📅 Adding endDate to query:', params.endDate);
        queryParams.append('endDate', params.endDate);
      }
      
      // Additional filters
      if (params?.hasReplies !== undefined) queryParams.append('hasReplies', params.hasReplies.toString());
      if (params?.hasAdminNotes !== undefined) queryParams.append('hasAdminNotes', params.hasAdminNotes.toString());
      
      // Sorting
      if (params?.sortBy) {
        console.log('🎯 Adding sortBy to query:', params.sortBy);
        queryParams.append('sortBy', params.sortBy);
      }
      if (params?.sortOrder) {
        console.log('🎯 Adding sortOrder to query:', params.sortOrder);
        queryParams.append('sortOrder', params.sortOrder);
      }

      const url = `${API_CONFIG.ENDPOINTS.ENQUIRIES.LIST}?${queryParams.toString()}`;
      
      console.log('🌐 Final API URL:', url);
      console.log('🌐 Query params string:', queryParams.toString());
      const response = await apiClient.get<EnquiryListResponse>(url);
      
      console.log('📥 Enquiries response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch enquiries:', error);
      throw error;
    }
  }

  // Get single enquiry by ID
  static async getEnquiry(enquiryId: string): Promise<ApiResponse<Enquiry>> {
    try {
      console.log('📋 Fetching enquiry:', enquiryId);
      
      const response = await apiClient.get<Enquiry>(
        `${API_CONFIG.ENDPOINTS.ENQUIRIES.UPDATE.replace(':id', enquiryId)}`
      );
      
      console.log('📥 Enquiry response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch enquiry:', error);
      throw error;
    }
  }

  // Create new enquiry
  static async createEnquiry(data: CreateEnquiryRequest): Promise<ApiResponse<Enquiry>> {
    try {
      console.log('📝 Creating enquiry...', data);
      
      const response = await apiClient.post<Enquiry>(
        API_CONFIG.ENDPOINTS.ENQUIRIES.CREATE,
        data
      );
      
      console.log('✅ Enquiry created:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create enquiry:', error);
      throw error;
    }
  }

  // Update enquiry
  static async updateEnquiry(enquiryId: string, data: UpdateEnquiryRequest): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('📝 Updating enquiry:', enquiryId, data);
      
      const response = await apiClient.put<{ message: string }>(
        `${API_CONFIG.ENDPOINTS.ENQUIRIES.UPDATE.replace(':id', enquiryId)}`,
        data
      );
      
      console.log('✅ Enquiry updated:', response);
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
      console.log('📧 Replying to enquiry:', enquiryId, data);
      
      const response = await apiClient.post<{ message: string }>(
        `${API_CONFIG.ENDPOINTS.ENQUIRIES.REPLY.replace(':id', enquiryId)}`,
        data
      );
      
      console.log('✅ Reply sent:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to send reply:', error);
      throw error;
    }
  }

  // Delete enquiry
  static async deleteEnquiry(enquiryId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('🗑️ Deleting enquiry:', enquiryId);
      
      const response = await apiClient.delete<{ message: string }>(
        `${API_CONFIG.ENDPOINTS.ENQUIRIES.DELETE.replace(':id', enquiryId)}`
      );
      
      console.log('✅ Enquiry deleted:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to delete enquiry:', error);
      throw error;
    }
  }

  // Get enquiry statistics
  static async getEnquiryStats(): Promise<ApiResponse<EnquiryStats>> {
    try {
      console.log('📊 Fetching enquiry statistics...');
      
      const response = await apiClient.get<EnquiryStats>(
        API_CONFIG.ENDPOINTS.ENQUIRIES.STATS
      );
      
      console.log('📥 Statistics response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch enquiry statistics:', error);
      throw error;
    }
  }

  // Get filter options
  static async getFilterOptions(): Promise<ApiResponse<FilterOptions>> {
    try {
      console.log('🔍 Fetching filter options...');
      
      const response = await apiClient.get<FilterOptions>(
        API_CONFIG.ENDPOINTS.ENQUIRIES.FILTER_OPTIONS
      );
      
      console.log('📥 Filter options response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch filter options:', error);
      throw error;
    }
  }

  // Submit contact form (public endpoint)
  static async submitContactForm(data: CreateEnquiryRequest): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('📝 Submitting contact form...', data);
      
      const response = await apiClient.post<{ message: string }>(
        API_CONFIG.ENDPOINTS.CONTACT.SUBMIT,
        data
      );
      
      console.log('✅ Contact form submitted:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to submit contact form:', error);
      throw error;
    }
  }
} 