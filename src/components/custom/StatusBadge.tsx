import React from 'react';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showDot?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
  showDot = true,
}) => {
  const statusConfig: Record<string, { color: string; bg: string; dot: string }> = {
    draft: {
      color: 'text-gray-700',
      bg: 'bg-gray-100',
      dot: 'bg-gray-400',
    },
    pending: {
      color: 'text-yellow-700',
      bg: 'bg-yellow-100',
      dot: 'bg-yellow-500',
    },
    approved: {
      color: 'text-green-700',
      bg: 'bg-green-100',
      dot: 'bg-green-500',
    },
    rejected: {
      color: 'text-red-700',
      bg: 'bg-red-100',
      dot: 'bg-red-500',
    },
    reviewed: {
      color: 'text-blue-700',
      bg: 'bg-blue-100',
      dot: 'bg-blue-500',
    },
    paid: {
      color: 'text-purple-700',
      bg: 'bg-purple-100',
      dot: 'bg-purple-500',
    },
    active: {
      color: 'text-green-700',
      bg: 'bg-green-100',
      dot: 'bg-green-500',
    },
    inactive: {
      color: 'text-gray-700',
      bg: 'bg-gray-100',
      dot: 'bg-gray-400',
    },
    completed: {
      color: 'text-teal-700',
      bg: 'bg-teal-100',
      dot: 'bg-teal-500',
    },
    cancelled: {
      color: 'text-red-700',
      bg: 'bg-red-100',
      dot: 'bg-red-500',
    },
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  };

  const normalizedStatus = status?.toLowerCase() || 'draft';
  const config = statusConfig[normalizedStatus] || statusConfig.draft;
  const displayText = status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase() || 'Draft';

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full uppercase',
        config.bg,
        config.color,
        sizeClasses[size],
        className
      )}
    >
      {showDot && <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', config.dot)} />}
      {displayText}
    </span>
  );
};

export default StatusBadge;
