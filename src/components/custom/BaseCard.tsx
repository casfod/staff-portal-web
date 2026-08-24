// components/custom/BaseCard.tsx
import { ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface BaseCardProps {
  // Remove 'id' if it's not being used
  // id: string;  // ← Remove this line
  title: string;
  status?: ReactNode;
  amount?: string;
  date?: string;
  actions?: ReactNode;
  children?: ReactNode;
  isExpanded?: boolean;
  onToggle?: () => void;
  className?: string;
}

export const BaseCard = ({
  // id, // ← Remove this line
  title,
  status,
  amount,
  date,
  actions,
  children,
  isExpanded = false,
  onToggle,
  className = '',
}: BaseCardProps) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Card Header - Clickable to expand */}
      <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={onToggle}>
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <button
                onClick={e => {
                  e.stopPropagation();
                  onToggle?.();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              <span className="font-medium text-sm truncate">{title}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {status && <span className="text-xs">{status}</span>}
              {amount && <span className="text-xs font-semibold">{amount}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {date && <span className="text-xs text-gray-500">{date}</span>}
            {actions}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && children && (
        <div className="border-t border-gray-200 p-4 bg-gray-50/50">{children}</div>
      )}
    </div>
  );
};
