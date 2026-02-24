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
  permissions: UserPermission[]; // Updated: Array of permission objects
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

// Permission Management Types
export interface Permission {
  id: number;
  permissionName: string;
  allowedActions: string[] | null; // null means all actions allowed
}

export interface CreatePermissionRequest {
  permissionName: string;
  allowedActions?: string[]; // Optional: ['create', 'read', 'update', 'delete']
}

export interface CreatePermissionResponse {
  id: number;
  permissionName: string;
  allowedActions: string[] | null;
}

export interface UpdatePermissionRequest {
  allowedActions?: string[]; // Optional: ['create', 'read', 'update', 'delete']
}

export interface UpdatePermissionResponse {
  id: number;
  permissionName: string;
  allowedActions: string[] | null;
}

export interface PermissionsListResponse {
  permissions: Permission[];
}

export interface AssignPermissionsRequest {
  adminId: string;
  permissionIds: number[];
}

export interface AssignPermissionsResponse {
  adminId: string;
  permissions: Array<{
    permissionName: string;
  }>;
}

export interface AdminPermissionsResponse {
  adminId: string;
  isSuperAdmin: boolean;
  permissions: Array<{
    permissionName: string;
  }>;
}

// Role Management Types
export interface Role {
  id: number;
  roleName: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateRoleRequest {
  roleName: string;
  description?: string;
}

export interface CreateRoleResponse {
  id: number;
  roleName: string;
  description?: string;
}

export interface UpdateRoleRequest {
  roleName: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateRoleResponse {
  id: number;
  roleName: string;
  description?: string;
  isActive: boolean;
}

export interface RolesListResponse {
  roles: Role[];
}

export interface AssignRoleRequest {
  adminId: string;
  roleIds: number[]; // Changed from roleId to roleIds (array) to match API expectation
}

export interface AssignRoleResponse {
  adminId: string;
  roles: Array<{
    id: number;
    roleName: string;
    description?: string;
  }>;
}

export interface AdminRolesResponse {
  adminId: string;
  isSuperAdmin: boolean;
  roles: Array<{
    id: number;
    roleName: string;
    description?: string;
  }>;
}

export interface AssignPermissionsToRoleRequest {
  roleId: number;
  permissions: Array<{
    permissionName: string;
    crud: string[]; // Array of: 'create' | 'read' | 'update' | 'delete'
  }>;
}

export interface AssignPermissionsToRoleResponse {
  roleId: number;
  roleName: string;
  permissions: Array<{
    id: number;
    permissionName: string;
    permissionAllowedActions: string[] | null;
    roleAllowedActions: string[] | null;
  }>;
}

export interface RolePermissionsResponse {
  roleId: number;
  roleName: string;
  permissions: Array<{
    id: number;
    permissionName: string;
    permissionAllowedActions: string[] | null;
    roleAllowedActions: string[] | null;
  }>;
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
  permissions?: UserPermission[]; // Updated: Array of permission objects with allowedActions
  roles?: Array<{
    id: number;
    roleName: string;
    description?: string;
  }>;
  isSuperAdmin?: boolean; // Added for convenience
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Admin Management Types
export interface AdminUser {
  id: string;
  username?: string; // Optional - may not be in API response
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'super_admin';
  phone: string;
  countryCode?: string; // Optional - may be in API response
  location: string | null;
  bio?: string | null;
  profilePic?: string | null;
  isActive: boolean;
  twoFactorEnabled: boolean;
  permissions: string[];
  roles?: Array<{
    id: number;
    roleName: string;
    description?: string;
  }>;
  lastLogin?: string | null;
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
  countryCode: string; // Required: e.g., "+1", "+91"
  location: string;
  bio?: string;
  permissions?: string[];
  isActive?: boolean;
  // Note: roleId and permissionIds should be assigned separately after admin creation
  // via POST /admin/roles/assign and POST /admin/permissions/assign
}

export interface UpdateAdminRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  countryCode?: string; // Optional: e.g., "+1", "+91"
  location?: string;
  bio?: string;
  permissions?: number[];
  isActive?: boolean;
  // Note: roleId and permissionIds should be assigned separately after admin update
  // via POST /admin/roles/assign and POST /admin/permissions/assign
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

// Address Types
export interface BusinessAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
}

// Settings Types
export interface SiteSettings {
  _id?: string;
  key?: string;
  siteName: string;
  siteUrl: string;
  siteDescription?: string;
  businessEmail: string;
  adminEmail: string;
  timezone?: string;
  contactNumber: string;
  businessAddress: BusinessAddress;
  businessHours?: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  logoUrl?: string;
  faviconUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
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

export interface CreateUserRequest {
  userName: string;
  isActive: boolean;
  status: string;
  contactNumber: string | number;
  email?: string;
  profileScore: string | number;
  gender?: string;
  city?: string;
};

export interface TableSortingInterface {
    children: React.ReactNode;
    sortKey: string;
    currentSortKey: string;
    currentDirection: 'asc' | 'desc';
    onSort: (key: string) => void;
};

export interface UserListInterface {
    id: number;
    name: string;
    isActive: boolean;
    status: string;
    contact: string;
    email: string;
    profileScore : string,
    gender: string;
    city: string;
};

// User Management API Types
export interface StageInfo {
  code: string;
  label: string;
}

export interface FundingRangeInfo {
  code: string;
  label: string;
}

export interface TeamSizeInfo {
  code: string;
  label: string;
}

export interface RevenueStatusInfo {
  code: string;
  label: string;
}

export interface IncorporationStatusInfo {
  code: string;
  label: string;
}

export interface UserListItem {
  id: string; // UUID string from backend
  email: string | null;
  countryCode: string;
  countryName: string | null;
  stateCode: string | null;
  stateName: string | null;
  cityName: string | null;
  stage: StageInfo | null;
  fundingRange: FundingRangeInfo | null;
  teamSize: TeamSizeInfo | null;
  revenueStatus: RevenueStatusInfo | null;
  incorporationStatus: IncorporationStatusInfo | null;
  isEmailVerified: boolean;
  isOnboardingCompleted: boolean;
  emailVerifiedAt: string | null;
  termsAcceptedAt: string | null;
  onboardingCompletedAt: string | null;
  lastLoginAt: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  isPaused: boolean;
  pausedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Legacy fields (may not be in new API response, kept for backward compatibility)
  uuid?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: 'm' | 'f' | 'o';
  dob?: string | null;
  profilePic?: string | null;
  profileImages?: string[];
  isPhoneVerified?: boolean;
  isFaceVerified?: boolean;
  isAccountPaused?: boolean;
  isBanned?: boolean;
  accountCurrentStatus?: number;
  accountStatusName?: string;
  accountStatusDescription?: string;
  // Legacy flat structure (for backward compatibility)
  stageId?: number | null;
  stageLabel?: string | null;
  stageCode?: string | null;
  fundingRangeId?: number | null;
  teamSizeId?: number | null;
  revenueStatusId?: number | null;
  incorporationStatusId?: number | null;
}

export interface UserProfile {
  height: number | null;
  education: string | null;
  relationshipGoal: string | null;
  voiceUrl: string | null;
  bio: string | null;
}

export interface UserAddress {
  cityId: number | null;
  cityName: string | null;
  countryId: number | null;
  lat: string | number | null; // Can be string or number
  long: string | number | null; // Can be string or number
  location: string | null;
  isVerified: boolean;
}

export interface UserInteractions {
  receivedLikes: number;
  givenLikes: number;
  receivedSuperLikes: number;
  givenSuperLikes: number;
  passes: number;
  blocks: number;
}

export interface PlanFeature {
  label: string;
  limit?: number;
  featureId?: number;
  accessible?: boolean;
  period?: string;
}

export interface UserSubscription {
  id: number;
  subscriptionId: string;
  planId: number;
  planName: string;
  planPrice: number;
  planDuration: string;
  planFeatures: string[] | PlanFeature[]; // Can be array of strings or objects
  periodType: 'month' | 'week';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export interface UserDetails extends UserListItem {
  isPausedByUser: boolean;
  profile: UserProfile;
  address: UserAddress;
  interactions: UserInteractions;
  subscriptions: UserSubscription[];
  firstPlan: UserSubscription | null;
}

export interface UpdateUserRequest {
  // Business fields (using codes)
  stageCode?: string;
  fundingRangeCode?: string;
  teamSizeCode?: string;
  revenueStatusCode?: string;
  incorporationStatusCode?: string;
  // Location fields
  countryCode?: string;
  stateCode?: string;
  cityName?: string;
  // Verification fields
  isEmailVerified?: boolean;
  isOnboardingCompleted?: boolean;
  // Legacy fields (for backward compatibility)
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dob?: string;
  gender?: 'm' | 'f' | 'o';
  isPhoneVerified?: boolean;
  isFaceVerified?: boolean;
  isAccountPaused?: boolean;
  accountCurrentStatus?: number;
  stageId?: number;
  fundingRangeId?: number;
  teamSizeId?: number;
  revenueStatusId?: number;
  incorporationStatusId?: number;
}

export interface UserListResponse {
  data: UserListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  stage?: string | number; // Filter by stage (stageId or stageCode)
  gender?: 'm' | 'f' | 'o';
  status?: string; // Legacy support
  fields?: string; // Comma-separated list of fields to return (e.g., "id,email,countryCode,countryName,stateCode,stateName,cityName,stage,isEmailVerified,isOnboardingCompleted,createdAt")
}

export interface DeleteUserRequest {
  deletionReason?: string;
}

// Face Verification Types
export type VerificationStatus = 'pending' | 'processing' | 'success' | 'failed' | 'timeout' | 'cancelled';
export type ComputedStatus = 'Success' | 'Failed' | 'Processing';
export type ReverifyPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface VerificationUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePic?: string;
  isFaceVerified: boolean;
}

export interface VerificationDetails {
  overallScore: number | string;
  confidence: number | string;
  matchCount: number;
  totalComparisons: number;
  isVerified: boolean;
}

export interface ProcessingMetadata {
  frameExtractionTime: number;
  comparisonTime: number;
  scoringTime: number;
  totalProcessingTime: number;
  videoDuration: number;
  framesExtracted: number;
}

export interface SecurityMetadata {
  adminNotes?: string;
  adminActionAt?: string;
}

export interface FaceVerification {
  id: number;
  userId: number;
  requestId: string;
  sessionId: string;
  verificationGroupId: number | null;
  verificationStatus: VerificationStatus;
  status: ComputedStatus;
  isVerified: boolean;
  retryCount: number;
  overallScore: number | string;
  confidence: number | string;
  matchCount: number;
  totalComparisons: number;
  videoUrl: string | null;
  videoDuration: number | null;
  framesExtracted: number | null;
  sourceImages: string[];
  sourceImageCount: number;
  totalProcessingTime: number | null;
  errorMessage?: string | null;
  errorCode?: string | null;
  errorType?: string | null;
  provider: string;
  providerVersion?: string;
  ipAddress?: string | null;
  userAgent?: string;
  deviceId?: string | null;
  location?: string | null;
  user: VerificationUser;
  createdAt: string;
  updatedAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  expiresAt?: string | null;
  verificationDetails: VerificationDetails;
  processingMetadata: ProcessingMetadata;
  securityMetadata: SecurityMetadata | null;
  retryAttempts?: RetryAttempt[];
}

export interface FaceVerificationListResponse {
  data: FaceVerification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface FaceVerificationListParams {
  page?: number;
  limit?: number;
  search?: string;
  userId?: number;
  verificationStatus?: VerificationStatus;
  status?: ComputedStatus;
  verificationGroupId?: number;
  isVerified?: boolean;
  minScore?: number;
  maxScore?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: 'created_at' | 'updated_at' | 'overall_score' | 'confidence' | 'user_id';
  sortOrder?: 'asc' | 'desc';
}

export interface ApprovalData {
  isApproved: boolean;
  adminNotes?: string;
  overrideScore?: number;
  overrideConfidence?: number;
}

export interface ApprovalResponse {
  id: number;
  verificationStatus: VerificationStatus;
  isVerified: boolean;
  updatedAt: string;
}

export interface ReverifyData {
  reason?: string;
  priority?: ReverifyPriority;
}

export interface ReverifyResponse {
  userId: number;
  requestId: string;
  status: string;
  message: string;
}

export interface FlaggedUser {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePic?: string;
  isFaceVerified: boolean;
  failedAttempts: number;
  createdAt: string;
  updatedAt: string;
}

export interface FlaggedUsersResponse {
  data: FlaggedUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface FlaggedUsersParams {
  page?: number;
  limit?: number;
  minFailedAttempts?: number;
}

export interface VerificationStatistics {
  total: number;
  pending: number;
  processing: number;
  success: number;
  failed: number;
  avgScore: number;
  avgConfidence: number;
  successRate: number;
}

export interface StatisticsParams {
  userId?: number;
  startDate?: string;
  endDate?: string;
}

export interface RetryAttempt {
  attemptNumber: number;
  id: number;
  requestId: string;
  sessionId: string;
  verificationStatus: VerificationStatus;
  status: ComputedStatus;
  isVerified: boolean;
  overallScore: number | string;
  confidence: number | string;
  matchCount: number;
  totalComparisons: number;
  videoUrl: string | null;
  videoDuration: number | null;
  framesExtracted: number | null;
  sourceImages: string[];
  sourceImageCount: number;
  totalProcessingTime: number | null;
  errorMessage?: string | null;
  errorCode?: string | null;
  errorType?: string | null;
  provider: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  verificationDetails?: VerificationDetails;
  processingMetadata?: ProcessingMetadata;
  securityMetadata?: SecurityMetadata | null;
}

export interface RetryHistoryResponse {
  verificationGroupId: number;
  totalRetries: number;
  finalStatus: ComputedStatus;
  finalIsVerified: boolean;
  finalOverallScore: number | string;
  finalConfidence: number | string;
  attempts: RetryAttempt[];
}

export interface PaginationControlInterface {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions: number[];
  startItem: number;
  endItem: number;
  visiblePages: (number | string)[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export interface ManualVerificationRequest {
  isVerified: boolean;
  adminNotes?: string;
}

export interface ManualVerificationUser {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isFaceVerified: boolean;
  accountCurrentStatus: number;
  accountStatusName: string;
  updatedAt: string;
}

export interface ManualVerificationVerification {
  id: number;
  requestId: string;
  isVerified: boolean;
  verificationStatus: string;
  overallScore: number;
  confidence: number;
  updatedAt: string;
}

export interface ManualVerificationResponse {
  user: ManualVerificationUser;
  verification: ManualVerificationVerification | null;
  action: 'verified' | 'de-verified';
  message: string;
}

// Activity Logs Types
export type ActivityType = 'create' | 'update' | 'delete' | 'view' | 'login' | 'logout' | 'other';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

export type ActivityLogSortField = 'timestamp' | 'admin_id';

export type SortOrder = 'asc' | 'desc';

export interface ActivityLog {
  id: string;
  adminId: string;
  action: string;
  entity?: string;
  entityName?: string;
  type: ActivityType;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string; // ISO 8601 format
  endpoint?: string;
  httpMethod?: HttpMethod;
  feature?: string;
  statusCode?: number;
  requestBody?: Record<string, any>;
  responseTimeMs?: number;
}

export interface ActivityLogQueryParams {
  page?: number;
  limit?: number;
  adminId?: string; // UUID
  search?: string; // Search by admin user name (first name, last name, or email)
  httpMethod?: HttpMethod;
  startDate?: string; // ISO 8601 or YYYY-MM-DD
  endDate?: string; // ISO 8601 or YYYY-MM-DD
  sortBy?: ActivityLogSortField;
  sortOrder?: SortOrder;
}

export interface AdminUser {
  id: string; // UUID
  email: string;
  firstName: string;
  lastName: string;
  fullName: string; // firstName + lastName or email if name is empty
}

export interface AdminUsersResponse {
  users: AdminUser[];
}

export interface ActivityLogsResponse {
  data: ActivityLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FeaturesResponse {
  features: string[];
}

export interface ActivityStats {
  feature: string;
  count: number;
  avgResponseTime: number;
}

export interface ActivityStatsResponse {
  stats: ActivityStats[];
}

export const FEATURES = {
  USER_MANAGEMENT: 'user-management',
  ADMIN_MANAGEMENT: 'admin-management',
  ADMIN_ROLE: 'admin-role',
  ADMIN_PERMISSION: 'admin-permission',
  ADMIN_PROFILE: 'admin-profile',
  ADMIN_SETTINGS: 'admin-settings',
  REPORTS: 'reports',
  FACE_VERIFICATION: 'face-verification',
  DASHBOARD: 'dashboard',
  DASHBOARD_ANALYTICS: 'dashboard-analytics',
} as const;

// Onboarding Management - Reference Data Types
export interface ReferenceDataItem {
  id: number;
  code: string;
  label: string;
  description?: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Stage extends ReferenceDataItem {}
export interface Industry extends ReferenceDataItem {}
export interface FundingRange extends ReferenceDataItem {}
export interface TeamSize extends ReferenceDataItem {}

export interface CreateReferenceDataRequest {
  code: string;
  label: string;
  description?: string;
  sortOrder: number;
  active?: boolean;
}

export interface UpdateReferenceDataRequest {
  code?: string;
  label?: string;
  description?: string;
  sortOrder?: number;
  active?: boolean;
}

export interface ReferenceDataQueryParams {
  includeInactive?: boolean;
}

// Investors Management Types
export interface PortfolioHighlights {
  description?: string;
  totalInvestments?: number;
  averageTicketSize?: number;
  notable_investments?: string[];
  focus_areas?: string[];
}

export interface GeographicalPreferenceItem {
  city: string;
  state: string;
  country: string;
  priority: number;
}

export interface GeographicalPreferences {
  cities?: string[];
  states?: string[];
  countries?: string[];
}

export interface StageInfo {
  id: number;
  code: string;
  label: string;
  description?: string;
}

export interface FundInfo {
  amount: number;
  currency: string;
  formatted_amount?: string;
  type: string | null;
  source: string;
}

export interface StatusInfo {
  value: number;
  label: string;
}

export interface Timestamps {
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: string;
  investor_id: string;
  stage_preference_id: number;
  // Nested structure
  stage?: StageInfo;
  fund?: FundInfo;
  status?: StatusInfo;
  timestamps?: Timestamps;
  geographical_preferences?: GeographicalPreferenceItem[];
  geographical_preferences_formatted?: string | null;
  // Flat structure (for backward compatibility)
  stage_code?: string;
  stage_label?: string;
  geographical_preferences_flat?: GeographicalPreferences | null;
  fund_amount: number;
  fund_currency: string;
  fund_type: string | null;
  fund_source: string;
  status_value?: number;
  status: number | StatusInfo;
  created_at: string;
  updated_at: string;
}

export interface Investor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country_code: string;
  country_name: string;
  state_code: string;
  state_name: string;
  city_name: string;
  portfolio_highlights: PortfolioHighlights | null;
  status: number;
  website: string | null;
  created_at: string;
  updated_at: string;
  investment_count: number;
}

export interface InvestorDetails extends Investor {
  investments: Investment[];
}

export interface InvestorsListResponse {
  investors: Investor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface InvestorsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  country_code?: string;
  state_code?: string;
  city_name?: string;
  status?: string;
  min_investment_count?: number;
  max_investment_count?: number;
  sort_by?: 'created_at' | 'updated_at' | 'name' | 'email' | 'investment_count';
  sort_order?: 'asc' | 'desc';
}

// Plans & Features Management Types
export interface Feature {
  id: number;
  key: string;
  name: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlanFeature {
  id: number;
  key: string;
  name: string;
  description?: string | null;
  included: boolean;
  sortOrder: number;
}

export interface Plan {
  id: number;
  code: string;
  name: string;
  priceCents: number;
  interval: string;
  currency: string;
  stripePriceId?: string | null;
  ctaLabel?: string | null;
  badge?: string | null;
  sortOrder: number;
  isActive: boolean;
  features?: PlanFeature[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeatureRequest {
  key: string;
  name: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateFeatureRequest {
  name?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreatePlanRequest {
  code: string;
  name: string;
  priceCents: number;
  interval: string;
  currency?: string;
  stripePriceId?: string;
  ctaLabel?: string;
  badge?: string;
  sortOrder?: number;
  isActive?: boolean;
  featureIds?: number[];
}

export interface UpdatePlanRequest {
  name?: string;
  priceCents?: number;
  interval?: string;
  currency?: string;
  stripePriceId?: string;
  ctaLabel?: string;
  badge?: string;
  sortOrder?: number;
  isActive?: boolean;
  featureIds?: number[];
}

export interface AssociateFeaturesRequest {
  featureIds: number[];
}

export interface FeaturesListResponse {
  data: Feature[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface PlansListResponse {
  data: Plan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface FeatureStats {
  total: number;
  active: number;
  inactive: number;
}

export interface PlanStats {
  total: number;
  active: number;
  inactive: number;
}

export interface FeaturesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string; // "true" or "false"
}

export interface PlansQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string; // "true" or "false"
}