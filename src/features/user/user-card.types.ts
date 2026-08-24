// user-card.types.ts - Shared types for the UserCard component tree

import { IUserRole } from '@/interfaces';

export type PermissionRole = 'procurementRole' | 'financeRole';
export type PermissionKey = 'canView' | 'canCreate' | 'canUpdate' | 'canDelete';

export interface RolePermissions {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface PermissionItem {
  key: PermissionKey;
  label: string;
  description: string;
}

// Shape of the local editable draft of a user. This is intentionally its
// own type (not IUser) because it flattens/normalizes a few fields
// (e.g. isEmploymentInfoLocked is hoisted out of employmentInfo) for
// easier editing in form state.
export interface EditedUser {
  firstName: string;
  lastName: string;
  email: string;
  role: IUserRole;
  position: string;
  procurementRole: RolePermissions;
  financeRole: RolePermissions;
  isDeleted: boolean; // Kept for compatibility but not used
  isActive: boolean; // This is the actual field used for activation
  isEmploymentInfoLocked: boolean;
}

// Helper function to safely update permissions
export const updatePermission = (
  prev: EditedUser,
  roleType: PermissionRole,
  key: PermissionKey
): EditedUser => {
  const currentRole = prev[roleType];
  return {
    ...prev,
    [roleType]: {
      ...currentRole,
      [key]: !currentRole[key],
    },
  };
};

// Helper to check if any permission is enabled
export const hasAnyPermission = (permissions: RolePermissions): boolean => {
  return Object.values(permissions).some(value => value === true);
};

// Helper to get count of enabled permissions
export const getPermissionCount = (permissions: RolePermissions): number => {
  return Object.values(permissions).filter(value => value === true).length;
};
