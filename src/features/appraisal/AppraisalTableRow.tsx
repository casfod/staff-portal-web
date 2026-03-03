// src/features/appraisal/AppraisalTableRow.tsx
import { AppraisalType, UserType } from "../../interfaces";
import { localStorageUser } from "../../utils/localStorageUser";
import StatusBadge from "../../ui/StatusBadge";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import { AppraisalDetails } from "./AppraisalDetails";
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

type Props = {
  request: AppraisalType;
  visibleItems: { [key: string]: boolean };
  toggleViewItems: (id: string) => void;
  handleEdit: (request: AppraisalType) => void;
  handleDelete: (id: string) => void;
  handleAction: (request: AppraisalType) => void;
  tableHeadData?: TableHeaderConfig[];
};

const AppraisalTableRow = ({
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
  const requestStatus = request.status ?? "draft";
  const requestCreatedAt = request.createdAt ?? "";
  const createdById = request.createdBy?.id;

  const isVisible = !!visibleItems[requestId];

  const isEditable =
    requestStatus === "draft" && createdById === currentUser?.id;

  const isDeletable =
    requestStatus === "draft" &&
    (createdById === currentUser?.id || currentUser?.role === "SUPER-ADMIN");

  const fullDate = formatToDDMMYYYY(requestCreatedAt);
  const createdBy: UserType | null = request.createdBy;

  const rowData = [
    {
      id: "staff_name",
      content:
        request.staffName || `${createdBy?.first_name} ${createdBy?.last_name}`,
      showOnMobile: true,
      minWidth: "120px",
      mobileLabel: "Staff Name",
    },
    {
      id: "appraisal_code",
      content: request.appraisalCode || "N/A",
      showOnMobile: false,
      showOnTablet: true,
      minWidth: "120px",
      mobileLabel: "Code",
    },
    {
      id: "period",
      content: request.appraisalPeriod || "N/A",
      showOnMobile: false,
      showOnTablet: true,
      minWidth: "120px",
      mobileLabel: "Period",
    },
    {
      id: "status",
      content: <StatusBadge status={request.status!} />,
      showOnMobile: true,
      minWidth: "100px",
      mobileLabel: "Status",
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
          isDeletable={isDeletable}
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

      <tr key={`${requestId}-mobile`} className="sm:hidden">
        <td colSpan={headers.length} className="p-4 border-b border-gray-200">
          <RequestCard
            request={request}
            totalAmount={0}
            requestId={requestId}
            identifier={request.appraisalCode}
            dateValue={requestCreatedAt}
            actionIconsProps={{
              isEditable,
              isDeletable,
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

      {isVisible && (
        <tr key={`${requestId}-details`} className="max-w-full rounded-lg">
          <td
            colSpan={headers.length}
            className="w-full bg-[#F8F8F8] border border-gray-300 px-4 md:px-6 py-4 rounded-lg shadow-sm"
          >
            <AppraisalDetails request={request} />
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

export default AppraisalTableRow;
