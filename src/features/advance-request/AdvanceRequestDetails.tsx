// import { dateformat } from "../../utils/dateFormat";
import { moneyFormat } from "../../utils/moneyFormat";
import { AdvanceRequestType } from "../../interfaces";
import { useParams } from "react-router-dom";
import { dateformat } from "../../utils/dateFormat";
import FileAttachmentContainer from "../../ui/FileAttachmentContainer";

interface RequestDetailsProps {
  request: AdvanceRequestType;
}

const tableHeadData = [
  "Description",
  "Quantity",
  "Frequency",
  "Unit Cost",
  "Total",
];

const ItemsTable = ({
  itemGroups,
}: {
  itemGroups: AdvanceRequestType["itemGroups"];
}) => (
  <table className=" min-w-full divide-y divide-gray-200 rounded-md mb-4">
    <thead>
      <tr>
        {tableHeadData.map((data, index) => (
          <th
            key={index}
            className="px-6 py-2 bg-gray-50 text-left text-sm font-medium text-gray-600 uppercase tracking-wider"
          >
            {data}
          </th>
        ))}
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200 ">
      {itemGroups!.map((item) => {
        const rowData = [
          { id: "description", content: item.description },
          { id: "quantity", content: item.quantity },
          { id: "frequency", content: item.frequency },
          { id: "unitCost", content: moneyFormat(item.unitCost, "NGN") },
          { id: "total", content: moneyFormat(item.total, "NGN") },
        ];

        return (
          <tr key={item.id!}>
            {rowData.map((data) => (
              <td
                key={data.id}
                className="px-6 py-4 text-sm text-gray-600 break-words max-w-xs"
              >
                {data.content}
              </td>
            ))}
          </tr>
        );
      })}
    </tbody>
  </table>
);

export const AdvanceRequestDetails = ({ request }: RequestDetailsProps) => {
  const param = useParams();

  const isInspect = param.requestId!;

  const rowData = [
    {
      id: "accountCode",
      label: "Account Code :",
      content: request.accountCode,
    },
    {
      id: "expenseChargedTo",
      label: "Charged To :",
      content: request.expenseChargedTo,
    },
    {
      id: "address",
      label: "Address :",
      content: request.address,
    },
    {
      id: "city",
      label: "City :",
      content: request.city,
    },
    {
      id: "finalDeliveryPoint",
      label: "Delivery Point",
      content: request.finalDeliveryPoint,
    },
    {
      id: "periodOfActivity",
      label: "Period Of Activity :",
      content: `${dateformat(request.periodOfActivity.from)} - ${dateformat(
        request.periodOfActivity.to
      )}`,
    },
    {
      id: "activityDescription",
      label: "Activity Description :",
      content: request.activityDescription,
    },
  ];

  const accCardData = [
    { label: "Account Name", value: request.accountName },
    { label: "Account Number", value: request.accountNumber },
    { label: "Bank Name", value: request.bankName },
  ];

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
        } text-gray-600 mb-3 border-b border-gray-300 pb-6`}
      >
        <div
          className="flex flex-col gap-2 md:gap-3 w-full text-gray-600 text-sm mb-3"
          style={{ letterSpacing: "1px" }}
        >
          {rowData.map((data) => (
            <p>
              <span key={data.id} className="font-bold mr-1 uppercase">
                {" "}
                {data.label}
              </span>
              {data.content}
            </p>
          ))}
        </div>

        <div className="w-fit h-fit border border-gray-300 space-y-3 shadow-md p-5 rounded-lg">
          <h2 className="font-bold">RECIPIENTS INFORMATION</h2>

          {accCardData.map(({ label, value }) => (
            <div key={label} className="whitespace-pre-line ">
              <h2 className="font-extrabold uppercase mb-1">{label}:</h2>
              <p>{value}</p>
            </div>
          ))}
        </div>
      </div>

      <h2
        className="text-center text-lg text-gray-600 font-semibold"
        style={{ letterSpacing: "2px" }}
      >
        ITEMS
      </h2>
      <ItemsTable itemGroups={request.itemGroups} />

      {/* File Attachments Section */}
      {request.files && request.files.length > 0 && (
        <FileAttachmentContainer files={request.files} />
      )}
    </div>
  );
};
