import React from 'react';
import { cn } from '../../lib/utils';

interface UserBadgeProps {
  isDeleted: boolean;
  status: string;
  size?: 'sm' | 'md';
  className?: string;
}

const UserBadge: React.FC<UserBadgeProps> = ({
  isDeleted,
  status,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
  };

  const statusText = isDeleted ? 'Inactive' : status || 'Active';

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded border',
        isDeleted
          ? 'text-red-600 border-red-300 bg-red-50'
          : 'text-green-600 border-green-300 bg-green-50',
        sizeClasses[size],
        className
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0',
          isDeleted ? 'bg-red-500' : 'bg-green-500'
        )}
      />
      {statusText}
    </span>
  );
};

export default UserBadge;
