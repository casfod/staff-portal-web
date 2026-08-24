import { IUser } from '@/interfaces';

export const getInitials = (user: Partial<IUser>) => {
  if (!user) return '?';
  return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
};
