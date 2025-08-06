import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { ApiResponse, SiteSettings, BusinessAddress } from '../types';

export class SiteSettingsService {
  // Initialize site settings
  static async initialize(): Promise<ApiResponse<SiteSettings>> {
    try {
      const response = await apiClient.post<SiteSettings>(
        API_CONFIG.ENDPOINTS.SITE_SETTINGS.INITIALIZE
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get current site settings
  static async getSettings(): Promise<ApiResponse<SiteSettings>> {
    try {
      const response = await apiClient.get<SiteSettings>(
        API_CONFIG.ENDPOINTS.SITE_SETTINGS.GET
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update site settings
  static async updateSettings(settings: Partial<SiteSettings>): Promise<ApiResponse<SiteSettings>> {
    try {
      const response = await apiClient.put<SiteSettings>(
        API_CONFIG.ENDPOINTS.SITE_SETTINGS.UPDATE,
        settings
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
} 