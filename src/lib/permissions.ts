/**
 * Permission utility functions for checking user permissions
 * Updated to work with new permission structure: { permissionName, allowedActions }
 * 
 * DEVELOPMENT MODE: All permission checks return true during development
 */

import { User, UserPermission } from '@/api/types';

// Development mode flag - HARDCODED to true to bypass all permission checks during development
const IS_DEVELOPMENT = true; // Hardcoded for development - change to false for production

export const PERMISSIONS = {
  // Admin Management Permissions
  ADMIN_MANAGEMENT: 'admin_management',
  
  // Role Management Permissions
  ROLE_MANAGEMENT: 'role_management',
  
  // Permission Management Permissions
  PERMISSION_MANAGEMENT: 'permission_management',
  
  // Activity Logs Permission
  ADMIN_RECENT_ACTIVITY: 'admin_recent_activity',
  
  // All Allowed (Super Admin)
  ALL_ALLOWED: 'all_allowed',
} as const;

/**
 * Check if user has super_admin role
 * This function checks multiple ways a user can be a super admin:
 * 1. isSuperAdmin or is_super_admin flag
 * 2. roles array containing 'super_admin' role
 * 3. legacy role field set to 'super_admin'
 */
export const hasSuperAdminRole = (user: User | null | undefined): boolean => {
  if (!user) return false;
  
  // Check isSuperAdmin flag
  const isSuperAdmin = user.isSuperAdmin || (user as any).is_super_admin;
  if (isSuperAdmin) return true;
  
  // Check roles array for super_admin role
  if (user.roles && Array.isArray(user.roles)) {
    const hasSuperAdmin = user.roles.some(role => 
      role.roleName === 'super_admin' || role.roleName === 'superAdmin'
    );
    if (hasSuperAdmin) return true;
  }
  
  // Check legacy role field
  if ((user as any).role === 'super_admin' || (user as any).role === 'superAdmin') {
    return true;
  }
  
  return false;
};

/**
 * Get user permissions from User object
 */
const getUserPermissions = (user: User | null | undefined): UserPermission[] => {
  if (!user) {
    console.warn('⚠️ Permission check: No user provided');
    return [];
  }
  
  // If user has super_admin role, grant all permissions
  if (hasSuperAdminRole(user)) {
    console.log('✅ Permission check: User is super admin - all permissions granted');
    return [{ permissionName: PERMISSIONS.ALL_ALLOWED, allowedActions: null }];
  }
  
  const permissions = user.permissions || [];
  console.log('🔍 Permission check:', {
    userId: user.id,
    email: user.email,
    isSuperAdmin: user.isSuperAdmin,
    rolesCount: user.roles?.length || 0,
    permissionsCount: permissions.length,
    permissions: permissions.map(p => p.permissionName),
  });
  
  return permissions;
};

/**
 * Check if user has a specific permission name
 * Super admins automatically have all permissions
 */
export const hasPermissionName = (user: User | null | undefined, permissionName: string): boolean => {
  // DEVELOPMENT MODE: Allow all access
  if (IS_DEVELOPMENT) return true;
  
  // Super admins have all permissions
  if (hasSuperAdminRole(user)) {
    return true;
  }
  
  const permissions = getUserPermissions(user);
  
  // Check for all_allowed
  const hasAllAllowed = permissions.some(p => p.permissionName === PERMISSIONS.ALL_ALLOWED);
  if (hasAllAllowed) return true;
  
  // Check for specific permission
  return permissions.some(p => p.permissionName === permissionName);
};

/**
 * Check if user can perform a specific action on a permission
 * Super admins automatically have access to all actions
 */
export const canPerformAction = (
  user: User | null | undefined,
  permissionName: string,
  action: 'create' | 'read' | 'update' | 'delete'
): boolean => {
  // DEVELOPMENT MODE: Allow all access
  if (IS_DEVELOPMENT) return true;
  
  // Super admins have access to everything
  if (hasSuperAdminRole(user)) {
    return true;
  }
  
  const permissions = getUserPermissions(user);
  
  // Check for all_allowed
  const allAllowed = permissions.find(p => p.permissionName === PERMISSIONS.ALL_ALLOWED);
  if (allAllowed) {
    // If allowedActions is null, all actions are allowed
    if (allAllowed.allowedActions === null) return true;
    // Otherwise check if action is in allowedActions
    return allAllowed.allowedActions.includes(action);
  }
  
  // Check for specific permission
  const permission = permissions.find(p => p.permissionName === permissionName);
  if (!permission) return false;
  
  // If allowedActions is null, all actions are allowed
  if (permission.allowedActions === null) return true;
  
  // Check if action is in allowedActions
  return permission.allowedActions.includes(action);
};

/**
 * Check if user has any of the specified permission names
 * Super admins automatically have all permissions
 */
export const hasAnyPermissionName = (
  user: User | null | undefined,
  permissionNames: string[]
): boolean => {
  // DEVELOPMENT MODE: Allow all access
  if (IS_DEVELOPMENT) return true;
  
  // Super admins have all permissions
  if (hasSuperAdminRole(user)) {
    return true;
  }
  
  const permissions = getUserPermissions(user);
  
  // Check for all_allowed
  if (permissions.some(p => p.permissionName === PERMISSIONS.ALL_ALLOWED)) {
    return true;
  }
  
  // Check if user has any of the specified permissions
  return permissionNames.some(name => 
    permissions.some(p => p.permissionName === name)
  );
};

