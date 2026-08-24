// components/custom/BaseTableRow.tsx
import { ReactNode, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface BaseTableRowProps {
  id: string;
  rowData: Array<{
    id: string;
    content: ReactNode;
    showOnMobile?: boolean;
    showOnTablet?: boolean;
  }>;
  expandedContent?: ReactNode;
  mobileCard?: ReactNode;
  isExpandable?: boolean;
  className?: string;
}

export const BaseTableRow = ({
  id,
  rowData,
  expandedContent,
  mobileCard,
  isExpandable = true,
  className = '',
}: BaseTableRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => setIsExpanded(prev => !prev);

  // Mobile row click handler
  const handleMobileRowClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, a, [role="button"], input, select, textarea')) return;
    toggleExpanded();
  };

  return (
    <>
      {/* Desktop/Tablet View */}
      <tr
        onClick={toggleExpanded}
        className={`hidden sm:table-row hover:bg-gray-50/50 transition-colors ${className}`}
      >
        {rowData.map(({ id: dataId, content, showOnMobile = true, showOnTablet }) => (
          <td
            key={`${id}-${dataId}`}
            className={`
              px-3 py-2.5 md:px-4 md:py-3 text-sm
              ${!showOnMobile ? 'hidden md:table-cell' : ''}
              ${showOnTablet ? 'hidden sm:table-cell md:table-cell' : ''}
            `}
          >
            {isExpandable && dataId === 'name' ? (
              <div className="flex items-center gap-2">
                <button
                  // onClick={toggleExpanded}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                <span className="uppercase">{content}</span>
              </div>
            ) : (
              content
            )}
          </td>
        ))}
      </tr>

      {/* Expanded Details Row - Desktop/Tablet */}
      {isExpanded && expandedContent && (
        <tr className="hidden sm:table-row">
          <td colSpan={rowData.length} className="px-3 py-4 md:px-6 bg-gray-50/50">
            <div className="border border-gray-200 rounded-lg p-1 sm:p-4 bg-white">
              {expandedContent}
            </div>
          </td>
        </tr>
      )}

      {/* Mobile View */}
      {mobileCard && (
        <tr className="sm:hidden">
          <td colSpan={rowData.length} className="p-0 border-b border-gray-200">
            <div onClick={handleMobileRowClick} className="cursor-pointer">
              {mobileCard}
            </div>
          </td>
        </tr>
      )}

      {/* Expanded Details Row - Mobile */}
      {isExpanded && expandedContent && (
        <tr className="sm:hidden">
          <td colSpan={rowData.length} className="px-0 py-4 bg-gray-50/50 border-b border-gray-200">
            <div className="px-1">{expandedContent}</div>
          </td>
        </tr>
      )}
    </>
  );
};
