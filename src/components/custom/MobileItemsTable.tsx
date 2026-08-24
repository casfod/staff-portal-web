// MobileItemsTable.tsx - Fixed Version

import { IUnifiedItem, IItemGroup, IExpenseItem } from '../../interfaces';
import { moneyFormat } from '../../utils/moneyFormat';

// Type guard to check if item is IItemGroup
const isItemGroup = (item: IUnifiedItem): item is IItemGroup => {
  return 'itemName' in item;
};

// Type guard to check if item is IExpenseItem
const isExpenseItem = (item: IUnifiedItem): item is IExpenseItem => {
  return 'expense' in item;
};

const MobileItemsTable = ({ itemGroups }: { itemGroups?: IUnifiedItem[] }) => {
  if (!itemGroups || itemGroups.length === 0) {
    return <div className="md:hidden text-center py-8 text-gray-500">No items to display</div>;
  }

  return (
    <div className="md:hidden space-y-4 mb-4">
      {itemGroups.map((item, index) => {
        // Type-safe property access using type guards
        const description = item.description || '';
        const itemName = isItemGroup(item) ? item.itemName : undefined;

        const displayName = itemName ? `${itemName}` : `Item ${index + 1}`;

        return (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 shadow-md">
            <div className="space-y-3">
              {/* Header with index */}
              <div className="flex items-center justify-center border-b pb-2">
                <span className="text-xs font-bold uppercase text-gray-700">{displayName}</span>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <div>
                    <span className="font-medium text-gray-600 text-sm">Qty:</span>
                    <span className="ml-2">{item.quantity}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600 text-sm">Frequency:</span>
                    <span className="ml-2">{item.frequency}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div>
                    <span className="font-medium text-gray-600 text-sm">Unit:</span>
                    <span className="ml-2">{item.unit}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600 text-sm">Unit Cost:</span>
                    <span className="ml-2">{moneyFormat(item.unitCost, 'NGN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-end p-2 mt-2 border-t">
              <p className="font-bold">TOTAL</p>
              <div className="font-bold">{moneyFormat(item.total ?? 0, 'NGN')}</div>
            </div>

            {/* Expense - Only for IExpenseItem */}
            {isExpenseItem(item) && item.expense && (
              <div className="border-t pt-2">
                <span className="font-semibold text-gray-700 block mb-1">Expense:</span>
                <p className="text-gray-900">{item.expense}</p>
              </div>
            )}

            {/* Description - For both types */}
            {description && (
              <div className="border-t pt-2">
                <span className="font-semibold text-gray-700 block mb-1">Description:</span>
                <p className="text-gray-900">{description}</p>
              </div>
            )}
          </div>
        );
      })}

      {/* Total Summary */}
      <div className="rounded-lg border border-blue-200 p-4 mt-4">
        <div className="flex justify-between flex-wrap items-center">
          <span className="font-bold text-gray-800">Total Amount:</span>
          <span className="font-bold text-sm">
            {moneyFormat(
              itemGroups.reduce((sum, item) => sum + (item.total || 0), 0),
              'NGN'
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MobileItemsTable;
