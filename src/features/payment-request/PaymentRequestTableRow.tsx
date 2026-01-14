import { PaymentRequestType } from "../../interfaces";
import { localStorageUser } from "../../utils/localStorageUser";
import StatusBadge from "../../ui/StatusBadge";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import { moneyFormat } from "../../utils/moneyFormat";

import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import PaymentRequestDetails from "./PaymentRequestDetails";
import TableRowMain from "../../ui/TableRowMain";
import ActionIcons from "../../ui/ActionIcons";
import TableData from "../../ui/TableData";
import RequestCard from "../../ui/RequestCard";

type TableHeaderConfig = {
  label: string;
  showOnMobile: boolean;
  showOnTablet?: boolean;
  minWidth: string;
};

interface PaymentRequestTableRowProps {
  request: PaymentRequestType;
  visibleItems: Record<string, boolean>;
  toggleViewItems: (id: string) => void;
  handleEdit: (request: PaymentRequestType) => void;
  handleDelete: (id: string) => void;
  handleAction: (request: PaymentRequestType) => void;
  tableHeadData?: TableHeaderConfig[];
}

const PaymentRequestTableRow = ({
  request,
  visibleItems,
  toggleViewItems,
  handleEdit,
  handleDelete,
  handleAction,
  tableHeadData,
}: PaymentRequestTableRowProps) => {
  const currentUser = localStorageUser();

  const requestId = request.id ?? "";
  const requestStatus = request.status ?? "pending";
  const requestCreatedAt = request.createdAt ?? "";
  const requestedById = request.requestedBy?.id;

  const isVisible = !!visibleItems[requestId];
  const isEditable =
    (requestStatus === "draft" || requestStatus === "rejected") &&
    requestedById === currentUser?.id;

  const totalAmount = request.amountInFigure || 0;
  const fullDate = formatToDDMMYYYY(requestCreatedAt);

  // Row data configuration that matches the table header structure
  const rowData = [
    {
      id: "requestBy",
      content: request.requestBy,
      showOnMobile: true,
      minWidth: "120px",
      mobileLabel: "Request",
    },
    {
      id: "status",
      content: <StatusBadge status={request.status!} />,
      showOnMobile: true,
      minWidth: "100px",
      mobileLabel: "Status",
    },
    {
      id: "amount",
      content: moneyFormat(totalAmount, "NGN"),
      showOnMobile: true,
      minWidth: "100px",
      mobileLabel: "Budget",
      mobileContent: moneyFormat(totalAmount, "NGN"),
    },
    {
      id: "date",
      content: fullDate,
      showOnMobile: false,
      showOnTablet: true,
      minWidth: "100px",
      mobileLabel: "Date",
      mobileContent: fullDate,
    },
    {
      id: "actions",
      content: (
        <ActionIcons
          isEditable={isEditable}
          requestId={requestId}
          visibleItems={visibleItems}
          onToggleView={toggleViewItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
          request={request}
        />
      ),
      showOnMobile: true,
      minWidth: "100px",
      mobileLabel: "Actions",
    },
  ];

  // Use provided tableHeadData or fall back to default
  const headers =
    tableHeadData ||
    rowData.map((item) => ({
      label: item.mobileLabel || item.id,
      showOnMobile: item.showOnMobile,
      showOnTablet: item.showOnTablet,
      minWidth: item.minWidth,
    }));

  return (
    <>
      {/* Desktop/Tablet View */}
      <TableRowMain
        key={requestId}
        requestId={requestId}
        toggleViewItems={toggleViewItems}
        className="hidden sm:table-row"
      >
        {rowData.map(({ id, content, showOnMobile, showOnTablet }) => (
          <TableData
            key={`${requestId}-${id}`}
            className={`
              ${!showOnMobile ? "hidden md:table-cell" : ""}
              ${showOnTablet ? "hidden sm:table-cell md:table-cell" : ""}
              px-3 py-2.5 md:px-4 md:py-3
            `}
          >
            {content}
          </TableData>
        ))}
      </TableRowMain>

      {/* Mobile View - Card Layout */}
      <tr key={`${requestId}-mobile`} className="sm:hidden">
        <td colSpan={headers.length} className="p-4 border-b border-gray-200">
          <RequestCard
            request={request}
            totalAmount={totalAmount}
            requestId={requestId}
            identifier={request.pmrNumber}
            dateValue={requestCreatedAt}
            actionIconsProps={{
              isEditable,
              requestId,
              visibleItems,
              onToggleView: toggleViewItems,
              onEdit: handleEdit,
              onDelete: handleDelete,
              request,
              variant: "list",
              hideInspect: false,
            }}
            context="list"
            className="sm:hidden"
          />
        </td>
      </tr>

      {/* Expanded Details (Visible on both mobile and desktop) */}
      {isVisible && (
        <tr key={`${requestId}-details`} className="rounded-lg">
          <td
            colSpan={headers.length}
            className="w-full h-10 bg-[#F8F8F8] border border-gray-300 px-4 md:px-6 py-4 rounded-lg shadow-sm"
          >
            <PaymentRequestDetails request={request} />
            <RequestCommentsAndActions
              request={request}
              handleAction={handleAction}
            />
          </td>
        </tr>
      )}
    </>
  );
};

export default PaymentRequestTableRow;
