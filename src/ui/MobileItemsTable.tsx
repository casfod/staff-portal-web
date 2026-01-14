import { ItemGroupType } from "../interfaces";
import { moneyFormat } from "../utils/moneyFormat";

const MobileItemsTable = ({ itemGroups }: { itemGroups?: ItemGroupType[] }) => (
  <div className="md:hidden space-y-4 mb-4">
    {itemGroups!.map((item, index) => {
      const description = item.description || item.expense || "";

      return (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
        >
          <div className="space-y-3">
            {/* Header with index */}
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-bold text-gray-700">Item {index + 1}</span>
              <span className="font-bold">
                {moneyFormat(item.total, "NGN")}
              </span>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <div>
                  <span className="font-medium text-gray-600 text-sm">
                    Qty:
                  </span>
                  <span className="ml-2">{item.quantity}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600 text-sm">
                    Frequency:
                  </span>
                  <span className="ml-2">{item.frequency}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div>
              <span className="font-medium text-gray-600 text-sm">Unit:</span>
              <span className="ml-2">{item.unit}</span>
            </div>
          </div>

          <div>
            <span className="font-medium text-gray-600 text-sm">
              Unit Cost:
            </span>
            <span className="ml-2">{moneyFormat(item.unitCost, "NGN")}</span>
          </div>

          <div className="text-center p-2">
            <p className="font-bold">TOTAL</p>
            <div className="font-bold ">{moneyFormat(item.total, "NGN")}</div>
          </div>

          {/* Description/Expense - Full width */}
          <div className="border-t pt-2">
            <span className="font-semibold text-gray-700 block mb-1">
              {item.description ? "Description:" : "Expense:"}
            </span>
            <p className="text-gray-900">{description}</p>
          </div>
        </div>
      );
    })}

    {/* Total Summary */}
    {itemGroups!.length > 0 && (
      <div className="rounded-lg border border-blue-200 p-4 mt-4">
        <div className="flex justify-between flex-wrap items-center">
          <span className="font-bold text-gray-800">Total Amount:</span>
          <span className="font-bold text-sm">
            {moneyFormat(
              itemGroups!.reduce((sum, item) => sum + item.total, 0),
              "NGN"
            )}
          </span>
        </div>
      </div>
    )}
  </div>
);

export default MobileItemsTable;
