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
  deviceData: {
    deviceType: string;
    os: string;
    browser: string;
  };
  ipAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface LoginResponse {
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
  _id: string;
  username: string;
  email: string;
  role: string;
  profilePic: string;
  deviceData?: string;
  fullName: string;
  phone: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  image?: File;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}

// Content Types
export interface PageContent {
  id: string;
  title: string;
  content: string;
  slug: string;
  metaDescription?: string;
  status: 'published' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePageRequest {
  title?: string;
  content?: string;
  metaDescription?: string;
  status?: 'published' | 'draft';
}

// Privacy Policy Types
export interface PrivacyPolicy {
  _id: string;
  title: string;
  policyDescription: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePrivacyPolicyRequest {
  title: string;
  policyDescription: string;
}

// About Us Types
export interface AboutUsSection {
  _id: string;
  title: string;
  content: string;
  image?: string;
  order: number;
}

export interface TeamMember {
  _id: string;
  name: string;
  position: string;
  image?: string;
  bio: string;
  email?: string;
  linkedin?: string;
  twitter?: string;
  order: number;
}

export interface AboutUs {
  _id: string;
  mainTitle: string;
  mainDescription: string;
  mainImage?: string;
  sections: AboutUsSection[];
  teamMembers: TeamMember[];
}

export interface UpdateAboutUsRequest {
  mainTitle?: string;
  mainDescription?: string;
  sections?: Array<{
    title: string;
    content: string;
    order: number;
  }>;
  teamMembers?: Array<{
    name: string;
    position: string;
    bio: string;
    email?: string;
    linkedin?: string;
    twitter?: string;
    order: number;
  }>;
}

export interface UpdateSectionRequest {
  title: string;
  content: string;
  order: number;
}

export interface UpdateTeamMemberRequest {
  name: string;
  position: string;
  bio: string;
  email?: string;
  linkedin?: string;
  twitter?: string;
  order: number;
}

// Enquiry Types
export interface Enquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface CreateEnquiryRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface UpdateEnquiryRequest {
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  response?: string;
}

// Settings Types
export interface SiteSettings {
  siteName: string;
  siteUrl: string;
  adminEmail: string;
  contactEmail: string;
  phone: string;
  address: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
}

// Dashboard Stats Types
export interface DashboardStats {
  totalProducts: number;
  totalEnquiries: number;
  totalUsers: number;
  recentActivity: Array<{
    id: string;
    action: string;
    page: string;
    time: string;
    user?: string;
  }>;
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
  [key: string]: any;
} 