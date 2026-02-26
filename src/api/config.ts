// API Configuration
export const API_CONFIG = {
  // Base URL for API calls - production server
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/admin',

  // Default timeout for API requests (in milliseconds)
  TIMEOUT: 10000,
  // Extended timeout for analytics requests (2 minutes)
  ANALYTICS_TIMEOUT: 120000,

  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  // API endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      VERIFY_2FA: '/auth/verify-2fa',
    },
    PASSWORD: {
      FORGOT: '/forgot-password',
      RESET: '/reset-password',
      CHANGE: '/change-password',
    },
    ADMIN_PROFILE: {
      PROFILE: '/admin-profile',
      PROFILE_AVATAR: '/admin-profile/avatar',
      PROFILE_PASSWORD: '/admin-profile/password',
      PROFILE_PASSWORD_VERIFY_OTP: '/admin-profile/password/verify-otp',
      PROFILE_PASSWORD_RESET_REQUEST: '/admin-profile/password/reset-request',
      PROFILE_PASSWORD_RESET: '/admin-profile/password/reset',
      PROFILE_2FA_ENABLE: '/admin-profile/2fa/enable',
      PROFILE_2FA_DISABLE: '/admin-profile/2fa/disable',
    },
    DASHBOARD: {
      MAIN: '/dashboard',
      STATS: '/dashboard/stats',
      STATS_SUMMARY: '/dashboard/stats/summary',
      USER_GROWTH: '/dashboard/analytics/user-growth',
      USER_GROWTH_SYNC: '/dashboard/analytics/user-growth/sync',
      ACTIVE_USERS: '/dashboard/analytics/active-users',
      CONVERSIONS: '/dashboard/analytics/conversions',
      ANALYTICS_REFRESH: '/dashboard/analytics/refresh',
    },
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
