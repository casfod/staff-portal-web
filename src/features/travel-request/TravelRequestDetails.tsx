import { TravelRequestType } from "../../interfaces";
import { moneyFormat } from "../../utils/moneyFormat";

interface RequestDetailsProps {
  request: TravelRequestType;
  isInspect?: boolean;
}

const ExpenseTable = ({
  expenses,
}: {
  expenses: TravelRequestType["expenses"];
}) => (
  <table className="min-w-full divide-y divide-gray-200 rounded-md mb-4">
    <thead>
      <tr>
        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Expense
        </th>
        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Location
        </th>
        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Number Of Days
        </th>
        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Rate
        </th>
        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Total
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {expenses?.map((expense, index) => (
        <tr key={index}>
          <td className="px-6 py-4 max-w-xs break-words text-sm text-gray-500">
            {expense.expense}
          </td>
          <td className="px-6 py-4 max-w-xs break-words text-sm text-gray-500">
            {expense.location}
          </td>
          <td className="px-6 py-4 max-w-xs break-words text-sm text-gray-500">
            {expense.daysNumber}
          </td>
          <td className="px-6 py-4 max-w-xs break-words text-sm text-gray-500">
            {moneyFormat(expense.rate, "NGN")}
          </td>
          <td className="px-6 py-4 max-w-xs break-words text-sm text-gray-500">
            {moneyFormat(expense.total, "NGN")}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const TravelRequestDetails = ({ request }: RequestDetailsProps) => {
  const totalAmount =
    request.expenses?.reduce((sum, item) => sum + item.total, 0) || 0;

  return (
    <div className={`break-words`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-300 pb-6">
        <div className="flex flex-col gap-2 text-gray-700 text-sm tracking-wide">
          <p>
            <span className="font-bold mr-1 uppercase">Staff Name:</span>
            {request.staffName}
          </p>
          <p>
            <span className="font-bold mr-1 uppercase">Day Of Departure:</span>
            {request.dayOfDeparture}
          </p>
          <p>
            <span className="font-bold mr-1 uppercase">Day Of Return:</span>
            {request.dayOfReturn}
          </p>
        </div>
        <div className="flex flex-col gap-2 text-gray-700 text-sm tracking-wide">
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

      <h2 className="text-center text-lg text-gray-700 font-semibold break-words">
        EXPENSES
      </h2>

      <ExpenseTable expenses={request.expenses} />
    </div>
  );
};

export default TravelRequestDetails;
