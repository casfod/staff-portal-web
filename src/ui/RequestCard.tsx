// src/ui/RequestCard.tsx - Unified component for all request cards
import { moneyFormat } from "../utils/moneyFormat";
import { formatToDDMMYYYY } from "../utils/formatToDDMMYYYY";
import StatusBadge from "./StatusBadge";
import ActionIcons from "./ActionIcons";
import { ReactNode } from "react";

interface RequestCardProps {
  request: {
    id?: string;
    status?: string;
    requestedBy?: any; // This could be string or object
    requestBy?: string; // Add this for PaymentRequestType
    staffName?: string;
    arNumber?: string;
    pcrNumber?: string;
    trNumber?: string;
    cnNumber?: string;
    pmrNumber?: string;
    ecNumber?: string;
    [key: string]: any;
  };
  totalAmount?: number;
  requestId: string;
  dateValue?: string | Date;
  actionIconsProps: {
    copyTo?: ({ userIds }: { userIds: string[] }) => void;
    isCopying?: boolean;
    canShareRequest?: boolean;
    isGeneratingPDF?: boolean;
    onDownloadPDF?: () => void;
    showTagDropdown?: boolean;
    setShowTagDropdown?: (value: boolean) => void;
    variant?: "list" | "detail";
    hideInspect?: boolean;
    [key: string]: any;
  };
  additionalInfo?: ReactNode;
  // Usage context
  context?: "list" | "detail";
  // Display options
  showActions?: boolean;
  showStatus?: boolean;
  showIdentifier?: boolean;
  showDate?: boolean;
  // Layout control
  identifier?: string;
  className?: string;
}

const RequestCard = ({
  request,
  totalAmount,
  requestId,
  dateValue,
  actionIconsProps,
  additionalInfo,
  context = "detail",
  showActions = true,
  showStatus = true,
  showIdentifier = true,
  showDate = true,
  className = "",
}: RequestCardProps) => {
  const getIdentifier = () => {
    return (
      request.arNumber ||
      request.pcrNumber ||
      request.trNumber ||
      request.cnNumber ||
      request.pmrNumber ||
      request.ecNumber ||
      `ID: ${requestId?.substring(0, 8)}`
    );
  };

  // Helper function to get the display name from request
  const getDisplayName = () => {
    // Check for requestBy first (used in PaymentRequestType)
    if (request.requestBy) {
      return request.requestBy;
    }

    // Check for staffName (used in TravelRequestType, ExpenseClaimType)
    if (request.staffName) {
      return request.staffName;
    }

    // Check for requestedBy - could be string or object
    if (request.requestedBy) {
      // If it's a string, use it directly
      if (typeof request.requestedBy === "string") {
        return request.requestedBy;
      }
      // If it's an object with first_name and last_name
      if (request.requestedBy.first_name && request.requestedBy.last_name) {
        return `${request.requestedBy.first_name} ${request.requestedBy.last_name}`;
      }
      // If it's an object with name property
      if (request.requestedBy.name) {
        return request.requestedBy.name;
      }
    }

    if (request.preparedBy) {
      // If it's a string, use it directly
      if (typeof request.preparedBy === "string") {
        return request.preparedBy;
      }
      // If it's an object with first_name and last_name
      if (request.preparedBy.first_name && request.preparedBy.last_name) {
        return `${request.preparedBy.first_name} ${request.preparedBy.last_name}`;
      }
      // If it's an object with name property
      if (request.preparedBy.name) {
        return request.preparedBy.name;
      }
    }

    return "N/A";
  };

  const formattedDate = dateValue ? formatToDDMMYYYY(dateValue) : "";

  // For list view (used in AllAdvanceRequests mobile view)
  if (context === "list") {
    return (
      <div
        className={`bg-gray-50/50 rounded-lg border border-gray-200 p-4 shadow-md space-y-3 ${className}`}
      >
        {/* Top Row - Main Info */}
        <div className="flex flex-col items-center gap-1">
          {showStatus && (
            <div className="mt-1">
              <StatusBadge status={request?.status || "pending"} size="sm" />
            </div>
          )}

          <h3 className="text-center font-semibold text-gray-900 truncate">
            {getDisplayName()}
          </h3>
        </div>

        <div className="text-center">
          <div className="text-xs font-bold">
            {moneyFormat(totalAmount ?? 0, "NGN")}
          </div>
          {showDate && formattedDate && (
            <div className="text-xs text-gray-500 mt-1">{formattedDate}</div>
          )}
          {additionalInfo}
        </div>

        {/* Bottom Row - Actions */}
        {showActions && (
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            {showIdentifier && (
              <span className="text-sm text-gray-600">{getIdentifier()}</span>
            )}
            <div className="flex items-center space-x-2">
              <ActionIcons requestId={requestId} {...actionIconsProps} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // For detail view (used in AdvanceRequest.tsx, PurchaseRequest.tsx)
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Status and Basic Info */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {showStatus && (
            <div>
              <StatusBadge status={request?.status || "pending"} />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {getDisplayName()}
            </h3>
            {showIdentifier && (
              <div className="text-sm text-gray-600">{getIdentifier()}</div>
            )}
          </div>

          <div className="font-bold text-gray-900">
            {moneyFormat(totalAmount ?? 0, "NGN")}
          </div>
        </div>

        {/* Right Side: Amount, Date, and Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          {showDate && formattedDate && (
            <div className="text-sm text-gray-500">{formattedDate}</div>
          )}
          {additionalInfo}
          {showActions && (
            <div className="mt-2">
              <ActionIcons requestId={requestId} {...actionIconsProps} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestCard;
