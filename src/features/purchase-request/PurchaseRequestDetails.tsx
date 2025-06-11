// import { dateformat } from "../../utils/dateFormat";
import { moneyFormat } from "../../utils/moneyFormat";
import { PurChaseRequestType } from "../../interfaces";
import { useParams } from "react-router-dom";
import { dateformat } from "../../utils/dateFormat";
import FileAttachmentContainer from "../../ui/FileAttachmentContainer";
import DetailContainer from "../../ui/DetailContainer";
import CopiedTo from "../../ui/CopiedTo";

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
            className="px-6 py-2 bg-gray-50 text-left text-sm font-medium   uppercase tracking-wider"
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

export const PurchaseRequestDetails = ({ request }: RequestDetailsProps) => {
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

  return (
    <DetailContainer>
      {/* Purchase Request Details Section */}
      <div
        className={`flex flex-col gap-2 md:gap-3 w-full   ${
          !requestId ? "text-sm" : "text-sm md:text-base"
        } mb-3 break-words`}
      >
        {rowData.map((data) => (
          <p key={data.id}>
            <span className="text-sm font-bold mr-1 uppercase">
              {data.label}
            </span>
            {data.content}
          </p>
        ))}
      </div>

      {/* Items Section Header */}
      <h2 className="text-center text-base md:text-lg   font-semibold tracking-widest my-4 break-words">
        ITEMS
      </h2>

      <ItemsTable itemGroups={request.itemGroups} />

      {/* File Attachments Section */}
      {request.files && request.files.length > 0 && (
        <FileAttachmentContainer files={request.files} />
      )}

      {/* Copied To */}
      {request.copiedTo?.length! > 0 && <CopiedTo to={request.copiedTo!} />}
    </DetailContainer>
  );
};
