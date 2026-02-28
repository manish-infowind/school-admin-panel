import { apiClient } from '../client';
import { API_CONFIG } from '../config';
import type { ApiResponse } from '../types';
import type { Course, CreateCourseRequest } from '../types';

/** Admin course management. All methods require auth. */
export class CourseService {
  /** List all courses (active and inactive) for admin. GET /api/admin/courses */
  static async list(): Promise<ApiResponse<Course[]>> {
    const response = await apiClient.get<Course[]>(API_CONFIG.ENDPOINTS.COURSES);
    return response;
  }

  /** Get one course by id. GET /api/admin/courses/:id */
  static async getById(id: string): Promise<ApiResponse<Course>> {
    const response = await apiClient.get<Course>(`${API_CONFIG.ENDPOINTS.COURSES}/${id}`);
    return response;
  }

  /** Create course. POST /api/admin/courses */
  static async create(body: CreateCourseRequest): Promise<ApiResponse<Course>> {
    const response = await apiClient.post<Course>(API_CONFIG.ENDPOINTS.COURSES, body);
    return response;
  }

  /** Update course. PUT /api/admin/courses/:id */
  static async update(id: string, body: Partial<CreateCourseRequest>): Promise<ApiResponse<Course>> {
    const response = await apiClient.put<Course>(`${API_CONFIG.ENDPOINTS.COURSES}/${id}`, body);
    return response;
  }

  /** Permanently delete course. DELETE /api/admin/courses/:id */
  static async remove(id: string): Promise<ApiResponse<unknown>> {
    const response = await apiClient.delete(`${API_CONFIG.ENDPOINTS.COURSES}/${id}`);
    return response;
  }
}

/** Public: list active courses for consumer dropdown. No auth. GET /api/courses */
export async function getCoursesPublic(): Promise<Course[]> {
  try {
    const res = await apiClient.get<Course[]>(API_CONFIG.ENDPOINTS.COURSES_PUBLIC);
    if (res.success && Array.isArray(res.data)) return res.data;
    return [];
  } catch {
    return [];
  }
}
