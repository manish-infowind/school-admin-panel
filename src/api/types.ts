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