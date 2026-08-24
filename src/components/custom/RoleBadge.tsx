import React from 'react';
import { cn } from '../../lib/utils';

type Role = 'STAFF' | 'ADMIN' | 'SUPER-ADMIN' | 'REVIEWER';

interface RoleBadgeProps {
  role: Role;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showDot?: boolean;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  children,
  size = 'md',
  className = '',
  showDot = true,
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1.5',
    md: 'px-3 py-1 text-sm gap-2',
    lg: 'px-4 py-1.5 text-base gap-2.5',
  };

  // Role configurations following the brand color system
  const roleConfig: Record<
    Role,
    {
      bg: string;
      text: string;
      border: string;
      dot: string;
      hover?: string;
    }
  > = {
    STAFF: {
      bg: 'bg-white',
      text: 'text-gray-900',
      border: 'border-gray-300',
      dot: 'bg-gray-400',
      hover: 'hover:bg-gray-50',
    },
    REVIEWER: {
      bg: 'bg-brand-800', // Darkest shade from logo blue
      text: 'text-white',
      border: 'border-transparent',
      dot: 'bg-brand-300',
      hover: 'hover:bg-brand-700',
    },
    ADMIN: {
      bg: 'bg-red-700', // Darkest red shade
      text: 'text-white',
      border: 'border-transparent',
      dot: 'bg-red-300',
      hover: 'hover:bg-red-800',
    },
    'SUPER-ADMIN': {
      bg: 'bg-red-700', // Darkest red shade
      text: 'text-white',
      border: 'border-transparent',
      dot: 'bg-red-300',
      hover: 'hover:bg-red-800',
    },
  };

  const config = roleConfig[role];

  return (
    <div
      className={cn(
        'inline-flex items-center font-medium rounded-full border transition-all duration-200',
        config.bg,
        config.text,
        config.border,
        config.hover,
        sizeClasses[size],
        className
      )}
      style={{ letterSpacing: '0.5px' }}
    >
      {showDot && <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', config.dot)} />}
      <span className="uppercase">{children}</span>
    </div>
  );
};

export default RoleBadge;
