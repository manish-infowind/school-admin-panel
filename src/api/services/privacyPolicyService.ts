import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { PrivacyPolicy, UpdatePrivacyPolicyRequest, ApiResponse } from '../types';

export class PrivacyPolicyService {
  // Get privacy policy
  static async getPrivacyPolicy(): Promise<ApiResponse<PrivacyPolicy>> {
    try {
      console.log('📄 Fetching privacy policy...');
      
      const response = await apiClient.get<PrivacyPolicy>(
        API_CONFIG.ENDPOINTS.CONTENT.PRIVACY_POLICY
      );

      console.log('📥 Privacy policy response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch privacy policy:', error);
      throw error;
    }
  }

  // Update privacy policy
  static async updatePrivacyPolicy(data: UpdatePrivacyPolicyRequest): Promise<ApiResponse<PrivacyPolicy>> {
    try {
      console.log('📝 Updating privacy policy...');
      console.log('📦 Update data:', data);
      
      const response = await apiClient.patch<PrivacyPolicy>(
        API_CONFIG.ENDPOINTS.CONTENT.PRIVACY_POLICY,
        data
      );

      console.log('📥 Update response:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update privacy policy:', error);
      throw error;
    }
  }
} 