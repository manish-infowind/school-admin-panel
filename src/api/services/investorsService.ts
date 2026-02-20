import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import { 
  InvestorsListResponse,
  InvestorDetails,
  InvestorsQueryParams,
  ApiResponse 
} from '../types';

export class InvestorsService {
  /**
   * Get paginated list of investors with filters and sorting
   */
  static async getInvestors(params?: InvestorsQueryParams): Promise<ApiResponse<InvestorsListResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    if (params?.country_code) {
      queryParams.append('country_code', params.country_code);
    }
    if (params?.state_code) {
      queryParams.append('state_code', params.state_code);
    }
    if (params?.city_name) {
      queryParams.append('city_name', params.city_name);
    }
    if (params?.status) {
      queryParams.append('status', params.status);
    }
    if (params?.min_investment_count !== undefined) {
      queryParams.append('min_investment_count', params.min_investment_count.toString());
    }
    if (params?.max_investment_count !== undefined) {
      queryParams.append('max_investment_count', params.max_investment_count.toString());
    }
    if (params?.sort_by) {
      queryParams.append('sort_by', params.sort_by);
    }
    if (params?.sort_order) {
      queryParams.append('sort_order', params.sort_order);
    }

    const queryString = queryParams.toString();
    const endpoint = `${API_CONFIG.ENDPOINTS.INVESTORS.LIST}${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<InvestorsListResponse>(endpoint);
  }

  /**
   * Get investor details by ID including all investments
   */
  static async getInvestorById(id: string): Promise<ApiResponse<InvestorDetails>> {
    const endpoint = API_CONFIG.ENDPOINTS.INVESTORS.GET.replace(':id', id);
    return apiClient.get<InvestorDetails>(endpoint);
  }
}
