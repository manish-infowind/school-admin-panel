import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { 
  PageContent, 
  UpdatePageRequest, 
  SiteSettings, 
  ApiResponse 
} from '../types';

export class ContentService {
  // Get all pages
  static async getPages(): Promise<ApiResponse<PageContent[]>> {
    try {
      const response = await apiClient.get<PageContent[]>(
        API_CONFIG.ENDPOINTS.CONTENT.PAGES
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get single page by ID
  static async getPage(id: string): Promise<ApiResponse<PageContent>> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.CONTENT.UPDATE_PAGE.replace(':id', id);
      const response = await apiClient.get<PageContent>(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get page by slug
  static async getPageBySlug(slug: string): Promise<ApiResponse<PageContent>> {
    try {
      const response = await apiClient.get<PageContent>(
        `${API_CONFIG.ENDPOINTS.CONTENT.PAGES}/slug/${slug}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update page content
  static async updatePage(id: string, pageData: UpdatePageRequest): Promise<ApiResponse<PageContent>> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.CONTENT.UPDATE_PAGE.replace(':id', id);
      const response = await apiClient.put<PageContent>(endpoint, pageData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Create new page
  static async createPage(pageData: Omit<PageContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<PageContent>> {
    try {
      const response = await apiClient.post<PageContent>(
        API_CONFIG.ENDPOINTS.CONTENT.PAGES,
        pageData
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Delete page
  static async deletePage(id: string): Promise<ApiResponse<void>> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.CONTENT.UPDATE_PAGE.replace(':id', id);
      const response = await apiClient.delete<void>(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get site settings
  static async getSiteSettings(): Promise<ApiResponse<SiteSettings>> {
    try {
      const response = await apiClient.get<SiteSettings>(
        API_CONFIG.ENDPOINTS.CONTENT.SETTINGS
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update site settings
  static async updateSiteSettings(settings: Partial<SiteSettings>): Promise<ApiResponse<SiteSettings>> {
    try {
      const response = await apiClient.put<SiteSettings>(
        API_CONFIG.ENDPOINTS.CONTENT.SETTINGS,
        settings
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get about us content
  static async getAboutUs(): Promise<ApiResponse<PageContent>> {
    try {
      const response = await apiClient.get<PageContent>(
        API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update about us content
  static async updateAboutUs(content: UpdatePageRequest): Promise<ApiResponse<PageContent>> {
    try {
      const response = await apiClient.put<PageContent>(
        API_CONFIG.ENDPOINTS.CONTENT.ABOUT_US,
        content
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get advertisements
  static async getAdvertisements(): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get<any[]>(
        API_CONFIG.ENDPOINTS.CONTENT.ADVERTISEMENTS
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update advertisements
  static async updateAdvertisements(advertisements: any[]): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.put<any[]>(
        API_CONFIG.ENDPOINTS.CONTENT.ADVERTISEMENTS,
        { advertisements }
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Upload image for content
  static async uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await apiClient.upload<{ url: string }>(
        `${API_CONFIG.ENDPOINTS.CONTENT.PAGES}/upload-image`,
        formData
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Publish page
  static async publishPage(id: string): Promise<ApiResponse<PageContent>> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.CONTENT.UPDATE_PAGE.replace(':id', id);
      const response = await apiClient.patch<PageContent>(endpoint, { status: 'published' });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Unpublish page
  static async unpublishPage(id: string): Promise<ApiResponse<PageContent>> {
    try {
      const endpoint = API_CONFIG.ENDPOINTS.CONTENT.UPDATE_PAGE.replace(':id', id);
      const response = await apiClient.patch<PageContent>(endpoint, { status: 'draft' });
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default ContentService; 