// components/custom/DataTable.tsx
import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { TableHeaderConfig } from '../../interfaces';

interface DataTableProps<T> {
  data: T[];
  headers: TableHeaderConfig[];
  isLoading: boolean;
  isError?: boolean;
  renderRow: (item: T, index: number) => ReactNode;
  emptyMessage?: string;
  emptySubMessage?: string;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
}

export const DataTable = <T extends { id: string }>({
  data,
  headers,
  isLoading,
  isError,
  renderRow,
  emptyMessage = 'No items found',
  emptySubMessage = 'Try adjusting your search or create a new one',
  loadingComponent,
  errorComponent,
}: DataTableProps<T>) => {
  if (isError && errorComponent) return errorComponent;

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden border">
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 hidden sm:table-header-group">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className={`
                    px-3 py-2.5 md:px-4 md:py-3 
                    text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                    ${!header.showOnMobile ? 'hidden md:table-cell' : ''}
                    ${header.showOnTablet ? 'hidden sm:table-cell md:table-cell' : ''}
                    whitespace-nowrap
                  `}
                  style={{ minWidth: header.minWidth }}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={headers.length} className="py-12">
                  <div className="flex justify-center items-center">
                    {loadingComponent || (
                      <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                    )}
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="py-12">
                  <div className="flex flex-col justify-center items-center text-gray-500">
                    <div className="text-lg font-semibold mb-2">{emptyMessage}</div>
                    <div className="text-sm">{emptySubMessage}</div>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => renderRow(item, index))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
