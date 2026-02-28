import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import type { ApiResponse } from '../types';
import type {
  College,
  CreateCollegeRequest,
  CollegesListParams,
  CollegesListResponse,
  DashboardData,
  Enquiry,
  EnquiriesListParams,
  EnquiriesListResponse,
} from '../types';

export class CollegeService {
  /** List colleges with optional filters and pagination. */
  static async list(params?: CollegesListParams): Promise<ApiResponse<CollegesListResponse>> {
    const search = new URLSearchParams();
    if (params?.category) search.set('category', params.category);
    if (params?.stateId) search.set('stateId', params.stateId);
    if (params?.cityId) search.set('cityId', params.cityId);
    if (params?.page != null) search.set('page', String(params.page));
    if (params?.limit != null) search.set('limit', String(params.limit));
    const query = search.toString();
    const url = query ? `${API_CONFIG.ENDPOINTS.COLLEGES}?${query}` : API_CONFIG.ENDPOINTS.COLLEGES;
    const response = await apiClient.get<CollegesListResponse>(url);
    return response;
  }

  /** Get one college by id. */
  static async getById(id: string): Promise<ApiResponse<College>> {
    const response = await apiClient.get<College>(`${API_CONFIG.ENDPOINTS.COLLEGES}/${id}`);
    return response;
  }

  /** Create college. */
  static async create(body: CreateCollegeRequest): Promise<ApiResponse<College>> {
    const response = await apiClient.post<College>(API_CONFIG.ENDPOINTS.COLLEGES, body);
    return response;
  }

  /** Update college. */
  static async update(id: string, body: Partial<CreateCollegeRequest>): Promise<ApiResponse<College>> {
    const response = await apiClient.put<College>(`${API_CONFIG.ENDPOINTS.COLLEGES}/${id}`, body);
    return response;
  }

  /** Change college status (active/inactive). PATCH /api/admin/colleges/:id/status */
  static async updateStatus(id: string, isActive: boolean): Promise<ApiResponse<College>> {
    const response = await apiClient.patch<College>(
      `${API_CONFIG.ENDPOINTS.COLLEGES}/${id}/status`,
      { isActive }
    );
    return response;
  }

  /** Permanently delete college. DELETE /api/admin/colleges/:id */
  static async remove(id: string): Promise<ApiResponse<unknown>> {
    const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.COLLEGES}/${id}`);
    return response;
  }
}

/**
 * Upload a college image: sends the selected file in FormData (field name `file`) to the backend.
 * Backend handles upload (e.g. to S3) and returns the public URL. That URL is then sent with the college create/update.
 */
export async function uploadCollegeImage(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const formData = new FormData();
  formData.append('file', file, file.name);
  try {
    const res = await apiClient.upload<{ url: string }>(API_CONFIG.ENDPOINTS.UPLOAD, formData);
    if (res.success && res.data && typeof res.data === 'object' && 'url' in res.data) return (res.data as { url: string }).url;
    if (res.success && res.data && typeof res.data === 'string') return res.data as string;
    return null;
  } catch {
    return null;
  }
}

/** Dashboard stats: colleges, enquiries, applications. */
export class AdminDashboardService {
  static async getDashboard(): Promise<ApiResponse<DashboardData>> {
    const response = await apiClient.get<DashboardData>(API_CONFIG.ENDPOINTS.DASHBOARD.MAIN);
    return response;
  }
}

/** Counselling enquiries. */
export class EnquiryService {
  static async list(params?: EnquiriesListParams): Promise<ApiResponse<EnquiriesListResponse>> {
    const search = new URLSearchParams();
    if (params?.status) search.set('status', params.status);
    if (params?.page != null) search.set('page', String(params.page));
    if (params?.limit != null) search.set('limit', String(params.limit));
    const query = search.toString();
    const url = query ? `${API_CONFIG.ENDPOINTS.ENQUIRIES}?${query}` : API_CONFIG.ENDPOINTS.ENQUIRIES;
    const response = await apiClient.get<EnquiriesListResponse>(url);
    return response;
  }

  static async update(
    id: string,
    body: { status?: 'new' | 'contacted' | 'closed'; notes?: string }
  ): Promise<ApiResponse<Enquiry>> {
    const response = await apiClient.put<Enquiry>(`${API_CONFIG.ENDPOINTS.ENQUIRIES}/${id}`, body);
    return response;
  }
}
