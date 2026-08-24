// components/custom/ListPage.tsx
import { ReactNode } from 'react';
import { PageLayout } from './PageLayout';
import { DataTable } from './DataTable';
import { Pagination } from './Pagination';
import { TableHeaderConfig } from '../../interfaces';

interface ListPageProps<T> {
  title: string;
  data: T[];
  headers: TableHeaderConfig[];
  isLoading: boolean;
  isError?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  renderRow: (item: T, index: number) => ReactNode;
  onSearchChange?: (value: string) => void;
  onAdd?: () => void;
  addButtonLabel?: string;
  emptyMessage?: string;
  emptySubMessage?: string;
  children?: ReactNode;
  searchComponent?: ReactNode;
  // Export props
  showExport?: boolean;
  onExport?: () => void;
  exportLabel?: string;
  isExporting?: boolean;
}

export const ListPage = <T extends { id: string }>({
  title,
  data,
  headers,
  isLoading,
  isError,
  currentPage,
  totalPages,
  onPageChange,
  renderRow,
  onSearchChange,
  onAdd,
  addButtonLabel = 'Add',
  emptyMessage,
  emptySubMessage,
  children,
  searchComponent,
  showExport = false,
  onExport,
  exportLabel = 'Export Excel',
  isExporting = false,
}: ListPageProps<T>) => {
  return (
    <PageLayout
      title={title}
      showAddButton={!!onAdd}
      onAdd={onAdd}
      addButtonLabel={addButtonLabel}
      showSearch={!!onSearchChange || !!searchComponent}
      searchComponent={searchComponent}
      showExport={showExport}
      onExport={onExport}
      exportLabel={exportLabel}
      isExporting={isExporting}
    >
      {children}
      <DataTable
        data={data}
        headers={headers}
        isLoading={isLoading}
        isError={isError}
        renderRow={renderRow}
        emptyMessage={emptyMessage}
        emptySubMessage={emptySubMessage}
      />

      {(data.length > 0 || totalPages > 1) && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </PageLayout>
  );
};
