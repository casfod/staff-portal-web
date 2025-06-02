// import { dateformat } from "../../utils/dateFormat";
import { moneyFormat } from "../../utils/moneyFormat";
import { AdvanceRequestType } from "../../interfaces";
import { useParams } from "react-router-dom";
import { dateformat } from "../../utils/dateFormat";
import FileAttachmentContainer from "../../ui/FileAttachmentContainer";
import DetailContainer from "../../ui/DetailContainer";

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
            className="px-6 py-2 bg-gray-50 text-left text-xs md:text-sm font-medium   uppercase tracking-wider"
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
                className="px-6 py-4 text-sm   break-words max-w-xs"
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
    <DetailContainer>
      {/* Request Details Section */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
          !requestId ? "text-sm" : "text-sm md:text-base"
        }   mb-3 border-b border-gray-300 pb-6`}
      >
        <div className="flex flex-col gap-2 md:gap-3 w-full   mb-3">
          {rowData.map((data) => (
            <p>
              <span key={data.id} className="text-sm font-bold mr-1 uppercase">
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
              <h2 className="text-sm font-extrabold uppercase mb-1">
                {label}:
              </h2>
              <p>{value}</p>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-center text-base md:text-lg   font-semibold tracking-widest">
        ITEMS
      </h2>
      <ItemsTable itemGroups={request.itemGroups} />

      {/* File Attachments Section */}
      {request.files && request.files.length > 0 && (
        <FileAttachmentContainer files={request.files} />
      )}
    </DetailContainer>
  );
};
