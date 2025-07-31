import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { ApiResponse } from '../types';

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  status: 'Draft' | 'Published';
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFAQRequest {
  question: string;
  answer: string;
  status: 'Draft' | 'Published';
  isPublished: boolean;
}

export interface UpdateFAQRequest {
  question?: string;
  answer?: string;
  status?: 'Draft' | 'Published';
  isPublished?: boolean;
}

export interface FAQListResponse {
  faqs: FAQ[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateFAQStatusRequest {
  status: 'Draft' | 'Published';
  isPublished: boolean;
}

export class FAQService {
  // Get all FAQs with pagination and search
  static async getFAQs(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<FAQListResponse>> {
    try {
      console.log('📋 Fetching FAQs...', params);
      
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);

      const url = `${API_CONFIG.ENDPOINTS.FAQS.LIST}?${queryParams.toString()}`;
      
      const response = await apiClient.get<FAQListResponse>(url);
      
      console.log('📥 FAQs response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch FAQs:', error);
      throw error;
    }
  }

  // Get single FAQ by ID
  static async getFAQ(faqId: string): Promise<ApiResponse<FAQ>> {
    try {
      console.log('📋 Fetching FAQ:', faqId);
      
      const response = await apiClient.get<FAQ>(
        `${API_CONFIG.ENDPOINTS.FAQS.DETAILS.replace(':id', faqId)}`
      );
      
      console.log('📥 FAQ response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch FAQ:', error);
      throw error;
    }
  }

  // Create new FAQ
  static async createFAQ(data: CreateFAQRequest): Promise<ApiResponse<FAQ>> {
    try {
      console.log('📝 Creating FAQ...', data);
      
      const response = await apiClient.post<FAQ>(
        API_CONFIG.ENDPOINTS.FAQS.CREATE,
        data
      );
      
      console.log('✅ FAQ created:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to create FAQ:', error);
      throw error;
    }
  }

  // Update FAQ
  static async updateFAQ(faqId: string, data: UpdateFAQRequest): Promise<ApiResponse<FAQ>> {
    try {
      console.log('📝 Updating FAQ:', faqId, data);
      
      const response = await apiClient.put<FAQ>(
        `${API_CONFIG.ENDPOINTS.FAQS.UPDATE.replace(':id', faqId)}`,
        data
      );
      
      console.log('✅ FAQ updated:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update FAQ:', error);
      throw error;
    }
  }

  // Delete FAQ
  static async deleteFAQ(faqId: string): Promise<ApiResponse<{ id: string; deletedAt: string }>> {
    try {
      console.log('🗑️ Deleting FAQ:', faqId);
      
      const response = await apiClient.delete<{ id: string; deletedAt: string }>(
        `${API_CONFIG.ENDPOINTS.FAQS.DELETE.replace(':id', faqId)}`
      );
      
      console.log('✅ FAQ deleted:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to delete FAQ:', error);
      throw error;
    }
  }

  // Update FAQ status
  static async updateFAQStatus(faqId: string, data: UpdateFAQStatusRequest): Promise<ApiResponse<FAQ>> {
    try {
      console.log('📝 Updating FAQ status:', faqId, data);
      
      const response = await apiClient.patch<FAQ>(
        `${API_CONFIG.ENDPOINTS.FAQS.STATUS.replace(':id', faqId)}`,
        data
      );
      
      console.log('✅ FAQ status updated:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update FAQ status:', error);
      throw error;
    }
  }
} 