// import { dateformat } from "../../utils/dateFormat";
import { moneyFormat } from "../../utils/moneyFormat";
import { AdvanceRequestType } from "../../interfaces";
import { useParams } from "react-router-dom";

interface RequestDetailsProps {
  request: AdvanceRequestType;
}

export const AdvanceRequestDetails = ({ request }: RequestDetailsProps) => {
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
            <span className="font-bold mr-1 uppercase">Department : </span>{" "}
            {request.department}
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

          <p className="text-sm text-gray-700">
            <span className="font-extrabold uppercase">
              Period Of Activity:
            </span>{" "}
            <span>{request.periodOfActivity.from}</span> -{" "}
            <span>{request.periodOfActivity.to}</span>
          </p>
          <p>
            <span className="font-bold mr-1 uppercase">
              Activity Description :{" "}
            </span>
            {request.activityDescription}
          </p>
        </div>

        <div className="w-fit h-fit border border-gray-300 space-y-3 shadow-md p-5 rounded-lg">
          <h2 className="font-bold">RECIPIENTS INFORMATION</h2>

          {[
            { label: "Account Name", value: request.accountName },
            { label: "Account Number", value: request.accountNumber },
            { label: "Bank Name", value: request.bankName },
          ].map(({ label, value }) => (
            <div key={label} className="whitespace-pre-line ">
              <h2 className="font-extrabold uppercase mb-1">{label}:</h2>
              <p>{value}</p>
            </div>
          ))}

          {/* <p>
            <span className="font-extrabold uppercase">Budget:</span>{" "}
            {moneyFormat(Number(request.amountInFigure), "NGN")}
          </p> */}
        </div>
      </div>

      <h2
        className="text-center text-lg text-gray-700 font-semibold"
        style={{ letterSpacing: "2px" }}
      >
        ITEMS
      </h2>
      <table className=" min-w-full divide-y divide-gray-200 rounded-md mb-4">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantity
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Frequency
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Unit Cost
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 ">
          {request?.itemGroups!.map((item) => (
            <tr key={item.id!}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.quantity}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.frequency}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {moneyFormat(item.unitCost, "NGN")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {moneyFormat(item.total, "NGN")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
