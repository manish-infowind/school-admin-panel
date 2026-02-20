// Export configuration
export * from './config';
export * from './types';

// Export API client
export { default as apiClient } from './client';

// Export services
export { AuthService } from './services/authService';
export { PasswordService } from './services/passwordService';
export { profileService } from './services/profileService';
export { UserManagementService } from './services/userManagementService';
export { DashboardService } from './services/dashboardService';
export { SiteSettingsService } from './services/siteSettingsService';
export { AdminManagementService } from './services/adminManagementService';
export { RoleService } from './services/roleService';
export { PermissionService } from './services/permissionService';
export { OnboardingService } from './services/onboardingService';
export { InvestorsService } from './services/investorsService';

// Export onboarding hooks
export {
  useStages,
  useStage,
  useCreateStage,
  useUpdateStage,
  useDeleteStage,
  useIndustries,
  useIndustry,
  useCreateIndustry,
  useUpdateIndustry,
  useDeleteIndustry,
  useFundingRanges,
  useFundingRange,
  useCreateFundingRange,
  useUpdateFundingRange,
  useDeleteFundingRange,
  useTeamSizes,
  useTeamSize,
  useCreateTeamSize,
  useUpdateTeamSize,
  useDeleteTeamSize,
} from './hooks/useOnboarding';

// Export investor hooks
export {
  useInvestors,
  useInvestor,
} from './hooks/useInvestors';

// Export hooks
export { useProfile } from './hooks/useProfile';
export { useSiteSettings } from './hooks/useSiteSettings';
export { useUserManagement } from './hooks/useUserManagement';
export { useAdminManagement } from './hooks/useAdminManagement';
export { useRoles, useAdminRoles, useRolePermissions } from './hooks/useRoles';
export { usePermissions, useAdminPermissions } from './hooks/usePermissions';