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

export interface LoginResponse2FA extends LoginResponse {
  requiresOTP?: boolean;
  tempToken?: string;
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
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Admin Management Types
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'super_admin';
  phone: string;
  location: string;
  bio?: string;
  profilePic?: string;
  isActive: boolean;
  twoFactorEnabled: boolean;
  permissions: string[];
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'super_admin';
  phone: string;
  location: string;
  bio?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface UpdateAdminRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  bio?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface ChangePasswordRequest {
  newPassword: string;
  confirmPassword: string;
}

export interface AdminListResponse {
  data: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AdminStats {
  total: number;
  superAdmins: number;
  admins: number;
  active: number;
  inactive: number;
  online: number;
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
export interface Reply {
  adminName: string;
  adminEmail: string;
  replyMessage: string;
  repliedAt: string;
}

export interface Enquiry {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  inquiryCategory: string;
  message: string;
  status: 'new' | 'replied' | 'in-progress' | 'closed';
  isStarred: boolean;
  ipAddress: string;
  userAgent: string;
  adminNotes?: string;
  repliedAt?: string;
  replies?: Reply[];
  createdAt: string;
  updatedAt: string;
}

export interface EnquiriesResponse {
  enquiries: Enquiry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateEnquiryRequest {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  inquiryCategory: string;
  message: string;
}

export interface UpdateEnquiryRequest {
  status?: 'new' | 'replied' | 'in-progress' | 'closed';
  isStarred?: boolean;
  adminNotes?: string;
}

export interface ReplyToEnquiryRequest {
  replyMessage: string;
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
  starred?: boolean;
  email?: string;
  phone?: string;
  startDate?: string;
  endDate?: string;
  hasReplies?: boolean;
  hasAdminNotes?: boolean;
  [key: string]: any;
}

export interface EnquiryStats {
  total: number;
  new: number;
  inProgress: number;
  replied: number;
  closed: number;
  starred: number;
}

export interface FilterOption {
  value: string;
  count: number;
}

export interface FilterOptions {
  categories: FilterOption[];
  statuses: FilterOption[];
  dateRanges: {
    today: number;
    yesterday: number;
    last7Days: number;
    last30Days: number;
    thisMonth: number;
    lastMonth: number;
  };
}

export interface EnquiryListResponse {
  enquiries: Enquiry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Campaign Management Types
export interface Campaign {
  _id: string;
  name: string;
  subject: string;
  content: string;
  type: 'email' | 'sms' | 'push';
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed' | 'cancelled';
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  openedCount: number;
  clickedCount: number;
  recipientEmails: string[];
  sentEmails: string[];
  failedEmails: string[];
  settings: {
    sendInterval: number;
    maxRetries: number;
    includeUnsubscribed: boolean;
  };
  createdByEmail: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignRequest {
  name: string;
  subject: string;
  content: string;
  type: 'email' | 'sms' | 'push';
  scheduledAt?: string;
  settings: {
    sendInterval: number;
    maxRetries: number;
    includeUnsubscribed: boolean;
  };
  notes?: string;
}

export interface UpdateCampaignRequest {
  name?: string;
  subject?: string;
  content?: string;
  scheduledAt?: string;
  settings?: {
    sendInterval?: number;
    maxRetries?: number;
    includeUnsubscribed?: boolean;
  };
  notes?: string;
}

export interface RunCampaignRequest {
  customEmails?: string[];
}

export interface CampaignListResponse {
  campaigns: Campaign[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CampaignStats {
  totalCampaigns: number;
  draftCampaigns: number;
  scheduledCampaigns: number;
  runningCampaigns: number;
  completedCampaigns: number;
  failedCampaigns: number;
  totalEmailsSent: number;
  totalEmailsFailed: number;
  averageOpenRate: number;
  averageClickRate: number;
  // New email tracking fields
  totalEmailsTracked: number;
  pendingEmails: number;
  retryingEmails: number;
  permanentlyFailedEmails: number;
  emailFailureRate: number;
}

export interface CampaignQueryParams extends QueryParams {
  status?: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed' | 'cancelled';
  type?: 'email' | 'sms' | 'push';
  startDate?: string;
  endDate?: string;
} 

// Email Tracking Types
export interface EmailTracking {
  _id: string;
  campaignId: string;
  recipientEmail: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'RETRYING' | 'PERMANENTLY_FAILED';
  failureReason?: 'invalid_email' | 'user_not_found' | 'domain_not_found' | 'mailbox_full' | 'rate_limit' | 'authentication_error' | 'network_error' | 'smtp_error' | 'unknown';
  smtpResponseCode?: number;
  smtpResponseMessage?: string;
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: string;
  sentAt?: string;
  failedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FailedEmail {
  _id: string;
  campaignId: string;
  recipientEmail: string;
  failureReason: string;
  smtpResponseCode?: number;
  smtpResponseMessage?: string;
  retryCount: number;
  maxRetries: number;
  failedAt: string;
  nextRetryAt?: string;
}

export interface EmailRetryStats {
  totalFailedEmails: number;
  emailsInRetryQueue: number;
  emailsRetriedToday: number;
  emailsRetriedThisWeek: number;
  averageRetrySuccessRate: number;
  lastRetryProcessRun?: string;
  nextRetryProcessRun?: string;
}

export interface DetailedCampaignStats extends CampaignStats {
  emailTracking: {
    totalTracked: number;
    pending: number;
    sent: number;
    failed: number;
    retrying: number;
    permanentlyFailed: number;
    failureRate: number;
  };
  failureBreakdown: {
    invalid_email: number;
    user_not_found: number;
    domain_not_found: number;
    mailbox_full: number;
    rate_limit: number;
    authentication_error: number;
    network_error: number;
    smtp_error: number;
    unknown: number;
  };
} 