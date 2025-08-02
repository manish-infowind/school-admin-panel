import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { ApiResponse } from '../types';

export interface IndexPageSection {
  id?: string;
  _id?: string; // MongoDB ID from API
  name: string;
  description: string;
  status?: "Active" | "Draft";
  lastModified?: string;
  content: {
    title: string;
    subtitle: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    featuredProducts?: string[];
    _id?: string; // MongoDB ID for content
  };
  isActive: boolean;
  order: number;
}

export interface IndexPageData {
  pageTitle: string;
  sections: IndexPageSection[];
}

export interface CreateSectionRequest {
  name: string;
  description: string;
  content: {
    title: string;
    subtitle: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    featuredProducts?: string[];
  };
  isActive: boolean;
  order: number;
}

export interface UpdateSectionRequest {
  name?: string;
  description?: string;
  content?: {
    title?: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    featuredProducts?: string[];
  };
  isActive?: boolean;
  order?: number;
}

export interface UpdateSectionStatusRequest {
  isActive: boolean;
}



export interface ReorderSectionsRequest {
  sectionIds: string[];
}

export class IndexPageService {
  // Get complete index page data
  static async getIndexPage(): Promise<ApiResponse<IndexPageData>> {
    try {
      const response = await apiClient.get<IndexPageData>(
        API_CONFIG.ENDPOINTS.INDEX_PAGE.MAIN
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update complete index page data
  static async updateIndexPage(data: IndexPageData): Promise<ApiResponse<IndexPageData>> {
    try {
      const response = await apiClient.patch<IndexPageData>(
        API_CONFIG.ENDPOINTS.INDEX_PAGE.MAIN,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get all sections
  static async getSections(): Promise<ApiResponse<IndexPageSection[]>> {
    try {
      const response = await apiClient.get<IndexPageSection[]>(
        API_CONFIG.ENDPOINTS.INDEX_PAGE.SECTIONS
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get single section by ID
  static async getSection(sectionId: string): Promise<ApiResponse<IndexPageSection>> {
    try {
      const response = await apiClient.get<IndexPageSection>(
        API_CONFIG.ENDPOINTS.INDEX_PAGE.SECTION.replace(':id', sectionId)
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Create new section
  static async createSection(data: CreateSectionRequest): Promise<ApiResponse<IndexPageSection>> {
    try {
      const response = await apiClient.post<IndexPageSection>(
        API_CONFIG.ENDPOINTS.INDEX_PAGE.SECTIONS,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update section
  static async updateSection(sectionId: string, data: UpdateSectionRequest): Promise<ApiResponse<IndexPageSection>> {
    try {
      const response = await apiClient.patch<IndexPageSection>(
        API_CONFIG.ENDPOINTS.INDEX_PAGE.SECTION.replace(':id', sectionId),
        data
      );
      
      return response;
    } catch (error) {
      console.error('❌ IndexPageService: Update section error:', error);
      throw error;
    }
  }

  // Update section status
  static async updateSectionStatus(sectionId: string, data: UpdateSectionStatusRequest): Promise<ApiResponse<IndexPageSection>> {
    try {
      const response = await apiClient.patch<IndexPageSection>(
        API_CONFIG.ENDPOINTS.INDEX_PAGE.SECTION_STATUS.replace(':id', sectionId),
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  }



  // Delete section
  static async deleteSection(sectionId: string): Promise<ApiResponse<{ id: string; deletedAt: string }>> {
    try {
      const response = await apiClient.delete<{ id: string; deletedAt: string }>(
        API_CONFIG.ENDPOINTS.INDEX_PAGE.SECTION.replace(':id', sectionId)
      );
      
      return response;
    } catch (error) {
      console.error('❌ IndexPageService: Delete section error:', error);
      throw error;
    }
  }

  // Reorder sections
  static async reorderSections(data: ReorderSectionsRequest): Promise<ApiResponse<IndexPageSection[]>> {
    try {
      const response = await apiClient.post<IndexPageSection[]>(
        API_CONFIG.ENDPOINTS.INDEX_PAGE.REORDER_SECTIONS,
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default IndexPageService; 