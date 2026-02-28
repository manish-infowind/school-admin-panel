// API Configuration
// Base URL: no trailing slash. Admin and public paths under /api/...
export const API_CONFIG = {
  // Base URL for API calls (backend root)
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',

  // Default timeout for API requests (in milliseconds)
  TIMEOUT: 10000,
  // Extended timeout for analytics requests (2 minutes)
  ANALYTICS_TIMEOUT: 120000,

  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  // API endpoints (paths only; base URL is prepended by client)
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/admin/auth/login',
      LOGOUT: '/api/admin/auth/logout',
      REFRESH: '/api/admin/auth/refresh',
      VERIFY_2FA: '/api/admin/auth/verify-2fa',
    },
    PASSWORD: {
      FORGOT: '/api/admin/forgot-password',
      RESET: '/api/admin/reset-password',
      CHANGE: '/api/admin/change-password',
    },
    ADMIN_PROFILE: {
      PROFILE: '/api/admin/admin-profile',
      PROFILE_AVATAR: '/api/admin/admin-profile/avatar',
      PROFILE_PASSWORD: '/api/admin/admin-profile/password',
      PROFILE_PASSWORD_VERIFY_OTP: '/api/admin/admin-profile/password/verify-otp',
      PROFILE_PASSWORD_RESET_REQUEST: '/api/admin/admin-profile/password/reset-request',
      PROFILE_PASSWORD_RESET: '/api/admin/admin-profile/password/reset',
      PROFILE_2FA_ENABLE: '/api/admin/admin-profile/2fa/enable',
      PROFILE_2FA_DISABLE: '/api/admin/admin-profile/2fa/disable',
    },
    DASHBOARD: {
      MAIN: '/api/admin/dashboard',
      STATS: '/api/admin/dashboard/stats',
      STATS_SUMMARY: '/api/admin/dashboard/stats/summary',
      USER_GROWTH: '/api/admin/dashboard/analytics/user-growth',
      USER_GROWTH_SYNC: '/api/admin/dashboard/analytics/user-growth/sync',
      ACTIVE_USERS: '/api/admin/dashboard/analytics/active-users',
      CONVERSIONS: '/api/admin/dashboard/analytics/conversions',
      ANALYTICS_REFRESH: '/api/admin/dashboard/analytics/refresh',
    },
    // Public (no auth)
    COUNTRIES: '/api/countries',
    STATES_PUBLIC: '/api/states',
    CITIES_PUBLIC: '/api/cities',
    COURSES_PUBLIC: '/api/courses',
    // Admin location, colleges & courses
    STATES: '/api/admin/states',
    CITIES: '/api/admin/cities',
    COLLEGES: '/api/admin/colleges',
    COURSES: '/api/admin/courses',
    ENQUIRIES: '/api/admin/enquiries',
    UPLOAD: '/api/admin/upload',
  },
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// API Error Types
export const API_ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;