/**
 * Check if user has all of the specified permission names
 * Super admins automatically have all permissions
 */
export const hasAllPermissionNames = (
  user: User | null | undefined,
  permissionNames: string[]
): boolean => {
  // DEVELOPMENT MODE: Allow all access
  if (IS_DEVELOPMENT) return true;
  
  // Super admins have all permissions
  if (hasSuperAdminRole(user)) {
    return true;
  }
  
  const permissions = getUserPermissions(user);
  
  // Check for all_allowed
  if (permissions.some(p => p.permissionName === PERMISSIONS.ALL_ALLOWED)) {
    return true;
  }
  
  // Check if user has all of the specified permissions
  return permissionNames.every(name => 
    permissions.some(p => p.permissionName === name)
  );
};

/**
 * Check if user can access admin management section
 * Super admins automatically have access
 */
export const canAccessAdminManagement = (user: User | null | undefined): boolean => {
  // DEVELOPMENT MODE: Allow all access
  if (IS_DEVELOPMENT) return true;
  
  // Super admins have access to everything
  if (hasSuperAdminRole(user)) {
    return true;
  }
  
  return hasAnyPermissionName(user, [
    PERMISSIONS.ALL_ALLOWED,
    PERMISSIONS.ADMIN_MANAGEMENT,
  ]);
};

/**
 * Check if user can perform CRUD operations on admin users
 * Super admins automatically have all operations
 */
export const canManageAdminUsers = (
  user: User | null | undefined,
  operation: 'create' | 'read' | 'update' | 'delete'
): boolean => {
  // DEVELOPMENT MODE: Allow all access
  if (IS_DEVELOPMENT) return true;
  
  // Super admins have access to everything
  if (hasSuperAdminRole(user)) {
    return true;
  }
  
  return canPerformAction(user, PERMISSIONS.ADMIN_MANAGEMENT, operation);
};

/**
 * Check if user can perform CRUD operations on roles
 * Super admins automatically have all operations
 */
export const canManageRoles = (
  user: User | null | undefined,
  operation: 'create' | 'read' | 'update' | 'delete'
): boolean => {
  // DEVELOPMENT MODE: Allow all access
  if (IS_DEVELOPMENT) return true;
  
  // Super admins have access to everything
  if (hasSuperAdminRole(user)) {
    return true;
  }
  
  return canPerformAction(user, PERMISSIONS.ROLE_MANAGEMENT, operation);
};

/**
 * Check if user can perform CRUD operations on permissions
 * Super admins automatically have all operations
 */
export const canManagePermissions = (
  user: User | null | undefined,
  operation: 'create' | 'read' | 'update' | 'delete'
): boolean => {
  // DEVELOPMENT MODE: Allow all access
  if (IS_DEVELOPMENT) return true;
  
  // Super admins have access to everything
  if (hasSuperAdminRole(user)) {
    return true;
  }
  
  return canPerformAction(user, PERMISSIONS.PERMISSION_MANAGEMENT, operation);
};

/**
 * Legacy support: Check if user has a specific permission (string array format)
 * @deprecated Use hasPermissionName or canPerformAction instead
 */
export const hasPermission = (userPermissions: string[] | undefined, permission: string): boolean => {
  // DEVELOPMENT MODE: Allow all access
  if (IS_DEVELOPMENT) return true;
  
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }
  
  if (userPermissions.includes(PERMISSIONS.ALL_ALLOWED)) {
    return true;
  }
  
  return userPermissions.includes(permission);
};

/**
 * Legacy support: Check if user has any of the specified permissions
 * @deprecated Use hasAnyPermissionName instead
 */
export const hasAnyPermission = (userPermissions: string[] | undefined, permissions: string[]): boolean => {
  // DEVELOPMENT MODE: Allow all access
  if (IS_DEVELOPMENT) return true;
  
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }
  
  if (userPermissions.includes(PERMISSIONS.ALL_ALLOWED)) {
    return true;
  }
  
  return permissions.some(permission => userPermissions.includes(permission));
};

/**
 * Legacy support: Check if user has all of the specified permissions
 * @deprecated Use hasAllPermissionNames instead
 */
export const hasAllPermissions = (userPermissions: string[] | undefined, permissions: string[]): boolean => {
  // DEVELOPMENT MODE: Allow all access
  if (IS_DEVELOPMENT) return true;
  
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }
  
  if (userPermissions.includes(PERMISSIONS.ALL_ALLOWED)) {
    return true;
  }
  
  return permissions.every(permission => userPermissions.includes(permission));
};

/**
 * Check if user can access activity logs
 * Super admins automatically have access
 */
export const canAccessActivityLogs = (user: User | null | undefined): boolean => {
  // DEVELOPMENT MODE: Allow all access
  if (IS_DEVELOPMENT) return true;
  
  // Super admins have access to everything
  if (hasSuperAdminRole(user)) {
    return true;
  }
  
  return hasAnyPermissionName(user, [
    PERMISSIONS.ALL_ALLOWED,
    PERMISSIONS.ADMIN_RECENT_ACTIVITY,
  ]);
};
