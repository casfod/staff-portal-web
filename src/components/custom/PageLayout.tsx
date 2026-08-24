// components/custom/PageLayout.tsx
import { ReactNode } from 'react';
import { Button } from '../ui/button';
import { List, Plus, Download } from 'lucide-react';
import TextHeader from './TextHeader';
import SpinnerMini from './SpinnerMini';

interface PageLayoutProps {
  title: string;
  children: ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  showAddButton?: boolean;
  onAdd?: () => void;
  addButtonLabel?: string;
  showSearch?: boolean;
  searchComponent?: ReactNode;
  actions?: ReactNode;
  // Export props
  showExport?: boolean;
  onExport?: () => void;
  exportLabel?: string;
  isExporting?: boolean;
}

export const PageLayout = ({
  title,
  children,
  showBackButton,
  onBack,
  showAddButton,
  onAdd,
  addButtonLabel = 'Add',
  showSearch,
  searchComponent,
  actions,
  showExport,
  onExport,
  exportLabel = 'Export Excel',
  isExporting = false,
}: PageLayoutProps) => {
  return (
    <div className="flex flex-col space-y-4 pb-20">
      {/* Header */}
      <div className="sticky -top-8 z-10 bg-[#F8F8F8] pt-4 pb-2 space-y-6 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>{title}</TextHeader>
          <div className="flex items-center gap-2">
            {actions}
            {showExport && onExport && (
              <Button variant="primary" onClick={onExport} disabled={isExporting} size="sm">
                {isExporting ? (
                  <>
                    <SpinnerMini size="md" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">{exportLabel}</span>
                    <span className="sm:hidden">Export</span>
                  </>
                )}
              </Button>
            )}
            {showBackButton && (
              <Button variant="outline" onClick={onBack}>
                <List className="h-4 w-4 mr-1 md:mr-2" />
                List
              </Button>
            )}
            {showAddButton && (
              <Button onClick={onAdd} variant="outline" size={'sm'}>
                <Plus className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">{addButtonLabel}</span>
                <span className="sm:hidden">New</span>
              </Button>
            )}
          </div>
        </div>

        {showSearch && searchComponent && (
          <div className="flex items-center space-x-4">{searchComponent}</div>
        )}
      </div>

      {children}
    </div>
  );
};
