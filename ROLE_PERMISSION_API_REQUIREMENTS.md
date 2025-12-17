# Role and Permission Assignment API Requirements

## Overview

The frontend needs to fetch available roles and permissions from the system, and assign them to admin users. This document outlines the required API endpoints.

## Base URL
```
http://localhost:8000/admin
```

**All endpoints require authentication:**
```
Authorization: Bearer {access_token}
```

---

## Required API Endpoints

### 1. Get All Roles

**Endpoint:** `GET /admin/roles`

**Description:** Retrieve a list of all available roles in the system. This is used to populate the role dropdown in create/edit admin modals.

**Headers:**
```
Authorization: Bearer {access_token}
```

**cURL Command:**
```bash
curl -X GET http://localhost:8000/admin/roles \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Roles fetched successfully",
  "data": {
    "roles": [
      {
        "id": 1,
        "roleName": "super_admin",
        "description": "Super administrator with all permissions",
        "isActive": true
      },
      {
        "id": 2,
        "roleName": "admin",
        "description": "Administrator role",
        "isActive": true
      },
      {
        "id": 3,
        "roleName": "moderator",
        "description": "Moderator role with limited permissions",
        "isActive": true
      }
    ]
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

**Frontend Usage:**
- Used in create admin modal to show available roles
- Used in edit admin modal to show available roles
- Used to populate role dropdown

---

### 2. Get All Permissions

**Endpoint:** `GET /admin/permissions`

**Description:** Retrieve a list of all available permissions in the system with their allowed CRUD actions. This is used to populate the permission checkboxes in create/edit admin modals.

**Headers:**
```
Authorization: Bearer {access_token}
```

**cURL Command:**
```bash
curl -X GET http://localhost:8000/admin/permissions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Permissions fetched successfully",
  "data": {
    "permissions": [
      {
        "id": 1,
        "permissionName": "all_allowed",
        "allowedActions": ["create", "read", "update", "delete"]
      },
      {
        "id": 2,
        "permissionName": "admin_management",
        "allowedActions": ["create", "read", "update", "delete"]
      },
      {
        "id": 3,
        "permissionName": "role_management",
        "allowedActions": ["create", "read", "update", "delete"]
      },
      {
        "id": 4,
        "permissionName": "permission_management",
        "allowedActions": ["read", "update"]
      }
    ]
  }
}
```

**Note:** If `allowedActions` is `null`, it means all CRUD operations are allowed.

**Error Response (401):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Frontend Usage:**
- Used in create admin modal to show available permissions
- Used in edit admin modal to show available permissions
- Used to populate permission checkboxes

---

### 3. Get Admin Roles

**Endpoint:** `GET /admin/admins/{adminId}/roles`

**Description:** Retrieve all roles currently assigned to a specific admin user. This is used in the edit admin modal to show current role assignments.

**Path Parameters:**
- `adminId` (string, required): UUID of the admin user

**Headers:**
```
Authorization: Bearer {access_token}
```

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
        "id": 2,
        "roleName": "admin",
        "description": "Administrator role"
      }
    ]
  }
}
```

