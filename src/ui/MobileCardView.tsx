// src/ui/MobileCardView.tsx
import { moneyFormat } from "../utils/moneyFormat";
import { formatToDDMMYYYY } from "../utils/formatToDDMMYYYY";
import StatusBadge from "./StatusBadge";
import ActionIcons from "./ActionIcons";
import { ReactNode } from "react";

type RequestVariant =
  | "advance"
  | "purchase"
  | "travel"
  | "concept"
  | "payment"
  | "expense";

interface MobileCardViewProps {
  request: {
    id?: string;
    status?: string;
    requestedBy?: string;
    staffName?: string;
    [key: string]: any;
  };
  totalAmount: number;
  requestId: string;
  identifier?: string; // arNumber, pcrNumber, trNumber, etc.
  dateField?: string; // createdAt or custom date field
  dateValue?: string | Date;
  showDate?: boolean;
  additionalInfo?: ReactNode;
  actionIconsProps: {
    copyTo?: () => void;
    isCopying?: boolean;
    canShareRequest?: boolean;
    isGeneratingPDF?: boolean;
    onDownloadPDF?: () => void;
    showTagDropdown?: boolean;
    setShowTagDropdown?: (value: boolean) => void;
    [key: string]: any;
  };
  variant?: RequestVariant;
}

const MobileCardView = ({
  request,
  totalAmount,
  requestId,
  identifier,
  dateField = "createdAt",
  dateValue,
  showDate = true,
  additionalInfo,
  actionIconsProps,
  variant = "advance",
}: MobileCardViewProps) => {
  const formatIdentifier = () => {
    if (identifier) return identifier;

    const variantPrefix = {
      advance: "AR",
      purchase: "PR",
      travel: "TR",
      concept: "CN",
      payment: "PAY",
      expense: "EC",
    }[variant];

    return `${variantPrefix}-${requestId.substring(0, 8)}`;
  };

  const getDateToDisplay = () => {
    if (dateValue) return dateValue;
    if (request && request[dateField]) return request[dateField];
    return null;
  };

  const displayDate = getDateToDisplay();
  const formattedDate = displayDate ? formatToDDMMYYYY(displayDate) : "";

  return (
    <tr className="sm:hidden">
      <td className="p-4 border-b border-gray-200">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm space-y-3">
          {/* Top Row - Main Info */}
          <div className="flex flex-col items-center gap-1">
            <div className="mt-1">
              <StatusBadge status={request?.status || "pending"} size="sm" />
            </div>

            <h3 className="text-center font-semibold text-gray-900 truncate">
              {request?.requestedBy || request?.staffName || "N/A"}
            </h3>
          </div>

          <div className="text-center">
            <div className="text-xs font-bold">
              {moneyFormat(totalAmount, "NGN")}
            </div>
            {showDate && formattedDate && (
              <div className="text-xs text-gray-500 mt-1">{formattedDate}</div>
            )}
            {additionalInfo}
          </div>

          {/* Bottom Row - Actions */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-600">{formatIdentifier()}</span>
            <div className="flex items-center space-x-2">
              <ActionIcons requestId={requestId} {...actionIconsProps} />
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};

export default MobileCardView;
