// Common API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Types
export interface ApiError {
  type: string;
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
  timestamp: string;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
  deviceData?: {
    deviceType: string;
    os: string;
    browser: string;
  };
  ipAddress?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface LoginTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  expiresIn: number;
  tokenType: string;
}

export interface UserPermission {
  permissionName: string;
  allowedActions: string[] | null; // null means all actions allowed
}

export interface LoginResponse {
  id: string;
  email: string;
  is_super_admin: boolean;
  permissions: UserPermission[];
  roles?: Array<{
    id: number;
    roleName: string;
    description?: string;
  }>;
  tokens: LoginTokens;
  sessionId: string;
}

export interface LoginResponseLegacy {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    profilePic: string;
    fullName: string;
    phone: string;
    address: string;
  };
}

export interface LoginResponse2FA extends LoginResponseLegacy {
  requiresOTP?: boolean;
  tempToken?: string;
}

// Password Management Types
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface Verify2FARequest {
  otp: string;
  tempToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    profilePic: string;
    fullName: string;
    phone: string;
    address: string;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'super_admin';
  profilePic: string;
  deviceData?: string;
  firstName: string;
  lastName: string;
  phone: string;
  location: string;
  isActive: boolean;
  permissions?: UserPermission[];
  roles?: Array<{
    id: number;
    roleName: string;
    description?: string;
  }>;
  isSuperAdmin?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

// API Request Options
export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  signal?: AbortSignal;
}

// Query Parameters
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  category?: string;
  starred?: boolean;
  email?: string;
  phone?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

// Dashboard Data Types
export interface DashboardStats {
  totalUsers: number;
  recentActivity: Array<{
    id: string;
    action: string;
    page: string;
    time: string;
    user?: string;
  }>;
}