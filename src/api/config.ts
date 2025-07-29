// API Configuration
export const API_CONFIG = {
  // Base URL for API calls - production server
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://43.204.103.195:3000/admin',
  
  // Default timeout for API requests (in milliseconds)
  TIMEOUT: 10000,
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // API endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      PROFILE: '/profile',
    },
    USERS: {
      LIST: '/users',
      CREATE: '/users',
      UPDATE: '/users/:id',
      DELETE: '/users/:id',
      PROFILE: '/users/profile',
    },
    PRODUCTS: {
      LIST: '/products',
      CREATE: '/products',
      UPDATE: '/products/:id',
      DELETE: '/products/:id',
      DETAILS: '/products/:id',
    },
    CONTENT: {
      PAGES: '/content/pages',
      UPDATE_PAGE: '/content/pages/:id',
      SETTINGS: '/content/settings',
      ABOUT_US: '/content/about-us',
      ADVERTISEMENTS: '/content/advertisements',
    },
    ENQUIRIES: {
      LIST: '/enquiries',
      CREATE: '/enquiries',
      UPDATE: '/enquiries/:id',
      DELETE: '/enquiries/:id',
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