**For Super Admin:**
```json
{
  "statusCode": 200,
  "message": "Admin roles fetched successfully",
  "data": {
    "adminId": "123e4567-e89b-12d3-a456-426614174000",
    "isSuperAdmin": true,
    "roles": []
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

**Frontend Usage:**
- Used in edit admin modal to pre-select current roles
- Used to display current role assignments

---

### 4. Get Admin Permissions

**Endpoint:** `GET /admin/admins/{adminId}/permissions`

**Description:** Retrieve all permissions currently assigned to a specific admin user (both direct and role-based, combined and deduplicated). This is used in the edit admin modal to show current permission assignments.

**Path Parameters:**
- `adminId` (string, required): UUID of the admin user

**Headers:**
```
Authorization: Bearer {access_token}
```

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

**For Super Admin:**
```json
{
  "statusCode": 200,
  "message": "Admin permissions fetched successfully",
  "data": {
    "adminId": "123e4567-e89b-12d3-a456-426614174000",
    "isSuperAdmin": true,
    "permissions": [
      {
        "permissionName": "all_allowed"
      },
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

**Error Response (404):**
```json
{
  "statusCode": 404,
  "message": "Admin user not found"
}
```

**Frontend Usage:**
- Used in edit admin modal to pre-select current permissions
- Used to display current permission assignments
- Note: Frontend maps permission names to IDs from the full permissions list

---

### 5. Assign Role to Admin

**Endpoint:** `POST /admin/roles/assign`

**Description:** Assign a role to an admin user. This is called after creating or updating an admin to assign the selected role.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "adminId": "123e4567-e89b-12d3-a456-426614174000",
  "roleId": 2
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:8000/admin/roles/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "adminId": "123e4567-e89b-12d3-a456-426614174000",
    "roleId": 2
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
        "id": 2,
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

**Error Response (404):**
```json
{
  "statusCode": 404,
  "message": "Admin user not found"
}
```

**Important Notes:**
- If admin already has this role, the endpoint should handle it gracefully (either ignore or update)
- If backend supports multiple roles per admin, this should add the role
- If backend only supports one role per admin, this should replace the existing role
- Super admins cannot have roles assigned

**Frontend Usage:**
- Called after creating admin (if role is selected)
- Called after updating admin (if role is changed)

---

### 6. Assign Permissions to Admin

**Endpoint:** `POST /admin/permissions/assign`

**Description:** Assign one or more permissions to an admin user. This is called after creating or updating an admin to assign the selected permissions.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "adminId": "123e4567-e89b-12d3-a456-426614174000",
  "permissionIds": [2, 3, 4]
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:8000/admin/permissions/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "adminId": "123e4567-e89b-12d3-a456-426614174000",
    "permissionIds": [2, 3, 4]
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

**Error Response (404):**
```json
{
  "statusCode": 404,
  "message": "Admin user not found"
}
```

**Important Notes:**
- This endpoint **replaces** all existing direct permissions with the new list
- Role-based permissions are NOT affected by this endpoint
- If `permissionIds` is an empty array `[]`, all direct permissions should be removed
- Super admins cannot have permissions assigned

**Frontend Usage:**
- Called after creating admin (if permissions are selected)
- Called after updating admin (if permissions are changed)

---

## Frontend Workflow

### Create Admin Workflow

1. User fills in admin details in create modal
2. User selects a role (optional) from dropdown (fetched via `GET /admin/roles`)
3. User selects individual permissions (optional) from checkboxes (fetched via `GET /admin/permissions`)
4. Validation: At least one role OR permission must be selected
5. User clicks "Create Admin"
6. Frontend calls `POST /admin/admin-management` to create admin
7. If role selected: Frontend calls `POST /admin/roles/assign` with `adminId` and `roleId`
8. If permissions selected: Frontend calls `POST /admin/permissions/assign` with `adminId` and `permissionIds`

### Edit Admin Workflow

1. User clicks "Edit" on an admin
2. Frontend opens edit modal
3. Frontend calls `GET /admin/admins/{adminId}/roles` to fetch current roles
4. Frontend calls `GET /admin/admins/{adminId}/permissions` to fetch current permissions
5. Frontend calls `GET /admin/roles` to fetch all available roles
6. Frontend calls `GET /admin/permissions` to fetch all available permissions
7. Frontend pre-selects current role and permissions in the form
8. User can change role selection
9. User can change permission selection
10. Validation: At least one role OR permission must be selected
11. User clicks "Update Admin"
12. Frontend calls `PUT /admin/admin-management/{id}` to update admin details
13. If role changed: Frontend calls `POST /admin/roles/assign` with new `roleId`
14. If permissions changed: Frontend calls `POST /admin/permissions/assign` with new `permissionIds`

---

## Data Structures

### Role Object
```typescript
interface Role {
  id: number;
  roleName: string;
  description?: string;
  isActive?: boolean;
}
```

### Permission Object
```typescript
interface Permission {
  id: number;
  permissionName: string;
  allowedActions: string[] | null; // null means all actions allowed
}
```

### Admin Roles Response
```typescript
interface AdminRolesResponse {
  adminId: string;
  isSuperAdmin: boolean;
  roles: Array<{
    id: number;
    roleName: string;
    description?: string;
  }>;
}
```

### Admin Permissions Response
```typescript
interface AdminPermissionsResponse {
  adminId: string;
  isSuperAdmin: boolean;
  permissions: Array<{
    permissionName: string;
  }>;
}
```

---

## Important Notes

### 1. Multiple Roles Support

**Question:** Does the backend support multiple roles per admin?

- **If YES:** The assign role endpoint should add roles (not replace)
- **If NO:** The assign role endpoint should replace the existing role

**Current Frontend Implementation:**
- Frontend allows selecting one role at a time
- If backend supports multiple roles, frontend can be updated to allow multiple selections

### 2. Permission Assignment Behavior

- The `POST /admin/permissions/assign` endpoint **replaces** all direct permissions
- Role-based permissions are separate and not affected
- If you want to remove all direct permissions, send an empty array `[]`

### 3. Super Admin Restrictions

- Super admins cannot have roles assigned
- Super admins cannot have permissions assigned
- Super admins automatically have all permissions

### 4. Validation Rules

- At least one role OR individual permission must be assigned
- This validation is done in the frontend
- Backend can optionally enforce this rule as well

### 5. Permission Name to ID Mapping

In the edit modal, the frontend receives permission names from `GET /admin/admins/{adminId}/permissions`, but needs to map them to IDs for the assignment API. The frontend does this by:
1. Fetching all permissions via `GET /admin/permissions` (gets IDs)
2. Matching permission names from admin permissions to IDs from all permissions
3. Using those IDs in the assignment API

---

## Quick Reference Table

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/admin/roles` | GET | Yes | Get all available roles |
| `/admin/permissions` | GET | Yes | Get all available permissions |
| `/admin/admins/{adminId}/roles` | GET | Yes | Get admin's current roles |
| `/admin/admins/{adminId}/permissions` | GET | Yes | Get admin's current permissions |
| `/admin/roles/assign` | POST | Yes | Assign role to admin |
| `/admin/permissions/assign` | POST | Yes | Assign permissions to admin |

---

## Testing Checklist

- [ ] Get all roles returns list of roles
- [ ] Get all permissions returns list of permissions with allowedActions
- [ ] Get admin roles returns current role assignments
- [ ] Get admin permissions returns current permission assignments (combined)
- [ ] Assign role to admin works correctly
- [ ] Assign permissions to admin works correctly
- [ ] Assign role replaces existing role (if single role supported)
- [ ] Assign role adds to existing roles (if multiple roles supported)
- [ ] Assign permissions replaces existing direct permissions
- [ ] Empty permission array removes all direct permissions
- [ ] Super admin restrictions work correctly
- [ ] Error handling for invalid admin IDs
- [ ] Error handling for invalid role IDs
- [ ] Error handling for invalid permission IDs

---

## Summary

**Backend needs to ensure these endpoints are implemented:**

1. ✅ `GET /admin/roles` - Get all roles (already implemented)
2. ✅ `GET /admin/permissions` - Get all permissions (already implemented)
3. ✅ `GET /admin/admins/{adminId}/roles` - Get admin roles (already implemented)
4. ✅ `GET /admin/admins/{adminId}/permissions` - Get admin permissions (already implemented)
5. ✅ `POST /admin/roles/assign` - Assign role (already implemented)
6. ✅ `POST /admin/permissions/assign` - Assign permissions (already implemented)

**All endpoints are already implemented!** The frontend is now updated to use them in both create and edit modals.

**Frontend Changes Made:**
- ✅ Updated create modal to fetch and use roles/permissions
- ✅ Updated edit modal to fetch and use roles/permissions
- ✅ Added role and permission assignment after create/update
- ✅ Added validation for role/permission requirement
- ✅ Pre-populate edit modal with current assignments

