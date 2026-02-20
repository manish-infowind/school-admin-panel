/**
 * API Services Index
 * 
 * Centralized exports for all API services.
 * This provides a clean, modular interface for importing services throughout the application.
 */

// Profile Services
export { profileService } from './profileService';
export type {
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest as ProfileChangePasswordRequest,
  VerifyOtpRequest,
  ResetPasswordRequest,
  ResetPasswordConfirmRequest,
  TwoFactorSetupRequest,
  TwoFactorEnableRequest,
  TwoFactorDisableRequest,
  UserActivity,
  UpdatePreferencesRequest,
  ApiResponse as ProfileApiResponse,
} from './profileService';

// Site Settings Services
export { SiteSettingsService } from './siteSettingsService';

// Password Services
export { PasswordService } from './passwordService';

// Auth Services
export { AuthService } from './authService';

// User Management Services
export { UserManagementService } from './userManagementService';

// Dashboard Services
export { DashboardService } from './dashboardService';

// Admin Management Services
export { AdminManagementService } from './adminManagementService';

// Role Services
export { RoleService } from './roleService';

// Permission Services
export { PermissionService } from './permissionService';

// Onboarding Management Services
export { OnboardingService } from './onboardingService';

// Investors Management Services
export { InvestorsService } from './investorsService';