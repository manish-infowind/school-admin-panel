import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { PrivacyPolicy, UpdatePrivacyPolicyRequest, ApiResponse } from '../types';

export class PrivacyPolicyService {
  // Get privacy policy
  static async getPrivacyPolicy(): Promise<ApiResponse<PrivacyPolicy>> {
    try {
      const response = await apiClient.get<PrivacyPolicy>(
        API_CONFIG.ENDPOINTS.CONTENT.PRIVACY_POLICY
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Update privacy policy
  static async updatePrivacyPolicy(data: UpdatePrivacyPolicyRequest): Promise<ApiResponse<PrivacyPolicy>> {
    try {
      const response = await apiClient.patch<PrivacyPolicy>(
        API_CONFIG.ENDPOINTS.CONTENT.PRIVACY_POLICY,
        data
      );

      return response;
    } catch (error) {
      throw error;
    }
  }
} 