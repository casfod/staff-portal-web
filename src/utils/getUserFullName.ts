// getUserFullName.ts - Centralized helper for resolving a display name off a
// user reference that may be a plain string (id) or a Partial<IUser> object.
import { IUser } from '../interfaces';

export const getUserFullName = (user?: Partial<IUser> | string): string => {
  if (!user) return 'N/A';
  if (typeof user === 'string') return user;
  if (user.fullName) return user.fullName;
  if (user.firstName || user.lastName) {
    return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  }
  return 'N/A';
};
