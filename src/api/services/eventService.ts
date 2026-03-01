import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import type { ApiResponse } from '../types';
import type {
  Event,
  CreateEventRequest,
  EventsListParams,
  EventsListResponse,
} from '../types';

/**
 * Admin Events API: list, get, create, update, delete.
 * Base path: /api/admin/events. Auth: Bearer token required.
 */
export class EventService {
  /** List events with pagination. Sort: startDate (default) or endDate. */
  static async list(params?: EventsListParams): Promise<ApiResponse<EventsListResponse>> {
    const search = new URLSearchParams();
    if (params?.page != null) search.set('page', String(params.page));
    if (params?.limit != null) search.set('limit', String(params.limit));
    if (params?.sort) search.set('sort', params.sort);
    const query = search.toString();
    const url = query ? `${API_CONFIG.ENDPOINTS.EVENTS}?${query}` : API_CONFIG.ENDPOINTS.EVENTS;
    const response = await apiClient.get<EventsListResponse>(url);
    return response;
  }

  /** Get one event by ID. 404 returns code EVENT_NOT_FOUND. */
  static async getById(id: string): Promise<ApiResponse<Event>> {
    const response = await apiClient.get<Event>(`${API_CONFIG.ENDPOINTS.EVENTS}/${id}`);
    return response;
  }

  /** Create event. Requires name, startDate, endDate; endDate must be on or after startDate. */
  static async create(body: CreateEventRequest): Promise<ApiResponse<Event>> {
    const response = await apiClient.post<Event>(API_CONFIG.ENDPOINTS.EVENTS, body);
    return response;
  }

  /** Update event. Partial body allowed. endDate must remain on or after startDate. */
  static async update(id: string, body: Partial<CreateEventRequest>): Promise<ApiResponse<Event>> {
    const response = await apiClient.put<Event>(`${API_CONFIG.ENDPOINTS.EVENTS}/${id}`, body);
    return response;
  }

  /** Permanently delete event. 404 returns code EVENT_NOT_FOUND. */
  static async remove(id: string): Promise<ApiResponse<unknown>> {
    const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.EVENTS}/${id}`);
    return response;
  }
}
