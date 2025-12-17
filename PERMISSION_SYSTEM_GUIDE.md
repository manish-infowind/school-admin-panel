# Permission System Implementation Guide

## Overview

The application now uses a comprehensive permission-based access control system that works with the new login response structure. Permissions are checked based on `permissionName` and `allowedActions` (CRUD operations).

## Login Response Structure

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "is_super_admin": true,
  "roles": [
    {
      "id": 1,
      "roleName": "super_admin",
      "description": "Super administrator with all permissions"
    }
  ],
  "permissions": [
    {
      "permissionName": "all_allowed",
      "allowedActions": null  // null means all actions allowed
    },
    {
      "permissionName": "role_management",
      "allowedActions": ["create", "read", "update", "delete"]
    },
    {
      "permissionName": "permission_management",
      "allowedActions": ["create", "read", "update", "delete"]
    },
    {
      "permissionName": "admin_management",
      "allowedActions": ["create", "read", "update", "delete"]
    }
  ]
}
```

## Permission Structure

Each permission has:
- **permissionName**: The name of the permission (e.g., `admin_management`, `role_management`)
- **allowedActions**: Array of allowed CRUD operations (`create`, `read`, `update`, `delete`) or `null` (meaning all actions allowed)

## Permission Checking Functions

### 1. `canPerformAction(user, permissionName, action)`

Check if a user can perform a specific action on a permission.

```typescript
import { canPerformAction } from '@/lib/permissions';

// Check if user can create roles
const canCreate = canPerformAction(user, 'role_management', 'create');

// Check if user can read admin users
const canRead = canPerformAction(user, 'admin_management', 'read');
```

**Parameters:**
- `user`: User object from `useAuth()`
- `permissionName`: Permission name (e.g., `'admin_management'`, `'role_management'`)
- `action`: CRUD operation (`'create' | 'read' | 'update' | 'delete'`)

**Returns:** `boolean`

### 2. `hasPermissionName(user, permissionName)`

Check if user has a specific permission (regardless of actions).

```typescript
import { hasPermissionName } from '@/lib/permissions';

const hasAdminAccess = hasPermissionName(user, 'admin_management');
```

### 3. `canManageAdminUsers(user, operation)`

Shorthand for checking admin management permissions.

```typescript
import { canManageAdminUsers } from '@/lib/permissions';

const canCreate = canManageAdminUsers(user, 'create');
const canRead = canManageAdminUsers(user, 'read');
const canUpdate = canManageAdminUsers(user, 'update');
const canDelete = canManageAdminUsers(user, 'delete');
```

### 4. `canManageRoles(user, operation)`

Shorthand for checking role management permissions.

```typescript
import { canManageRoles } from '@/lib/permissions';

const canCreate = canManageRoles(user, 'create');
const canRead = canManageRoles(user, 'read');
const canUpdate = canManageRoles(user, 'update');
const canDelete = canManageRoles(user, 'delete');
```

### 5. `canManagePermissions(user, operation)`

Shorthand for checking permission management permissions.

```typescript
import { canManagePermissions } from '@/lib/permissions';

const canCreate = canManagePermissions(user, 'create');
const canRead = canManagePermissions(user, 'read');
const canUpdate = canManagePermissions(user, 'update');
const canDelete = canManagePermissions(user, 'delete');
```

### 6. `canAccessAdminManagement(user)`

Check if user can access the admin management section.

```typescript
import { canAccessAdminManagement } from '@/lib/permissions';

const hasAccess = canAccessAdminManagement(user);
```

## Usage Examples

### Example 1: Conditionally Render Button

```typescript
import { useAuth } from '@/lib/authContext';
import { canManageRoles } from '@/lib/permissions';

function RolesPage() {
  const { user } = useAuth();
  const canCreate = canManageRoles(user, 'create');
  
  return (
    <div>
      {canCreate && (
        <Button onClick={handleCreate}>
          Create Role
        </Button>
      )}
    </div>
  );
}
```

### Example 2: Disable Button Based on Permission

```typescript
import { useAuth } from '@/lib/authContext';
import { canManageAdminUsers } from '@/lib/permissions';

function AdminManagement() {
  const { user } = useAuth();
  const canUpdate = canManageAdminUsers(user, 'update');
  
  return (
    <Button 
      onClick={handleUpdate}
      disabled={!canUpdate}
    >
      Update Admin
    </Button>
  );
}
```

### Example 3: Hide Entire Section

```typescript
import { useAuth } from '@/lib/authContext';
import { canAccessAdminManagement } from '@/lib/permissions';

function Sidebar() {
  const { user } = useAuth();
  const hasAdminAccess = canAccessAdminManagement(user);
  
  return (
    <nav>
      {hasAdminAccess && (
        <AdminManagementSection />
      )}
    </nav>
  );
}
```

### Example 4: Check Multiple Permissions

```typescript
import { useAuth } from '@/lib/authContext';
import { hasAnyPermissionName, hasAllPermissionNames } from '@/lib/permissions';

