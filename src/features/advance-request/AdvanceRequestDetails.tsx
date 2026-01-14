import { moneyFormat } from "../../utils/moneyFormat";
import { AdvanceRequestType } from "../../interfaces";
import { useParams } from "react-router-dom";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import FileAttachmentContainer from "../../ui/FileAttachmentContainer";
import DetailContainer from "../../ui/DetailContainer";
import CopiedTo from "../../ui/CopiedTo";

interface RequestDetailsProps {
  request: AdvanceRequestType;
}

const tableHeadData = [
  "Description",
  "Quantity",
  "Frequency",
  "Unit",
  "Unit Cost",
  "Total",
];

const ItemsTable = ({
  itemGroups,
}: {
  itemGroups: AdvanceRequestType["itemGroups"];
}) => (
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
            {itemGroups!.map((item) => {
              const rowData = [
                { id: "description", content: item.description },
                { id: "quantity", content: item.quantity },
                { id: "frequency", content: item.frequency },
                { id: "unit", content: item.unit },
                { id: "unitCost", content: moneyFormat(item.unitCost, "NGN") },
                { id: "total", content: moneyFormat(item.total, "NGN") },
              ];

              return (
                <tr
                  key={item.id!}
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

// Improved Mobile-friendly alternative table view
const MobileItemsTable = ({
  itemGroups,
}: {
  itemGroups: AdvanceRequestType["itemGroups"];
}) => (
  <div className="md:hidden space-y-4 mb-4">
    {itemGroups!.map((item, index) => (
      <div
        key={item.id!}
        className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
      >
        <div className="space-y-3">
          {/* Header with index */}
          <div className="flex justify-between items-center border-b pb-2">
            <span className="font-bold text-gray-700">Item {index + 1}</span>
            <span className="font-bold">{moneyFormat(item.total, "NGN")}</span>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <div>
                <span className="font-medium text-gray-600 text-sm">Qty:</span>
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
          <span className="font-medium text-gray-600 text-sm">Unit Cost:</span>
          <span className="ml-2">{moneyFormat(item.unitCost, "NGN")}</span>
        </div>

        <div className="text-center p-2">
          <p className="font-bold">TOTAL</p>
          <div className="font-bold ">{moneyFormat(item.total, "NGN")}</div>
        </div>

        {/* Description - Full width */}
        <div className="border-t pt-2">
          <span className="font-semibold text-gray-700 block mb-1">
            Description:
          </span>
          <p className="text-gray-900">{item.description}</p>
        </div>
      </div>
    ))}

    {/* Total Summary */}
    {itemGroups!.length > 0 && (
      <div className="rounded-lg border border-blue-200 p-4 mt-4">
        <div className="flex justify-between items-center">
          <span className="font-bold text-gray-800">Total Amount:</span>
          <span className="font-bold text-xl">
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

export const AdvanceRequestDetails = ({ request }: RequestDetailsProps) => {
  const { requestId } = useParams();

  const rowData = [
    {
      id: "accountCode",
      label: "Account Code :",
      content: request.accountCode,
    },
    {
      id: "department",
      label: "Department :",
      content: request.department,
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
      label: "Delivery Point :",
      content: request.finalDeliveryPoint,
    },
    {
      id: "periodOfActivity",
      label: "Period Of Activity :",
      content: `${formatToDDMMYYYY(
        request.periodOfActivity.from
      )} - ${formatToDDMMYYYY(request.periodOfActivity.to)}`,
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
    <DetailContainer>
      {/* Request Details Section */}
      {request?.arNumber && (
        <h1 className="text-center text-lg font-extrabold p-4 md:p-6">
          {request?.arNumber}
        </h1>
      )}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 ${
          !requestId ? "text-sm" : "text-sm md:text-base"
        } mb-6 border-b border-gray-300 pb-6`}
      >
        <div className="flex flex-col items-start gap-3 md:gap-4 w-full">
          {rowData.map((data) => (
            <div
              key={data.id}
              className="w-full md:w-fit border-b-2 md:border-b-0  flex md:items-center flex-col md:flex-row gap-1 pb-2 md:pb-0"
            >
              <span className="text-sm font-bold uppercase whitespace-nowrap text-gray-700 mb-1 md:mb-0">
                {data.label}
              </span>
              <span className="break-words">{data.content}</span>
            </div>
          ))}
        </div>

        <div className="w-full h-fit border border-gray-200 space-y-4 shadow-sm p-4 md:p-5 rounded-lg bg-gray-50">
          <h2 className="font-bold text-gray-800">RECIPIENTS INFORMATION</h2>

          {accCardData.map(({ label, value }) => (
            <div key={label} className="whitespace-pre-line">
              <h2 className="text-sm font-bold uppercase mb-1 text-gray-600">
                {label}:
              </h2>
              <p className="text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-center text-base md:text-lg font-semibold tracking-widest mb-4">
        ITEMS
      </h2>

      {/* Show mobile table on small screens, desktop table on larger screens */}
      <div className="hidden md:block">
        <ItemsTable itemGroups={request.itemGroups} />
      </div>
      <div className="md:hidden">
        <MobileItemsTable itemGroups={request.itemGroups} />
      </div>

      {/* File Attachments Section */}
      {request.files && request.files.length > 0 && (
        <FileAttachmentContainer files={request.files} />
      )}

      {/* Copied To */}
      {request.copiedTo?.length! > 0 && <CopiedTo to={request.copiedTo!} />}
    </DetailContainer>
  );
};
