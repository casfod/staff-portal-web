import { ItemGroupType } from "../interfaces";
import { moneyFormat } from "../utils/moneyFormat";

const tableHeadData = [
  "Item Name",
  "Description",
  "Quantity",
  "Frequency",
  "Unit",
  "Unit Cost",
  "Total",
];

const ItemsTable = ({ itemGroups }: { itemGroups?: ItemGroupType[] }) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
    <div className="min-w-full inline-block align-middle">
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="table-row">
              {tableHeadData.map((data, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                >
                  {data}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {itemGroups!.map((item, index) => {
              // Use description for Purchase/Advance, expense for Travel/Expense
              const description = item.description || item.expense || "";
              const itemName = item.itemName || null;

              const rowData = [
                { id: "itemName", content: itemName },
                { id: "description", content: description },
                { id: "quantity", content: item.quantity },
                { id: "frequency", content: item.frequency },
                { id: "unit", content: item.unit },
                { id: "unitCost", content: moneyFormat(item.unitCost, "NGN") },
                { id: "total", content: moneyFormat(item.total, "NGN") },
              ];

              return (
                <tr
                  key={index}
                  className="table-row hover:bg-gray-50 transition-colors"
                >
                  {rowData.map((data) => (
                    <td
                      key={data.id}
                      className="px-4 py-4 whitespace-normal break-words"
                    >
                      <div className="text-sm text-gray-900">
                        {data.content}
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default ItemsTable;
