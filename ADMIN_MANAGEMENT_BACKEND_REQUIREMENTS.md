# Admin Management - Backend API Requirements

## Base URL
```
http://localhost:8000/admin
```

**All endpoints require authentication:**
```
Authorization: Bearer {access_token}
```

---

## Table of Contents

1. [Admin Management APIs](#admin-management-apis)
2. [Role Assignment APIs](#role-assignment-apis)
3. [Permission Assignment APIs](#permission-assignment-apis)
4. [Data Structures](#data-structures)

---

## Admin Management APIs

### 1. Get All Admins (with Pagination & Filters)

**Endpoint:** `GET /admin/admin-management`

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `search` (string, optional): Search by name, email, or username
- `role` (string, optional): Filter by role (`admin`, `super_admin`)
- `status` (string, optional): Filter by status (`active`, `inactive`)

**cURL Command:**
```bash
curl -X GET "http://localhost:8000/admin/admin-management?page=1&limit=10&search=john&role=admin&status=active" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Admins fetched successfully",
  "data": {
    "data": [
      {
        "id": "uuid",
        "username": "john_doe",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "admin",
        "phone": "+1234567890",
        "location": "New York, USA",
        "bio": "Administrator with 5 years experience",
        "profilePic": "https://example.com/profile.jpg",
        "isActive": true,
        "twoFactorEnabled": false,
        "permissions": ["admin_management", "role_management"],
        "roles": [
          {
            "id": 1,
            "roleName": "admin",
            "description": "Administrator role"
          }
        ],
        "lastLogin": "2024-12-17T10:30:00.000Z",
        "createdAt": "2024-01-15T08:00:00.000Z",
        "updatedAt": "2024-12-17T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Error Response (401):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

### 2. Get Admin Statistics

**Endpoint:** `GET /admin/admin-management/stats`

**cURL Command:**
```bash
curl -X GET http://localhost:8000/admin/admin-management/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Admin statistics fetched successfully",
  "data": {
    "total": 50,
    "superAdmins": 2,
    "admins": 48,
    "active": 45,
    "inactive": 5,
    "online": 12
  }
}
```

---

### 3. Get Admin Details

**Endpoint:** `GET /admin/admin-management/{id}`

**Path Parameters:**
- `id` (string, required): UUID of the admin user

**cURL Command:**
```bash
curl -X GET http://localhost:8000/admin/admin-management/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Admin details fetched successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin",
    "phone": "+1234567890",
    "location": "New York, USA",
    "bio": "Administrator with 5 years experience",
    "profilePic": "https://example.com/profile.jpg",
    "isActive": true,
    "twoFactorEnabled": false,
    "permissions": ["admin_management", "role_management"],
    "roles": [
      {
        "id": 1,
        "roleName": "admin",
        "description": "Administrator role"
      }
    ],
    "lastLogin": "2024-12-17T10:30:00.000Z",
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-12-17T10:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "statusCode": 404,
  "message": "Admin user not found"
}
```

---

### 4. Create Admin

**Endpoint:** `POST /admin/admin-management`

**Request Body:**
```json
{
  "username": "jane_doe",
  "email": "jane@example.com",
  "password": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "admin",
  "phone": "+1234567890",
  "location": "Los Angeles, USA",
  "bio": "New administrator",
  "permissions": ["admin_management", "role_management"],
  "isActive": true
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:8000/admin/admin-management \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "username": "jane_doe",
    "email": "jane@example.com",
    "password": "SecurePass123!",
    "firstName": "Jane",
    "lastName": "Doe",
    "role": "admin",
    "phone": "+1234567890",
    "location": "Los Angeles, USA",
    "bio": "New administrator",
    "permissions": ["admin_management", "role_management"],
    "isActive": true
  }'
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Admin created successfully",
  "data": {
    "id": "uuid",
    "username": "jane_doe",
    "email": "jane@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "role": "admin",
    "phone": "+1234567890",
    "location": "Los Angeles, USA",
    "bio": "New administrator",
    "profilePic": null,
    "isActive": true,
    "twoFactorEnabled": false,
    "permissions": ["admin_management", "role_management"],
    "roles": [],
    "lastLogin": null,
    "createdAt": "2024-12-17T10:30:00.000Z",
    "updatedAt": "2024-12-17T10:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "statusCode": 400,
  "message": "Email already exists"
}
```

**Validation Rules:**
- `username`: Required, unique, alphanumeric with underscores
- `email`: Required, unique, valid email format
- `password`: Required, minimum 8 characters, must contain uppercase, lowercase, number, and special character
- `firstName`: Required, string
- `lastName`: Required, string
- `role`: Required, must be `admin` or `super_admin`
- `phone`: Required, string
- `location`: Required, string
- `bio`: Optional, string
- `permissions`: Optional, array of permission names
- `isActive`: Optional, boolean (default: true)

---

### 5. Update Admin

**Endpoint:** `PUT /admin/admin-management/{id}`

**Path Parameters:**
- `id` (string, required): UUID of the admin user

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+9876543210",
  "location": "San Francisco, USA",
  "bio": "Updated bio",
  "permissions": ["admin_management", "role_management", "permission_management"],
  "isActive": true
}
```

**cURL Command:**
```bash
curl -X PUT http://localhost:8000/admin/admin-management/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+9876543210",
    "location": "San Francisco, USA",
    "bio": "Updated bio",
    "permissions": ["admin_management", "role_management", "permission_management"],
    "isActive": true
  }'
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Admin updated successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "jane_doe",
    "email": "jane@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "admin",
    "phone": "+9876543210",
    "location": "San Francisco, USA",
    "bio": "Updated bio",
    "profilePic": null,
    "isActive": true,
    "twoFactorEnabled": false,
    "permissions": ["admin_management", "role_management", "permission_management"],
    "roles": [],
    "lastLogin": null,
    "createdAt": "2024-12-17T10:30:00.000Z",
    "updatedAt": "2024-12-17T11:00:00.000Z"
  }
}
```

**Note:** 
- `username`, `email`, and `role` cannot be updated via this endpoint
- `permissions` array replaces all existing permissions (use role assignment for role-based permissions)

---

### 6. Delete Admin

**Endpoint:** `DELETE /admin/admin-management/{id}`

**Path Parameters:**
- `id` (string, required): UUID of the admin user

**cURL Command:**
```bash
curl -X DELETE http://localhost:8000/admin/admin-management/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Admin deleted successfully",
  "data": null
}
```

**Error Response (400):**
```json
{
  "statusCode": 400,
  "message": "Cannot delete super admin"
}
```

**Error Response (404):**
```json
{
  "statusCode": 404,
  "message": "Admin user not found"
}
```

---

### 7. Toggle Admin Status

**Endpoint:** `PUT /admin/admin-management/{id}/toggle-status`

**Path Parameters:**
- `id` (string, required): UUID of the admin user

**cURL Command:**
```bash
curl -X PUT http://localhost:8000/admin/admin-management/123e4567-e89b-12d3-a456-426614174000/toggle-status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Admin status toggled successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "isActive": false,
    "updatedAt": "2024-12-17T11:00:00.000Z"
  }
}
```

**Note:** Toggles `isActive` between `true` and `false`

---

### 8. Change Admin Password

**Endpoint:** `PUT /admin/admin-management/{id}/password`

**Path Parameters:**
- `id` (string, required): UUID of the admin user

**Request Body:**
```json
{
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**cURL Command:**
```bash
curl -X PUT http://localhost:8000/admin/admin-management/123e4567-e89b-12d3-a456-426614174000/password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "newPassword": "NewSecurePass123!",
    "confirmPassword": "NewSecurePass123!"
  }'
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Password changed successfully",
  "data": null
}
```

**Error Response (400):**
```json
{
  "statusCode": 400,
  "message": "Passwords do not match"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

---

## Role Assignment APIs

### 9. Assign Role to Admin

**Endpoint:** `POST /admin/roles/assign`

**Request Body:**
```json
{
  "adminId": "123e4567-e89b-12d3-a456-426614174000",
  "roleId": 1
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:8000/admin/roles/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "adminId": "123e4567-e89b-12d3-a456-426614174000",
    "roleId": 1
  }'
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Role assigned successfully",
  "data": {
    "adminId": "123e4567-e89b-12d3-a456-426614174000",
    "roles": [
      {
        "id": 1,
        "roleName": "admin",
        "description": "Administrator role"
      }
    ]
  }
}
```

**Error Response (400):**
```json
{
  "statusCode": 400,
  "message": "Cannot assign role to super admin. Super admin has all permissions by default."
}
```

**Note:** 
- If role is already assigned, it should not create duplicate
- Super admins cannot have roles assigned
- This endpoint can be called multiple times to assign multiple roles (or use array of roleIds if backend supports it)

---

### 10. Get Admin Roles

**Endpoint:** `GET /admin/admins/{adminId}/roles`

**Path Parameters:**
- `adminId` (string, required): UUID of the admin user

**cURL Command:**
```bash
curl -X GET http://localhost:8000/admin/admins/123e4567-e89b-12d3-a456-426614174000/roles \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Admin roles fetched successfully",
  "data": {
    "adminId": "123e4567-e89b-12d3-a456-426614174000",
    "isSuperAdmin": false,
    "roles": [
      {
        "id": 1,
        "roleName": "admin",
        "description": "Administrator role"
      },
      {
        "id": 2,
        "roleName": "moderator",
        "description": "Moderator role"
      }
    ]
  }
}
```

---

### 11. Remove Role from Admin (Optional - if needed)

**Endpoint:** `DELETE /admin/roles/assign` or `DELETE /admin/admins/{adminId}/roles/{roleId}`

**Note:** If not implemented, frontend can work without this. Roles can be managed by reassigning.

---

## Permission Assignment APIs

### 12. Assign Permissions to Admin

**Endpoint:** `POST /admin/permissions/assign`

**Request Body:**
```json
{
  "adminId": "123e4567-e89b-12d3-a456-426614174000",
  "permissionIds": [1, 2, 3]
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:8000/admin/permissions/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "adminId": "123e4567-e89b-12d3-a456-426614174000",
    "permissionIds": [1, 2, 3]
  }'
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Permissions assigned successfully",
  "data": {
    "adminId": "123e4567-e89b-12d3-a456-426614174000",
    "permissions": [
      {
        "permissionName": "admin_management"
      },
      {
        "permissionName": "role_management"
      },
      {
        "permissionName": "permission_management"
      }
    ]
  }
}
```

**Error Response (400):**
```json
{
  "statusCode": 400,
  "message": "Cannot assign permissions to super admin. Super admin has all permissions by default."
}
```

**Note:** 
- This replaces all existing direct permissions (not role-based permissions)
- Super admins cannot have permissions assigned
- Permissions from roles are separate and combined when fetching admin permissions

---

### 13. Get Admin Permissions

**Endpoint:** `GET /admin/admins/{adminId}/permissions`

**Path Parameters:**
- `adminId` (string, required): UUID of the admin user

**cURL Command:**
```bash
curl -X GET http://localhost:8000/admin/admins/123e4567-e89b-12d3-a456-426614174000/permissions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Admin permissions fetched successfully",
  "data": {
    "adminId": "123e4567-e89b-12d3-a456-426614174000",
    "isSuperAdmin": false,
    "permissions": [
      {
        "permissionName": "admin_management"
      },
      {
        "permissionName": "role_management"
      }
    ]
  }
}
```

**Note:** This should return combined permissions from:
- Direct permissions (assigned via `/admin/permissions/assign`)
- Role-based permissions (from roles assigned to the admin)
- All deduplicated

---

## Data Structures

### AdminUser
```typescript
interface AdminUser {
  id: string;                    // UUID
  username: string;              // Unique
  email: string;                 // Unique
  firstName: string;
  lastName: string;
  role: 'admin' | 'super_admin';
  phone: string;
  location: string;
  bio?: string;
  profilePic?: string;
  isActive: boolean;
  twoFactorEnabled: boolean;
  permissions: string[];         // Array of permission names
  roles?: Array<{                // Array of role objects
    id: number;
    roleName: string;
    description?: string;
  }>;
  lastLogin?: string;             // ISO 8601 date string
  createdAt: string;              // ISO 8601 date string
  updatedAt: string;              // ISO 8601 date string
}
```

### CreateAdminRequest
```typescript
interface CreateAdminRequest {
  username: string;              // Required, unique
  email: string;                 // Required, unique, valid email
  password: string;              // Required, min 8 chars, must meet password requirements
  firstName: string;             // Required
  lastName: string;               // Required
  role: 'admin' | 'super_admin'; // Required
  phone: string;                 // Required
  location: string;              // Required
  bio?: string;                  // Optional
  permissions?: string[];        // Optional, array of permission names
  isActive?: boolean;            // Optional, default: true
}
```

### UpdateAdminRequest
```typescript
interface UpdateAdminRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  bio?: string;
  permissions?: string[];        // Replaces all existing direct permissions
  isActive?: boolean;
}
```

### ChangePasswordRequest
```typescript
interface ChangePasswordRequest {
  newPassword: string;           // Required, must meet password requirements
  confirmPassword: string;        // Required, must match newPassword
}
```

### AdminListResponse
```typescript
interface AdminListResponse {
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
```

### AdminStats
```typescript
interface AdminStats {
  total: number;                 // Total number of admins
  superAdmins: number;           // Number of super admins
  admins: number;                // Number of regular admins
  active: number;                // Number of active admins
  inactive: number;              // Number of inactive admins
  online: number;                // Number of currently online admins (optional)
}
```

### QueryParams (for GET /admin/admin-management)
```typescript
interface QueryParams {
  page?: number;                 // Default: 1
  limit?: number;                // Default: 10
  search?: string;               // Search in name, email, username
  role?: string;                 // Filter by role: 'admin' | 'super_admin'
  status?: string;                // Filter by status: 'active' | 'inactive'
}
```

---

## Important Notes

### 1. Permission System
- **Direct Permissions:** Assigned via `POST /admin/permissions/assign`
- **Role-Based Permissions:** Inherited from roles assigned via `POST /admin/roles/assign`
- **Combined Permissions:** When fetching admin permissions, combine both direct and role-based permissions
- **Super Admin:** Users with `role: 'super_admin'` automatically have all permissions

### 2. Role Assignment
- Admins can have multiple roles
- Roles are assigned via `POST /admin/roles/assign`
- Super admins cannot have roles assigned
- When fetching admin data, include `roles` array in response

### 3. Permission Assignment
- Direct permissions are assigned via `POST /admin/permissions/assign`
- This replaces all existing direct permissions (not role-based)
- Super admins cannot have permissions assigned
- When updating admin via `PUT /admin/admin-management/{id}`, the `permissions` field replaces all direct permissions

### 4. Search Functionality
- Search should work across: `firstName`, `lastName`, `email`, `username`
- Case-insensitive search
- Partial matching supported

### 5. Pagination
- Default page: 1
- Default limit: 10
- Calculate `totalPages` as `Math.ceil(total / limit)`
- `hasNextPage`: `page < totalPages`
- `hasPrevPage`: `page > 1`

### 6. Error Handling
- All errors should follow consistent format:
```json
{
  "statusCode": 400,
  "message": "Error message description"
}
```

### 7. Authentication
- All endpoints require Bearer token in Authorization header
- Return 401 if token is missing or invalid

---

## Quick Reference Table

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/admin/admin-management` | GET | Yes | Get all admins (with pagination & filters) |
| `/admin/admin-management/stats` | GET | Yes | Get admin statistics |
| `/admin/admin-management/{id}` | GET | Yes | Get admin details |
| `/admin/admin-management` | POST | Yes | Create new admin |
| `/admin/admin-management/{id}` | PUT | Yes | Update admin |
| `/admin/admin-management/{id}` | DELETE | Yes | Delete admin |
| `/admin/admin-management/{id}/toggle-status` | PUT | Yes | Toggle admin active status |
| `/admin/admin-management/{id}/password` | PUT | Yes | Change admin password |
| `/admin/roles/assign` | POST | Yes | Assign role to admin |
| `/admin/admins/{adminId}/roles` | GET | Yes | Get admin roles |
| `/admin/permissions/assign` | POST | Yes | Assign permissions to admin |
| `/admin/admins/{adminId}/permissions` | GET | Yes | Get admin permissions (combined) |

---

## Testing Checklist

- [ ] Get all admins with pagination
- [ ] Get all admins with search filter
- [ ] Get all admins with role filter
- [ ] Get all admins with status filter
- [ ] Get admin statistics
- [ ] Get admin details by ID
- [ ] Create admin with all required fields
- [ ] Create admin validation errors (duplicate email, weak password)
- [ ] Update admin details
- [ ] Update admin permissions
- [ ] Delete admin
- [ ] Toggle admin status
- [ ] Change admin password
- [ ] Assign role to admin
- [ ] Get admin roles
- [ ] Assign permissions to admin
- [ ] Get admin permissions (combined from direct + role-based)
- [ ] Super admin restrictions (cannot assign roles/permissions)
- [ ] Authentication required for all endpoints
- [ ] Error handling for invalid IDs
- [ ] Error handling for unauthorized access

---

## Summary

**Backend needs to implement:**

1. **Admin Management CRUD:**
   - ✅ GET `/admin/admin-management` - List with pagination & filters
   - ✅ GET `/admin/admin-management/stats` - Statistics
   - ✅ GET `/admin/admin-management/{id}` - Get details
   - ✅ POST `/admin/admin-management` - Create admin
   - ✅ PUT `/admin/admin-management/{id}` - Update admin
   - ✅ DELETE `/admin/admin-management/{id}` - Delete admin
   - ✅ PUT `/admin/admin-management/{id}/toggle-status` - Toggle status
   - ✅ PUT `/admin/admin-management/{id}/password` - Change password

2. **Role Assignment:**
   - ✅ POST `/admin/roles/assign` - Assign role to admin
   - ✅ GET `/admin/admins/{adminId}/roles` - Get admin roles

3. **Permission Assignment:**
   - ✅ POST `/admin/permissions/assign` - Assign permissions to admin
   - ✅ GET `/admin/admins/{adminId}/permissions` - Get admin permissions (combined)

**Frontend is complete and ready!** All UI components, types, services, and hooks are implemented and waiting for these backend endpoints.

