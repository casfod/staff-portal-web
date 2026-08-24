// FormRow.tsx - Rewritten with Radix UI
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FormRowProps {
  label: string;
  children: React.ReactNode;
  type?: 'normal' | 'wide' | 'full';
  error?: string;
  icon?: React.ReactNode;
  required?: boolean;
  className?: string;
  id?: string;
}

const FormRow: React.FC<FormRowProps> = ({
  label,
  children,
  type = 'normal',
  error,
  icon,
  required,
  className = '',
  id,
}) => {
  const typeClasses = {
    normal: '',
    wide: 'col-span-full',
    full: 'w-full',
  }[type];

  // Generate a unique ID for the label if not provided
  const labelId = id || `form-row-${Math.random().toString(36).substring(7)}`;

  return (
    <div className={cn('flex flex-col w-full', typeClasses, className)}>
      <Label
        htmlFor={labelId}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5"
      >
        {icon && <span className="text-gray-400 flex-shrink-0">{icon}</span>}
        <span className="truncate">{label}</span>
        {required && <span className="text-red-500 flex-shrink-0">*</span>}
      </Label>

      <div className="relative w-full">
        {/* Clone the child and add full width */}
        {React.isValidElement(children)
          ? React.cloneElement(children, {
              ...children.props,
              id: children.props.id || labelId,
              className: cn('w-full', children.props.className),
            })
          : children}

        {/* Error indicator - positioned absolutely */}
        {error && (
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[250px]">
                <p className="text-xs">{error}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Error message below (visible on mobile) */}
      {error && (
        <p className="text-xs text-red-500 mt-1.5 flex items-start gap-1 sm:hidden">
          <AlertCircle className="h-3 w-3 flex-shrink-0 mt-0.5" />
          <span className="flex-1">{error}</span>
        </p>
      )}
    </div>
  );
};

export default FormRow;
