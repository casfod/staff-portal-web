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
      id: "suggestedSupplier",
      label: "Suggested Supplier :",
      content: request.suggestedSupplier,
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

  // Add reviewer information if available
  const reviewersData = [];
  if (request.financeReviewBy) {
    reviewersData.push({
      id: "financeReviewer",
      label: "Finance Reviewer :",
      content: `${request.financeReviewBy?.first_name} ${request.financeReviewBy?.last_name}`,
      status: request.financeReviewStatus,
    });
  }
  if (request.procurementReviewBy) {
    reviewersData.push({
      id: "procurementReviewer",
      label: "Procurement Reviewer :",
      content: `${request.procurementReviewBy?.first_name} ${request.procurementReviewBy?.last_name}`,
      status: request.procurementReviewStatus,
    });
  }

  return (
    <DetailContainer>
      {/* Purchase Request Details Section */}
      {request?.pcrNumber && (
        <h1 className="text-center text-lg font-extrabold p-4 md:p-6">
          {request?.pcrNumber}
        </h1>
      )}

      <div
        className={`w-full ${
          !requestId ? "text-sm" : "text-sm md:text-base"
        } mb-6 border-b border-gray-300 pb-6`}
      >
        <div className="flex flex-col items-start gap-3 md:gap-4 w-full">
          {rowData.map((data) => (
            <div
              key={data.id}
              className="w-full md:w-fit border-b-2 md:border-b-0 flex flex-col md:flex-row gap-1 pb-2 md:pb-0"
            >
              <span className="text-sm font-bold uppercase whitespace-nowrap text-gray-700 mb-1 md:mb-0">
                {data.label}
              </span>
              <span className="break-words">{data.content}</span>
            </div>
          ))}

          {/* Reviewer Information */}
          {reviewersData.map((reviewer) => (
            <div
              key={reviewer.id}
              className="w-full md:w-fit border-b-2 md:border-b-0 flex flex-col md:flex-row gap-1 pb-2 md:pb-0"
            >
              <span className="text-sm font-bold uppercase whitespace-nowrap text-gray-700 mb-1 md:mb-0">
                {reviewer.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="break-words">{reviewer.content}</span>
                {reviewer.status && (
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      reviewer.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : reviewer.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {reviewer.status.toUpperCase()}
                  </span>
                )}
              </div>
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
