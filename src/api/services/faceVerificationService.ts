import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import {
  ApiResponse,
  FaceVerification,
  FaceVerificationListResponse,
  FaceVerificationListParams,
  ApprovalData,
  ApprovalResponse,
  ReverifyData,
  ReverifyResponse,
  FlaggedUsersResponse,
  FlaggedUsersParams,
  VerificationStatistics,
  StatisticsParams,
  RetryHistoryResponse,
  ManualVerificationRequest,
  ManualVerificationResponse,
} from '../types';

export class FaceVerificationService {
  /**
   * Get pending verifications queue
   */
  static async getPendingVerifications(
    params?: Pick<FaceVerificationListParams, 'page' | 'limit' | 'search'>
  ): Promise<ApiResponse<FaceVerificationListResponse>> {
    try {
      const searchParams = new URLSearchParams();

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
          }
        });
      }

      const url = `${API_CONFIG.ENDPOINTS.FACE_VERIFICATIONS.PENDING}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await apiClient.get<FaceVerificationListResponse>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all face verifications with filters
   */
  static async getAllVerifications(
    params?: FaceVerificationListParams
  ): Promise<ApiResponse<FaceVerificationListResponse>> {
    try {
      const searchParams = new URLSearchParams();

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
          }
        });
      }

      const url = `${API_CONFIG.ENDPOINTS.FACE_VERIFICATIONS.LIST}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await apiClient.get<FaceVerificationListResponse>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get verification details by ID
   */
  static async getVerificationDetails(id: number): Promise<ApiResponse<FaceVerification>> {
    try {
      const url = API_CONFIG.ENDPOINTS.FACE_VERIFICATIONS.DETAILS.replace(':id', String(id));
      const response = await apiClient.get<FaceVerification>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Approve or reject verification
   */
  static async approveOrReject(
    id: number,
    data: ApprovalData
  ): Promise<ApiResponse<ApprovalResponse>> {
    try {
      const url = API_CONFIG.ENDPOINTS.FACE_VERIFICATIONS.APPROVE.replace(':id', String(id));
      const response = await apiClient.put<ApprovalResponse>(url, data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Trigger re-verification for a user
   */
  static async triggerReverification(
    userId: number,
    data?: ReverifyData
  ): Promise<ApiResponse<ReverifyResponse>> {
    try {
      const url = API_CONFIG.ENDPOINTS.FACE_VERIFICATIONS.REVERIFY.replace(':userId', String(userId));
      const response = await apiClient.post<ReverifyResponse>(url, data || {});
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get flagged users
   */
  static async getFlaggedUsers(
    params?: FlaggedUsersParams
  ): Promise<ApiResponse<FlaggedUsersResponse>> {
    try {
      const searchParams = new URLSearchParams();

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
          }
        });
      }

      const url = `${API_CONFIG.ENDPOINTS.FACE_VERIFICATIONS.FLAGGED_USERS}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await apiClient.get<FlaggedUsersResponse>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get verification statistics
   */
  static async getStatistics(
    params?: StatisticsParams
  ): Promise<ApiResponse<VerificationStatistics>> {
    try {
      const searchParams = new URLSearchParams();

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
          }
        });
      }

      const url = `${API_CONFIG.ENDPOINTS.FACE_VERIFICATIONS.STATISTICS}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await apiClient.get<VerificationStatistics>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get retry history for a verification group
   */
  static async getRetryHistory(groupId: number): Promise<ApiResponse<RetryHistoryResponse>> {
    try {
      const url = API_CONFIG.ENDPOINTS.FACE_VERIFICATIONS.RETRY_HISTORY.replace(':groupId', String(groupId));
      const response = await apiClient.get<RetryHistoryResponse>(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Manually update user face verification status
   */
  static async manualUpdateFaceVerification(
    userId: number,
    data: { isVerified: boolean; adminNotes?: string }
  ): Promise<ApiResponse<ManualVerificationResponse>> {
    try {
      const url = API_CONFIG.ENDPOINTS.FACE_VERIFICATIONS.MANUAL_VERIFICATION.replace(':userId', String(userId));
      const response = await apiClient.put<ManualVerificationResponse>(url, data);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

