// utils/userHelpers.ts - Complete file

import { IUser } from '../interfaces';

/**
 * Safely extract user ID from various user reference formats
 */
export const getUserId = (user: Partial<IUser> | string | null | undefined): string | undefined => {
  if (!user) return undefined;
  if (typeof user === 'string') return user;
  if (typeof user === 'object' && 'id' in user) return user.id as string;
  // Handle MongoDB _id format
  if (typeof user === 'object' && '_id' in user) return user._id as string;
  return undefined;
};

/**
 * Check if a user is the creator of a request
 */
export const isCreator = (
  request: { createdBy?: Partial<IUser> | string | null },
  currentUserId?: string
): boolean => {
  if (!currentUserId) return false;
  return getUserId(request.createdBy) === currentUserId;
};

/**
 * Check if a user is a reviewer of a request
 */
export const isReviewer = (
  request: { reviewedBy?: Partial<IUser> | string | null },
  currentUserId?: string
): boolean => {
  if (!currentUserId) return false;
  const reviewedById = getUserId(request.reviewedBy);
  // console.log('isReviewer check:', { reviewedById, currentUserId, matches: reviewedById === currentUserId });
  return reviewedById === currentUserId;
};

/**
 * Check if a user is an approver of a request
 */
export const isApprover = (
  request: { approvedBy?: Partial<IUser> | string | null },
  currentUserId?: string
): boolean => {
  if (!currentUserId) return false;
  return getUserId(request.approvedBy) === currentUserId;
};

/**
 * Check if a user is a finance reviewer (for purchase requests)
 */
export const isFinanceReviewer = (
  request: { financeReviewBy?: Partial<IUser> | string | null },
  currentUserId?: string
): boolean => {
  if (!currentUserId) return false;
  return getUserId(request.financeReviewBy) === currentUserId;
};

/**
 * Check if a user is a procurement reviewer (for purchase requests)
 */
export const isProcurementReviewer = (
  request: { procurementReviewBy?: Partial<IUser> | string | null },
  currentUserId?: string
): boolean => {
  if (!currentUserId) return false;
  return getUserId(request.procurementReviewBy) === currentUserId;
};

/**
 * Check if a user is copied on a request
 */
export const isCopiedTo = (
  request: { copiedTo?: (Partial<IUser> | string)[] },
  currentUserId?: string
): boolean => {
  if (!currentUserId || !request.copiedTo) return false;
  return request.copiedTo.some(user => getUserId(user) === currentUserId);
};

/**
 * Get user's role with fallback
 */
export const getUserRole = (user?: { role?: string } | null): string => {
  return user?.role || 'STAFF';
};

/**
 * Check if user has admin role
 */
export const isAdmin = (user?: { role?: string } | null): boolean => {
  return ['SUPER-ADMIN', 'ADMIN'].includes(getUserRole(user));
};

/**
 * Get full name from user
 */
export const getUserFullName = (user?: Partial<IUser> | string | null): string => {
  if (!user) return 'Unknown';
  if (typeof user === 'string') return user;
  if (typeof user === 'object') {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown';
  }
  return 'Unknown';
};
