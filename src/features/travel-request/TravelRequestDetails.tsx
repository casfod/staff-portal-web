import { moneyFormat } from "../../utils/moneyFormat";
import { TravelRequestType } from "../../interfaces";
import { useParams } from "react-router-dom";

interface RequestDetailsProps {
  request: TravelRequestType;
}

export const TravelRequestDetails = ({ request }: RequestDetailsProps) => {
  const param = useParams();

  const isInspect = param.requestId!;

  return (
    <div
      className={`border border-gray-300 px-6 py-4 rounded-lg shadow-sm ${
        !isInspect && "bg-[#F8F8F8]"
      }`}
    >
      {/* Request Details Section */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
          !isInspect && "text-sm"
        } text-gray-700 mb-3 border-b border-gray-300 pb-6`}
      >
        <div
          className="flex flex-col gap-2 w-full text-gray-700 text-sm mb-3"
          style={{ letterSpacing: "1px" }}
        >
          <p>
            <span className="font-bold mr-1 uppercase">Staff Name : </span>{" "}
            {request.staffName}
          </p>
          <p>
            <span className="font-bold mr-1 uppercase">
              Day Of Departure :{" "}
            </span>{" "}
            {request.dayOfDeparture}
          </p>
          <p>
            <span className="font-bold mr-1 uppercase">Day Of Return : </span>{" "}
            {request.dayOfReturn}
          </p>

          <p className="text-sm text-gray-700">
            <span className="font-extrabold uppercase">Travel Request:</span>{" "}
            <span>{request.travelRequest.from}</span> -{" "}
            <span>{request.travelRequest.to}</span>
          </p>
          <p>
            <span className="font-bold mr-1 uppercase">project: </span>
            {request.project}
          </p>
        </div>
      </div>

      <h2
        className="text-center text-lg text-gray-700 font-semibold"
        style={{ letterSpacing: "2px" }}
      >
        EXPENSES
      </h2>
      <table className=" min-w-full divide-y divide-gray-200 rounded-md mb-4">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expence
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
        <tbody className="bg-white divide-y divide-gray-200 ">
          {request?.expenses!.map((expense, index) => (
            <tr key={index!}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {expense.expense}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {expense.location}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {expense.daysNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {expense.rate}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {moneyFormat(expense.total, "NGN")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
