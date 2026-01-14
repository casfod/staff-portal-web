import { AdvanceRequestType } from "../../interfaces";
import { localStorageUser } from "../../utils/localStorageUser";
import StatusBadge from "../../ui/StatusBadge";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import { moneyFormat } from "../../utils/moneyFormat";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import { AdvanceRequestDetails } from "./AdvanceRequestDetails";
import TableRowMain from "../../ui/TableRowMain";
import ActionIcons from "../../ui/ActionIcons";
import TableData from "../../ui/TableData";

type TableHeaderConfig = {
  label: string;
  showOnMobile: boolean;
  showOnTablet?: boolean;
  minWidth: string;
};

type Props = {
  request: AdvanceRequestType;
  visibleItems: { [key: string]: boolean };
  toggleViewItems: (id: string) => void;
  handleEdit: (request: AdvanceRequestType) => void;
  handleDelete: (id: string) => void;
  handleAction: (request: AdvanceRequestType) => void;
  tableHeadData?: TableHeaderConfig[]; // Add this prop
};

const AdvanceRequestTableRow = ({
  request,
  visibleItems,
  toggleViewItems,
  handleEdit,
  handleDelete,
  handleAction,
  tableHeadData,
}: Props) => {
  const currentUser = localStorageUser();

  const requestId = request.id ?? "";
  const requestStatus = request.status ?? "pending";
  const requestCreatedAt = request.createdAt ?? "";
  const requestedById = request.createdBy?.id;

  const isVisible = !!visibleItems[requestId];
  const isEditable =
    (requestStatus === "draft" || requestStatus === "rejected") &&
    requestedById === currentUser?.id;

  const totalAmount =
    request.itemGroups?.reduce((sum, item) => sum + item.total, 0) ?? 0;

  // Mobile-friendly date format (short version)
  // const mobileDate = formatToDDMMYYYY(requestCreatedAt).substring(0, 6); // Shows "DD/MM"
  const fullDate = formatToDDMMYYYY(requestCreatedAt);

  // Row data configuration that matches the table header structure
  const rowData = [
    {
      id: "requestedBy",
      content: request.requestedBy,
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
      mobileLabel: "Amount",
      mobileContent: moneyFormat(totalAmount, "NGN"), // Abbreviated for mobile if needed
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
        className="hidden sm:table-row" // Hide on mobile, show on tablet+
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
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm space-y-3">
            {/* Top Row - Main Info */}

            <div className="flex flex-col items-center gap-1">
              <div className="mt-1">
                <StatusBadge status={request.status!} size="sm" />
              </div>

              <h3 className="text-center font-semibold text-gray-900 truncate">
                {request.requestedBy}
              </h3>
            </div>

            <div className="text-center">
              <div className="text-xs font-bold">
                {moneyFormat(totalAmount, "NGN")}
              </div>
              <div className="text-xs text-gray-500 mt-1">{fullDate}</div>
            </div>

            {/* Bottom Row - Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-sm text-gray-600">
                {request.arNumber || `ID: ${requestId.substring(0, 8)}`}
              </span>
              <div className="flex items-center space-x-2">
                <ActionIcons
                  isEditable={isEditable}
                  requestId={requestId}
                  visibleItems={visibleItems}
                  onToggleView={toggleViewItems}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  request={request}
                  // variant="mobile"
                />
              </div>
            </div>
          </div>
        </td>
      </tr>

      {/* Expanded Details (Visible on both mobile and desktop) */}
      {isVisible && (
        <tr key={`${requestId}-details`} className="rounded-lg">
          <td
            colSpan={headers.length}
            className="w-full bg-[#F8F8F8] border border-gray-300 px-4 md:px-6 py-4 rounded-lg shadow-sm"
          >
            <AdvanceRequestDetails request={request} />
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

export default AdvanceRequestTableRow;
