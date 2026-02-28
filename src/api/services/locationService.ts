import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import type { ApiResponse } from '../types';
import type { Country, State, City } from '../types';

/**
 * Location APIs: countries (public), states & cities (admin).
 * Use countries for dropdown without auth; states/cities require Bearer token.
 */
export class LocationService {
  /** Get active countries (no auth). */
  static async getCountries(): Promise<ApiResponse<Country[]>> {
    const response = await apiClient.get<Country[]>(API_CONFIG.ENDPOINTS.COUNTRIES);
    return response;
  }

  /** Get states, optionally filtered by country. Requires auth. */
  static async getStates(countryId?: string): Promise<ApiResponse<State[]>> {
    const url = countryId
      ? `${API_CONFIG.ENDPOINTS.STATES}?countryId=${encodeURIComponent(countryId)}`
      : API_CONFIG.ENDPOINTS.STATES;
    const response = await apiClient.get<State[]>(url);
    return response;
  }

  /** Get cities by state. Requires auth. */
  static async getCities(stateId: string): Promise<ApiResponse<City[]>> {
    const url = `${API_CONFIG.ENDPOINTS.CITIES}?stateId=${encodeURIComponent(stateId)}`;
    const response = await apiClient.get<City[]>(url);
    return response;
  }

  /** Public states (no auth). Optional countryId. */
  static async getStatesPublic(countryId?: string): Promise<ApiResponse<State[]>> {
    const url = countryId
      ? `${API_CONFIG.ENDPOINTS.STATES_PUBLIC}?countryId=${encodeURIComponent(countryId)}`
      : API_CONFIG.ENDPOINTS.STATES_PUBLIC;
    const response = await apiClient.get<State[]>(url);
    return response;
  }

  /** Public cities (no auth). stateId required. */
  static async getCitiesPublic(stateId: string): Promise<ApiResponse<City[]>> {
    const url = `${API_CONFIG.ENDPOINTS.CITIES_PUBLIC}?stateId=${encodeURIComponent(stateId)}`;
    const response = await apiClient.get<City[]>(url);
    return response;
  }
}
