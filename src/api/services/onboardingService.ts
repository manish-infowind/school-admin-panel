import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { 
  Stage, 
  Industry, 
  FundingRange, 
  TeamSize,
  CreateReferenceDataRequest,
  UpdateReferenceDataRequest,
  ReferenceDataQueryParams,
  ApiResponse 
} from '../types';

export class OnboardingService {
  // ==================== STAGES ====================
  static async getStages(params?: ReferenceDataQueryParams): Promise<ApiResponse<Stage[]>> {
    const queryParams = new URLSearchParams();
    if (params?.includeInactive) {
      queryParams.append('includeInactive', 'true');
    }
    const queryString = queryParams.toString();
    const endpoint = `${API_CONFIG.ENDPOINTS.ONBOARDING.STAGES.LIST}${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<Stage[]>(endpoint);
  }

  static async getStageById(id: number): Promise<ApiResponse<Stage>> {
    const endpoint = API_CONFIG.ENDPOINTS.ONBOARDING.STAGES.GET.replace(':id', String(id));
    return apiClient.get<Stage>(endpoint);
  }

  static async createStage(data: CreateReferenceDataRequest): Promise<ApiResponse<Stage>> {
    return apiClient.post<Stage>(API_CONFIG.ENDPOINTS.ONBOARDING.STAGES.CREATE, data);
  }

  static async updateStage(id: number, data: UpdateReferenceDataRequest): Promise<ApiResponse<Stage>> {
    const endpoint = API_CONFIG.ENDPOINTS.ONBOARDING.STAGES.UPDATE.replace(':id', String(id));
    return apiClient.put<Stage>(endpoint, data);
  }

  static async deleteStage(id: number): Promise<ApiResponse<null>> {
    const endpoint = API_CONFIG.ENDPOINTS.ONBOARDING.STAGES.DELETE.replace(':id', String(id));
    return apiClient.delete<null>(endpoint);
  }

  // ==================== INDUSTRIES ====================
  static async getIndustries(params?: ReferenceDataQueryParams): Promise<ApiResponse<Industry[]>> {
    const queryParams = new URLSearchParams();
    if (params?.includeInactive) {
      queryParams.append('includeInactive', 'true');
    }
    const queryString = queryParams.toString();
    const endpoint = `${API_CONFIG.ENDPOINTS.ONBOARDING.INDUSTRIES.LIST}${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<Industry[]>(endpoint);
  }

  static async getIndustryById(id: number): Promise<ApiResponse<Industry>> {
    const endpoint = API_CONFIG.ENDPOINTS.ONBOARDING.INDUSTRIES.GET.replace(':id', String(id));
    return apiClient.get<Industry>(endpoint);
  }

  static async createIndustry(data: CreateReferenceDataRequest): Promise<ApiResponse<Industry>> {
    return apiClient.post<Industry>(API_CONFIG.ENDPOINTS.ONBOARDING.INDUSTRIES.CREATE, data);
  }

  static async updateIndustry(id: number, data: UpdateReferenceDataRequest): Promise<ApiResponse<Industry>> {
    const endpoint = API_CONFIG.ENDPOINTS.ONBOARDING.INDUSTRIES.UPDATE.replace(':id', String(id));
    return apiClient.put<Industry>(endpoint, data);
  }

  static async deleteIndustry(id: number): Promise<ApiResponse<null>> {
    const endpoint = API_CONFIG.ENDPOINTS.ONBOARDING.INDUSTRIES.DELETE.replace(':id', String(id));
    return apiClient.delete<null>(endpoint);
  }

  // ==================== FUNDING RANGES ====================
  static async getFundingRanges(params?: ReferenceDataQueryParams): Promise<ApiResponse<FundingRange[]>> {
    const queryParams = new URLSearchParams();
    if (params?.includeInactive) {
      queryParams.append('includeInactive', 'true');
    }
    const queryString = queryParams.toString();
    const endpoint = `${API_CONFIG.ENDPOINTS.ONBOARDING.FUNDING_RANGES.LIST}${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<FundingRange[]>(endpoint);
  }

  static async getFundingRangeById(id: number): Promise<ApiResponse<FundingRange>> {
    const endpoint = API_CONFIG.ENDPOINTS.ONBOARDING.FUNDING_RANGES.GET.replace(':id', String(id));
    return apiClient.get<FundingRange>(endpoint);
  }

  static async createFundingRange(data: CreateReferenceDataRequest): Promise<ApiResponse<FundingRange>> {
    return apiClient.post<FundingRange>(API_CONFIG.ENDPOINTS.ONBOARDING.FUNDING_RANGES.CREATE, data);
  }

  static async updateFundingRange(id: number, data: UpdateReferenceDataRequest): Promise<ApiResponse<FundingRange>> {
    const endpoint = API_CONFIG.ENDPOINTS.ONBOARDING.FUNDING_RANGES.UPDATE.replace(':id', String(id));
    return apiClient.put<FundingRange>(endpoint, data);
  }

  static async deleteFundingRange(id: number): Promise<ApiResponse<null>> {
    const endpoint = API_CONFIG.ENDPOINTS.ONBOARDING.FUNDING_RANGES.DELETE.replace(':id', String(id));
    return apiClient.delete<null>(endpoint);
  }

  // ==================== TEAM SIZES ====================
  static async getTeamSizes(params?: ReferenceDataQueryParams): Promise<ApiResponse<TeamSize[]>> {
    const queryParams = new URLSearchParams();
    if (params?.includeInactive) {
      queryParams.append('includeInactive', 'true');
    }
    const queryString = queryParams.toString();
    const endpoint = `${API_CONFIG.ENDPOINTS.ONBOARDING.TEAM_SIZES.LIST}${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<TeamSize[]>(endpoint);
  }

  static async getTeamSizeById(id: number): Promise<ApiResponse<TeamSize>> {
    const endpoint = API_CONFIG.ENDPOINTS.ONBOARDING.TEAM_SIZES.GET.replace(':id', String(id));
    return apiClient.get<TeamSize>(endpoint);
  }

  static async createTeamSize(data: CreateReferenceDataRequest): Promise<ApiResponse<TeamSize>> {
    return apiClient.post<TeamSize>(API_CONFIG.ENDPOINTS.ONBOARDING.TEAM_SIZES.CREATE, data);
  }

  static async updateTeamSize(id: number, data: UpdateReferenceDataRequest): Promise<ApiResponse<TeamSize>> {
    const endpoint = API_CONFIG.ENDPOINTS.ONBOARDING.TEAM_SIZES.UPDATE.replace(':id', String(id));
    return apiClient.put<TeamSize>(endpoint, data);
  }

  static async deleteTeamSize(id: number): Promise<ApiResponse<null>> {
    const endpoint = API_CONFIG.ENDPOINTS.ONBOARDING.TEAM_SIZES.DELETE.replace(':id', String(id));
    return apiClient.delete<null>(endpoint);
  }
}
