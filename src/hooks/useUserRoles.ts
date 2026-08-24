// hooks/useUserRoles.ts
import { useMemo } from 'react';
import { IUserRole } from '../interfaces';
import { localStorageUser } from '@/utils/localStorageUser';

interface UseUserRolesReturn {
  // Role checks
  currentUserId: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isStaff: boolean;
  isReviewer: boolean;
  isAdminOrSuperAdmin: boolean;
  isStaffOrReviewer: boolean;
  // Role helper
  role: IUserRole;
  hasRole: (roles: IUserRole | IUserRole[]) => boolean;
  // Permission checks
  canAccessAdminPanel: boolean;
  canManageUsers: boolean;
  canViewAllRequests: boolean;
  canApproveRequests: boolean;
  canReviewRequests: boolean;
}

export const useUserRoles = (): UseUserRolesReturn => {
  const user = localStorageUser();
  return useMemo(() => {
    if (!user) {
      return {
        currentUserId: "",
        isAdmin: false,
        isSuperAdmin: false,
        isStaff: false,
        isReviewer: false,
        isAdminOrSuperAdmin: false,
        isStaffOrReviewer: false,
        role: 'STAFF' as IUserRole,
        hasRole: () => false,
        canAccessAdminPanel: false,
        canManageUsers: false,
        canViewAllRequests: false,
        canApproveRequests: false,
        canReviewRequests: false,
      };
    }
    const currentUserId = user.id;
    const role = user.role as IUserRole;
    const isAdmin = role === 'ADMIN';
    const isSuperAdmin = role === 'SUPER-ADMIN';
    const isStaff = role === 'STAFF';
    const isReviewer = role === 'REVIEWER';
    const isAdminOrSuperAdmin = isAdmin || isSuperAdmin;
    const isStaffOrReviewer = isStaff || isReviewer;

    const hasRole = (roles: IUserRole | IUserRole[]): boolean => {
      if (Array.isArray(roles)) {
        return roles.includes(role);
      }
      return role === roles;
    };

    return {
      currentUserId,
      isAdmin,
      isSuperAdmin,
      isStaff,
      isReviewer,
      isAdminOrSuperAdmin,
      isStaffOrReviewer,
      role,
      hasRole,
      // Convenience permission checks based on role
      canAccessAdminPanel: isAdmin || isSuperAdmin,
      canManageUsers: isSuperAdmin,
      canViewAllRequests: isAdmin || isSuperAdmin || isReviewer,
      canApproveRequests: isAdmin || isSuperAdmin,
      canReviewRequests: isReviewer || isAdmin || isSuperAdmin,
    };
  }, [user]);
};