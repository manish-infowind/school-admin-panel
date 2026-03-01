// Common API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// Error Types
export interface ApiError {
  type: string;
  message: string;
  status?: number;
  timestamp: string;
  errors?: unknown;
  /** Backend error code (e.g. ENQUIRY_NOT_FOUND for 404 on enquiry). */
  code?: string;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  id: string;
  email: string;
  tokens: LoginTokens;
}

// Password Management Types
export interface ForgotPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  profilePic: string;
  firstName: string;
  lastName: string;
  phone: string;
  isActive: boolean;
}

// API Request Options
export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  signal?: AbortSignal;
}

// --- Location & Colleges (Admin API) ---

export interface Country {
  _id: string;
  name: string;
  code: string;
}

export interface State {
  _id: string;
  name: string;
  slug: string;
  countryId?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface City {
  _id: string;
  name: string;
  slug: string;
  stateId: string;
  isActive?: boolean;
  sortOrder?: number;
}

/** Institution type (replaces single course category; courses are selected via courseFees). */
export const INSTITUTION_TYPES = [
  'Private',
  'Autonomous',
  'Government',
  'Deemed',
  'Aided',
  'Other',
] as const;

export type InstitutionType = (typeof INSTITUTION_TYPES)[number];

/** Per-course fee row for create/update. Use courseId (from courses API) and courseName for display. API may return _id on each item. */
export interface CourseFee {
  _id?: string;
  courseId?: string;
  courseName: string;
  fee?: string;
  feeAmount?: number;
  feePeriod?: 'year' | 'semester';
}

export interface College {
  _id: string;
  name: string;
  slug: string;
  shortName?: string;
  countryId: string;
  stateId: string;
  cityId: string;
  stateName: string;
  cityName: string;
  locationDisplay: string;
  category: string; // Institution type: Private, Autonomous, Government, etc.
  address?: string;
  pinCode?: string;
  courses?: string[];
  courseFees?: CourseFee[];
  badge?: string;
  fee?: string;
  feeAmount?: number;
  feePeriod?: 'year' | 'semester';
  rating?: number;
  nirfRank?: number;
  placementRate?: number;
  avgPackage?: string;
  description?: string;
  highlights?: string[];
  eligibility?: string;
  facilities?: string[];
  website?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  galleryUrls?: string[];
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCollegeRequest {
  name: string;
  countryId: string;
  stateId: string;
  cityId: string;
  stateName: string;
  cityName: string;
  locationDisplay: string;
  category: string; // Institution type: Private, Autonomous, Government, etc.
  shortName?: string;
  address?: string;
  pinCode?: string;
  courses?: string[];
  courseFees?: CourseFee[];
  badge?: string;
  fee?: string;
  feeAmount?: number;
  feePeriod?: 'year' | 'semester';
  rating?: number;
  nirfRank?: number;
  placementRate?: number;
  avgPackage?: string;
  description?: string;
  highlights?: string[];
  eligibility?: string;
  facilities?: string[];
  website?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  galleryUrls?: string[];
  isActive?: boolean;
  isVerified?: boolean;
}

export interface CollegesListParams {
  category?: string;
  stateId?: string;
  cityId?: string;
  page?: number;
  limit?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface CollegesListResponse {
  colleges: College[];
  pagination: Pagination;
}

export interface DashboardData {
  colleges: { total: number; active: number };
  enquiries: { total: number; new?: number; pending?: number };
  applications: { total: number };
}

/** Populated course reference in enquiry. */
export interface EnquiryCourseRef {
  _id: string;
  name: string;
  slug: string;
}

export interface Enquiry {
  _id: string;
  mobile?: string;
  name?: string;
  email?: string;
  description?: string;
  courseId?: EnquiryCourseRef;
  status?: 'pending' | 'reviewed' | 'resolved';
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Status values: pending (new), reviewed (admin has reviewed), resolved (closed). */
export type EnquiryStatus = 'pending' | 'reviewed' | 'resolved';

/** Body for PUT /api/admin/enquiries/:id (partial update: status and/or notes). */
export interface EnquiryUpdateRequest {
  status?: EnquiryStatus;
  notes?: string;
}

export interface EnquiriesListParams {
  status?: EnquiryStatus;
  page?: number;
  limit?: number;
  fromDate?: string;
  toDate?: string;
  /** newest = latest first (default), oldest = oldest first */
  sort?: 'newest' | 'oldest';
}

export interface EnquiriesListResponse {
  enquiries: Enquiry[];
  pagination: Pagination;
}

// --- Events (Admin API) ---

export interface Event {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  shortDescription?: string;
  longDescription?: string;
  imageUrl?: string;
  venue?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Body for POST /api/admin/events. endDate must be on or after startDate. */
export interface CreateEventRequest {
  name: string;
  startDate: string;
  endDate: string;
  shortDescription?: string;
  longDescription?: string;
  imageUrl?: string;
  venue?: string;
  isActive?: boolean;
}

export interface EventsListParams {
  page?: number;
  limit?: number;
  /** startDate (default) or endDate */
  sort?: 'startDate' | 'endDate';
}

export interface EventsListResponse {
  events: Event[];
  pagination: Pagination;
}

// --- Courses (Consumer + Admin API) ---

/** Course (consumer dropdown: _id, name, slug; admin includes isActive, sortOrder, timestamps). */
export interface Course {
  _id: string;
  name: string;
  slug: string;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCourseRequest {
  name: string;
  isActive?: boolean;
  sortOrder?: number;
}