import { Checkbox } from '../../components/ui/checkbox';
import { CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { memo, useCallback } from 'react';

interface PermissionCheckboxProps {
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}

export const PermissionCheckbox = memo(
  ({ label, description, checked, disabled, onToggle }: PermissionCheckboxProps) => {
    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
          onToggle();
        }
      },
      [disabled, onToggle]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault();
          onToggle();
        }
      },
      [disabled, onToggle]
    );

    // Fix: Prefix unused parameter with underscore or remove it
    const handleCheckedChange = useCallback(() => {
      if (!disabled) {
        onToggle();
      }
    }, [disabled, onToggle]);

    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3 sm:p-2.5 rounded-lg border transition-all duration-200 select-none',
          disabled
            ? 'cursor-default opacity-60'
            : 'cursor-pointer hover:shadow-sm active:scale-[0.99]',
          checked
            ? 'border-brand-500 bg-brand-50 shadow-sm'
            : 'border-gray-200 hover:border-gray-300'
        )}
        onClick={handleClick}
        role={disabled ? 'presentation' : 'button'}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
      >
        <Checkbox
          checked={checked}
          onCheckedChange={handleCheckedChange}
          disabled={disabled}
          className={cn(
            'h-5 w-5 sm:h-4 sm:w-4 flex-shrink-0 pointer-events-none',
            checked && 'border-brand-500 bg-brand-500'
          )}
        />
        <div className="flex-1 min-w-0">
          <div className="sm:hidden text-sm sm:text-sm font-medium text-gray-900">{label}</div>
          <div className="hidden sm:block  text-xs text-gray-800">{description}</div>
        </div>
        {checked && <CheckCircle className="h-5 w-5 sm:h-4 sm:w-4 text-brand-500 flex-shrink-0" />}
      </div>
    );
  }
);

PermissionCheckbox.displayName = 'PermissionCheckbox';
