import { TravelRequestType } from "../../interfaces";
import { dateformat } from "../../utils/dateFormat";
import { moneyFormat } from "../../utils/moneyFormat";

interface RequestDetailsProps {
  request: TravelRequestType;
  isInspect?: boolean;
}

const ItemsTableData = [
  "Expense",
  "Quantity",
  "Frequency",
  "Unit Cost",
  "Total",
];

const ExpenseTable = ({
  expenses,
}: {
  expenses: TravelRequestType["expenses"];
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
      {expenses!.map((item) => (
        <tr key={item.id!}>
          <td className="px-6 py-4 text-sm text-gray-600 break-words max-w-xs">
            {item.expense ?? "N/A"}
          </td>
          <td className="px-6 py-4 text-sm text-gray-600 break-words">
            {item.quantity ?? "N/A"}
          </td>
          <td className="px-6 py-4 text-sm text-gray-600 break-words">
            {item.frequency ?? "N/A"}
          </td>
          <td className="px-6 py-4 text-sm text-gray-600 break-words">
            {item.unitCost ? moneyFormat(item.unitCost, "NGN") : "N/A"}
          </td>
          <td className="px-6 py-4 text-sm text-gray-600 break-words">
            {item.total ? moneyFormat(item.total, "NGN") : "N/A"}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const TravelRequestDetails = ({ request, isInspect }: RequestDetailsProps) => {
  const totalAmount =
    request.expenses?.reduce((sum, item) => sum + item.total, 0) || 0;

  return (
    <div
      className={`border border-gray-300 px-6 py-4 rounded-lg shadow-sm ${
        !isInspect && "bg-[#F8F8F8]"
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-300 pb-6 break-words">
        <div className="flex flex-col gap-2 text-gray-600 text-sm tracking-wide">
          <p>
            <span className="font-bold mr-1 uppercase">Staff Name:</span>
            {request.staffName}
          </p>
          <p>
            <span className="font-bold mr-1 uppercase">Day Of Departure:</span>
            {dateformat(request.dayOfDeparture!)}
          </p>
          <p>
            <span className="font-bold mr-1 uppercase">Day Of Return:</span>
            {dateformat(request.dayOfReturn)}
          </p>
          <p>
            <span className="font-bold mr-1 uppercase">Project:</span>
            {request.amountInWords}
          </p>
        </div>

        <div className="flex flex-col gap-2 text-gray-600 text-sm tracking-wide">
          <p>
            <span className="font-bold uppercase">Travel Request:</span>{" "}
            {request.travelRequest.from} - {request.travelRequest.to}
          </p>
          <p>
            <span className="font-bold mr-1 uppercase">Project:</span>
            {request.project}
          </p>
          <p>
            <span className="font-bold mr-1 uppercase">Total Amount:</span>
            {moneyFormat(totalAmount, "NGN")}
          </p>
        </div>
      </div>

      <h2 className="text-center text-lg text-gray-600 font-semibold tracking-wide my-4 break-words">
        EXPENSES
      </h2>

      <ExpenseTable expenses={request.expenses} />
    </div>
  );
};

export default TravelRequestDetails;
