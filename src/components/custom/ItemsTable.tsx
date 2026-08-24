import { Fragment, useMemo } from 'react';
import { IItemGroup, IExpenseItem } from '../../interfaces';
import { moneyFormat } from '../../utils/moneyFormat';

interface ItemsTableProps {
  itemGroups?: IItemGroup[] | IExpenseItem[];
}

const TABLE_HEAD_DATA = ['Name', 'Quantity', 'Frequency', 'Unit', 'Unit Cost', 'Total'] as const;

// Type guard to check if item is IItemGroup
const isItemGroup = (item: IItemGroup | IExpenseItem): item is IItemGroup => {
  return 'itemName' in item;
};

// Type guard to check if item is IExpenseItem
const isExpenseItem = (item: IItemGroup | IExpenseItem): item is IExpenseItem => {
  return 'expense' in item;
};

const ItemsTable = ({ itemGroups = [] }: ItemsTableProps) => {
  // Memoize the calculation of total sum with proper null/undefined handling
  const totalSum = useMemo(() => {
    return itemGroups.reduce((sum, item) => {
      const total = item.total ?? 0; // Use nullish coalescing to handle undefined
      return sum + total;
    }, 0);
  }, [itemGroups]);

  // Early return for empty itemGroups
  if (itemGroups.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No items to display</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden mb-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {TABLE_HEAD_DATA.map(data => (
                <th
                  key={data}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                >
                  {data}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {itemGroups.map((item, index) => {
              // Determine the display name based on available fields using type guards
              let name = '';
              if (isItemGroup(item)) {
                name = item.itemName || '';
              } else if (isExpenseItem(item)) {
                name = item.expense || '';
              }

              const description = item.description || '';

              // Check if we have description
              const hasDescription = description.trim().length > 0;

              return (
                <Fragment key={item.id || index}>
                  {/* Main item row */}
                  <tr
                    key={`${item.id || index}-main`}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Name Cell */}
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 font-medium whitespace-normal break-words">
                        {name || <span className="text-gray-400 italic">No name</span>}
                      </div>
                    </td>

                    {/* Quantity Cell */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 text-center">{item.quantity ?? 0}</div>
                    </td>

                    {/* Frequency Cell */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 text-center">{item.frequency ?? 0}</div>
                    </td>

                    {/* Unit Cell */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.unit || 'N/A'}</div>
                    </td>

                    {/* Unit Cost Cell */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {moneyFormat(item.unitCost ?? 0, 'NGN')}
                      </div>
                    </td>

                    {/* Total Cost Cell */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {moneyFormat(item.total ?? 0, 'NGN')}
                      </div>
                    </td>
                  </tr>

                  {/* Description row - spans full width */}
                  {hasDescription && (
                    <tr
                      key={`${item.id || index}-desc`}
                      className="bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <td colSpan={TABLE_HEAD_DATA.length} className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          <div className="text-xs font-medium text-gray-500 mt-0.5">
                            Description:
                          </div>
                          <div className="text-sm text-gray-700 whitespace-normal break-words flex-1">
                            {description}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>

          {/* Total Row */}
          {itemGroups.length > 0 && (
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-3 text-right text-sm font-semibold text-gray-700"
                >
                  Total:
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">
                    {moneyFormat(totalSum, 'NGN')}
                  </div>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default ItemsTable;
