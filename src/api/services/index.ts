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
  VerifyOtpRequest,
  ResetPasswordRequest,
  ResetPasswordConfirmRequest,
  TwoFactorEnableRequest,
  TwoFactorDisableRequest,
  ApiResponse as ProfileApiResponse,
} from './profileService';

// Password Services
export { PasswordService } from './passwordService';

// Auth Services
export { AuthService } from './authService';

// Dashboard Services
export { DashboardService } from './dashboardService';

// Location (countries, states, cities)
export { LocationService } from './locationService';

// Colleges & Enquiries
export {
  CollegeService,
  AdminDashboardService,
  EnquiryService,
} from './collegeService';

// Courses
export { CourseService, getCoursesPublic } from './courseService';

// Events
export { EventService } from './eventService';