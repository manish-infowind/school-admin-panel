# API System Documentation

## Overview

This API system provides a complete solution for handling API calls, state management, and authentication in the MedoScopic Pharma admin panel. It uses React Query (TanStack Query) for efficient caching and state management.

## Structure

```
src/api/
├── config.ts              # API configuration and endpoints
├── types.ts               # TypeScript interfaces and types
├── client.ts              # Main API client with error handling
├── index.ts               # Main exports
├── services/              # Service layer for different API domains
│   ├── authService.ts     # Authentication operations
│   ├── productService.ts  # Product management
│   ├── contentService.ts  # Content management
│   └── enquiryService.ts  # Enquiry management
└── hooks/                 # React Query hooks
    ├── useAuth.ts         # Authentication hooks
    └── useProducts.ts     # Product management hooks
```

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### API Endpoints

All endpoints are configured in `config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      PROFILE: '/auth/profile',
    },
    // ... other endpoints
  },
}
```

## Usage Examples

### Authentication

```typescript
import { useAuth } from '@/api/hooks/useAuth';

const LoginComponent = () => {
  const { login, isLoggingIn, loginError, isAuthenticated } = useAuth();

  const handleLogin = (email: string, password: string) => {
    login({ email, password });
  };

  // Handle success/error states
  if (isAuthenticated) {
    // Redirect to dashboard
  }

  if (loginError) {
    // Show error message
  }
};
```

### Product Management

```typescript
import { useProducts, useProduct } from '@/api/hooks/useProducts';

const ProductList = () => {
  const { 
    products, 
    isLoading, 
    createProduct, 
    updateProduct, 
    deleteProduct 
  } = useProducts({ page: 1, limit: 10 });

  const handleCreate = (productData) => {
    createProduct(productData);
  };

  const handleUpdate = (id, data) => {
    updateProduct({ id, data });
  };
};

const ProductDetail = ({ id }) => {
  const { product, isLoading, refetch } = useProduct(id);
};
```

### Content Management

```typescript
import { ContentService } from '@/api/services/contentService';

const ContentEditor = () => {
  const updatePage = async (id, content) => {
    try {
      const response = await ContentService.updatePage(id, content);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };
};
```

## Features

### 1. **Automatic Token Management**
- JWT tokens are automatically stored in localStorage
- Automatic token refresh on expiration
- Automatic logout on authentication failure

### 2. **Error Handling**
- Comprehensive error types and messages
- Network error handling
- Timeout handling
- Validation error handling

### 3. **Caching & State Management**
- React Query for efficient caching
- Automatic cache invalidation
- Optimistic updates
- Background refetching

### 4. **File Upload Support**
- Built-in FormData handling
- Image upload for products
- Progress tracking support

### 5. **Pagination & Filtering**
- Built-in pagination support
- Query parameter handling
- Search functionality
- Sorting and filtering

## API Response Format

All API responses follow this format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## Error Handling

The system handles various error types:

```typescript
export const API_ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};
```

## Integration with Components

### Protected Routes

```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

<Route
  path="/admin"
  element={
    <ProtectedRoute>
      <AdminLayout>
        <Dashboard />
      </AdminLayout>
    </ProtectedRoute>
  }
/>
```

### Loading States

```typescript
const { isLoading, isCreating, isUpdating } = useProducts();

if (isLoading) {
  return <LoadingSpinner />;
}

if (isCreating) {
  return <CreatingSpinner />;
}
```

## Best Practices

1. **Always use the hooks** instead of calling services directly
2. **Handle loading states** in your components
3. **Use error boundaries** for error handling
4. **Implement proper validation** before API calls
5. **Use optimistic updates** for better UX
6. **Cache data appropriately** using React Query's staleTime

## Adding New Services

1. Create a new service file in `services/`
2. Define types in `types.ts`
3. Add endpoints to `config.ts`
4. Create hooks in `hooks/`
5. Export from `index.ts`

Example:

```typescript
// services/newService.ts
export class NewService {
  static async getData() {
    return apiClient.get('/new-endpoint');
  }
}

// hooks/useNewData.ts
export const useNewData = () => {
  return useQuery({
    queryKey: ['newData'],
    queryFn: () => NewService.getData(),
  });
};
```

## Testing

The API system is designed to be easily testable:

```typescript
// Mock API responses
jest.mock('@/api/services/authService', () => ({
  AuthService: {
    login: jest.fn(),
    logout: jest.fn(),
  },
}));

// Test hooks
const { result } = renderHook(() => useAuth());
```

This API system provides a robust foundation for your admin panel with proper error handling, caching, and state management. 