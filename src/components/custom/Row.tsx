import React from 'react';
import { cn } from '../../lib/utils';

interface RowProps {
  children: React.ReactNode;
  cols?: number | string;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
}

const Row: React.FC<RowProps> = ({
  children,
  cols = 1,
  gap = 'md',
  align = 'stretch',
  className = '',
}) => {
  const colClasses = typeof cols === 'number' ? `grid-cols-${Math.min(cols, 12)}` : cols;

  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
    xl: 'gap-6',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  return (
    <div className={cn('w-full grid', colClasses, gapClasses[gap], alignClasses[align], className)}>
      {children}
    </div>
  );
};

export default Row;
