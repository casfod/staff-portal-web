import { ItemGroupType, PurChaseRequestType } from "../../interfaces";
import { useParams } from "react-router-dom";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import FileAttachmentContainer from "../../ui/FileAttachmentContainer";
import DetailContainer from "../../ui/DetailContainer";
import CopiedTo from "../../ui/CopiedTo";
import RequestItemsTable from "../../ui/RequestItemsTable";
import SystemInfo from "../../ui/SystemInfo";

interface RequestDetailsProps {
  request: PurChaseRequestType;
}

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

  return (
    <DetailContainer>
      {/* Purchase Request Details Section */}
      {request?.pcrNumber && (
        <h1 className="text-center text-lg font-extrabold p-4 md:p-6">
          {request?.pcrNumber}
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
              className="w-full md:w-fit border-b-2 md:border-b-0 flex md:items-center flex-col md:flex-row gap-1 pb-2 md:pb-0"
            >
              <span className="text-sm font-bold uppercase whitespace-nowrap text-gray-700 mb-1 md:mb-0">
                {data.label}
              </span>
              <span className="break-words">{data.content}</span>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-center text-base md:text-lg font-semibold tracking-widest mb-4">
        ITEMS
      </h2>

      {/* Show mobile table on small screens, desktop table on larger screens */}
      <RequestItemsTable
        items={request.itemGroups as ItemGroupType[]}
        type="purchase"
      />

      <SystemInfo request={request} />

      {/* File Attachments Section */}
      {request.files && request.files.length > 0 && (
        <FileAttachmentContainer files={request.files} />
      )}

      {/* Copied To */}
      {request.copiedTo?.length! > 0 && <CopiedTo to={request.copiedTo!} />}
    </DetailContainer>
  );
};