function Dashboard() {
  const { user } = useAuth();
  
  // Check if user has ANY of these permissions
  const canViewReports = hasAnyPermissionName(user, [
    'report_management',
    'all_allowed'
  ]);
  
  // Check if user has ALL of these permissions
  const canFullAccess = hasAllPermissionNames(user, [
    'admin_management',
    'role_management',
    'permission_management'
  ]);
  
  return (
    <div>
      {canViewReports && <ReportsSection />}
      {canFullAccess && <FullAccessSection />}
    </div>
  );
}
```

### Example 5: Custom Permission Check

```typescript
import { useAuth } from '@/lib/authContext';
import { canPerformAction } from '@/lib/permissions';

function CustomFeature() {
  const { user } = useAuth();
  
  // Check custom permission
  const canAccess = canPerformAction(user, 'custom_feature', 'read');
  
  return canAccess ? <CustomComponent /> : <AccessDenied />;
}
```

## Special Cases

### Super Admin (`all_allowed`)

If a user has the `all_allowed` permission:
- All permission checks return `true`
- `allowedActions: null` means all CRUD operations are allowed
- User bypasses all permission checks

### Null `allowedActions`

If `allowedActions` is `null`:
- All CRUD operations are allowed for that permission
- Equivalent to `['create', 'read', 'update', 'delete']`

### Missing Permission

If user doesn't have a permission:
- All checks for that permission return `false`
- UI elements are hidden/disabled accordingly

## Component Integration

### Updated Components

All components have been updated to use the new permission system:

1. **AdminManagement.tsx** - Uses `canManageAdminUsers()`
2. **RolesManagement.tsx** - Uses `canManageRoles()`
3. **PermissionsManagement.tsx** - Uses `canManagePermissions()`
4. **SideNavigation.tsx** - Uses `canAccessAdminManagement()` and sub-item checks

### Pattern to Follow

```typescript
// 1. Import useAuth and permission functions
import { useAuth } from '@/lib/authContext';
import { canManageRoles } from '@/lib/permissions';

// 2. Get user from context
const { user } = useAuth();

// 3. Check permissions
const canCreate = canManageRoles(user, 'create');
const canRead = canManageRoles(user, 'read');
const canUpdate = canManageRoles(user, 'update');
const canDelete = canManageRoles(user, 'delete');

// 4. Use in JSX
{canCreate && <CreateButton />}
{canRead && <ViewButton />}
<EditButton disabled={!canUpdate} />
<DeleteButton disabled={!canDelete} />
```

## Testing Permissions

### Test Cases

1. **Super Admin**: Should have access to everything
2. **Admin with `all_allowed`**: Should have access to everything
3. **Admin with specific permissions**: Should only have access to allowed actions
4. **Admin with no permissions**: Should have no access
5. **Admin with `allowedActions: null`**: Should have all CRUD operations

### Example Test

```typescript
// Super admin
const superAdmin = {
  isSuperAdmin: true,
  permissions: [{ permissionName: 'all_allowed', allowedActions: null }]
};
expect(canManageRoles(superAdmin, 'create')).toBe(true);

// Admin with role_management permission
const admin = {
  isSuperAdmin: false,
  permissions: [
    { permissionName: 'role_management', allowedActions: ['read', 'update'] }
  ]
};
expect(canManageRoles(admin, 'create')).toBe(false);
expect(canManageRoles(admin, 'read')).toBe(true);
expect(canManageRoles(admin, 'update')).toBe(true);
expect(canManageRoles(admin, 'delete')).toBe(false);
```

## Migration Notes

### Old System (Deprecated)

```typescript
// OLD - Don't use
const hasPermission = (userPermissions: string[], permission: string) => {
  return userPermissions.includes(permission);
};
```

### New System (Current)

```typescript
// NEW - Use this
const canPerformAction = (user: User, permissionName: string, action: string) => {
  // Checks permissionName and allowedActions
};
```

## Best Practices

1. **Always check permissions before rendering**: Don't rely on backend validation alone
2. **Use specific permission checks**: Use `canManageRoles(user, 'create')` instead of generic checks
3. **Disable instead of hiding**: For better UX, disable buttons instead of hiding them (when appropriate)
4. **Check at component level**: Check permissions in each component that needs them
5. **Handle loading states**: Check permissions after user data is loaded
6. **Provide feedback**: Show messages when users try to access restricted features

## Troubleshooting

### Permission checks always return false

- Check if `user` is loaded: `console.log(user)`
- Check if permissions are in correct format: `console.log(user?.permissions)`
- Verify `isSuperAdmin` flag is set correctly

### Super admin doesn't have access

- Check if `isSuperAdmin` is set in User object
- Verify `all_allowed` permission is present in permissions array

### Actions not working despite permission

- Check if `allowedActions` includes the required action
- Verify permission name matches exactly (case-sensitive)
- Check if `allowedActions` is `null` (means all actions allowed)

