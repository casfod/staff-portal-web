// import { dateformat } from "../../utils/dateFormat";
import { moneyFormat } from "../../utils/moneyFormat";
import { PurChaseRequestType } from "../../interfaces";
import { useParams } from "react-router-dom";

interface RequestDetailsProps {
  request: PurChaseRequestType;
}

const ItemsTableData = [
  "Description",
  "Quantity",
  "Frequency",
  "Unit Cost",
  "Total",
];
const ItemsTable = ({
  itemGroups,
}: {
  itemGroups: PurChaseRequestType["itemGroups"];
}) => (
  <table className="min-w-full divide-y divide-gray-200 rounded-md mb-4 overflow-x-scroll">
    <thead>
      <tr>
        {ItemsTableData.map((data, index) => (
          <th
            key={index}
            className="px-6 py-2 bg-gray-50 text-left text-sm font-medium text-gray-600 uppercase tracking-wider"
          >
            {data}
          </th>
        ))}
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {itemGroups!.map((item) => (
        <tr key={item.id!}>
          <td className="px-6 py-4 text-sm text-gray-600 break-words max-w-xs">
            {item.description}
          </td>
          <td className="px-6 py-4 text-sm text-gray-600 break-words">
            {item.quantity}
          </td>
          <td className="px-6 py-4 text-sm text-gray-600 break-words">
            {item.frequency}
          </td>
          <td className="px-6 py-4 text-sm text-gray-600 break-words">
            {moneyFormat(item.unitCost, "NGN")}
          </td>
          <td className="px-6 py-4 text-sm text-gray-600 break-words">
            {moneyFormat(item.total, "NGN")}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export const PurchaseRequestDetails = ({ request }: RequestDetailsProps) => {
  const param = useParams();

  const isInspect = param.requestId!;

  return (
    <div
      className={`border border-gray-300 px-6 py-4 rounded-lg shadow-sm ${
        !isInspect && "bg-[#F8F8F8]"
      }`}
    >
      <div
        className="flex flex-col gap-2 w-full text-gray-600 text-sm mb-3 break-words"
        style={{ letterSpacing: "1px" }}
      >
        <p>
          <span className="font-bold mr-1 uppercase">Account Code : </span>{" "}
          {request.accountCode}
        </p>
        <p>
          <span className="font-bold mr-1 uppercase">Charged To : </span>
          {request.expenseChargedTo}
        </p>
        <p>
          <span className="font-bold mr-1 uppercase">Address : </span>{" "}
          {request.address}
        </p>
        <p>
          <span className="font-bold mr-1 uppercase">City : </span>{" "}
          {request.city}
        </p>
        <p>
          <span className="font-bold mr-1 uppercase">Delivery Point : </span>
          {request.finalDeliveryPoint}
        </p>

        <p>
          <span className="font-bold mr-1 uppercase">Period Of Activity :</span>
          {request.periodOfActivity}
        </p>
        <p>
          <span className="font-bold mr-1 uppercase">
            Activity Description :{" "}
          </span>
          {request.activityDescription}
        </p>
      </div>

      <h2
        className="text-center text-lg text-gray-600 font-semibold break-words"
        style={{ letterSpacing: "2px" }}
      >
        ITEMS
      </h2>
      <ItemsTable itemGroups={request.itemGroups} />
    </div>
  );
};
