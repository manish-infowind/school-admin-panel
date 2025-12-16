/**
 * Permission utility functions for checking user permissions
 * Updated to work with new permission structure: { permissionName, allowedActions }
 */

import { User, UserPermission } from '@/api/types';

export const PERMISSIONS = {
  // Admin Management Permissions
  ADMIN_MANAGEMENT: 'admin_management',
  
  // Role Management Permissions
  ROLE_MANAGEMENT: 'role_management',
  
  // Permission Management Permissions
  PERMISSION_MANAGEMENT: 'permission_management',
  
  // All Allowed (Super Admin)
  ALL_ALLOWED: 'all_allowed',
} as const;

/**
 * Get user permissions from User object
 */
const getUserPermissions = (user: User | null | undefined): UserPermission[] => {
  if (!user) return [];
  // Check both isSuperAdmin and is_super_admin for compatibility
  const isSuperAdmin = user.isSuperAdmin || (user as any).is_super_admin;
  if (isSuperAdmin) return [{ permissionName: PERMISSIONS.ALL_ALLOWED, allowedActions: null }];
  return user.permissions || [];
};

/**
 * Check if user has a specific permission name
 */
export const hasPermissionName = (user: User | null | undefined, permissionName: string): boolean => {
  const permissions = getUserPermissions(user);
  
  // Check for all_allowed
  const hasAllAllowed = permissions.some(p => p.permissionName === PERMISSIONS.ALL_ALLOWED);
  if (hasAllAllowed) return true;
  
  // Check for specific permission
  return permissions.some(p => p.permissionName === permissionName);
};

/**
 * Check if user can perform a specific action on a permission
 */
export const canPerformAction = (
  user: User | null | undefined,
  permissionName: string,
  action: 'create' | 'read' | 'update' | 'delete'
): boolean => {
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
 */
export const hasAnyPermissionName = (
  user: User | null | undefined,
  permissionNames: string[]
): boolean => {
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
 */
export const hasAllPermissionNames = (
  user: User | null | undefined,
  permissionNames: string[]
): boolean => {
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
 */
export const canAccessAdminManagement = (user: User | null | undefined): boolean => {
  return hasAnyPermissionName(user, [
    PERMISSIONS.ALL_ALLOWED,
    PERMISSIONS.ADMIN_MANAGEMENT,
  ]);
};

/**
 * Check if user can perform CRUD operations on admin users
 */
export const canManageAdminUsers = (
  user: User | null | undefined,
  operation: 'create' | 'read' | 'update' | 'delete'
): boolean => {
  return canPerformAction(user, PERMISSIONS.ADMIN_MANAGEMENT, operation);
};

/**
 * Check if user can perform CRUD operations on roles
 */
export const canManageRoles = (
  user: User | null | undefined,
  operation: 'create' | 'read' | 'update' | 'delete'
): boolean => {
  return canPerformAction(user, PERMISSIONS.ROLE_MANAGEMENT, operation);
};

/**
 * Check if user can perform CRUD operations on permissions
 */
export const canManagePermissions = (
  user: User | null | undefined,
  operation: 'create' | 'read' | 'update' | 'delete'
): boolean => {
  return canPerformAction(user, PERMISSIONS.PERMISSION_MANAGEMENT, operation);
};

/**
 * Legacy support: Check if user has a specific permission (string array format)
 * @deprecated Use hasPermissionName or canPerformAction instead
 */
export const hasPermission = (userPermissions: string[] | undefined, permission: string): boolean => {
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
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }
  
  if (userPermissions.includes(PERMISSIONS.ALL_ALLOWED)) {
    return true;
  }
  
  return permissions.every(permission => userPermissions.includes(permission));
};

