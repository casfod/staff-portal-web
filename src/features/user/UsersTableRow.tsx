import { UserType } from "../../interfaces";
import StaffDetails from "../employment-info/StaffDetails";
import TableRowMain from "../../ui/TableRowMain";
import TableData from "../../ui/TableData";
import RequestCard from "../../ui/RequestCard";
import UserBadge from "../../ui/UserBadge";
import Modal from "../../ui/Modal";
import { Trash2, UserCog } from "lucide-react";

type TableHeaderConfig = {
  label: string;
  showOnMobile: boolean;
  showOnTablet?: boolean;
  minWidth: string;
};

type Props = {
  staffInfo: UserType;
  visibleItems: { [key: string]: boolean };
  toggleViewItems: (id: string) => void;
  handleEdit: (user: UserType) => void;
  handleDelete: (id: string) => void;
  handleAction: (request: UserType) => void;
  tableHeadData?: TableHeaderConfig[];
  currentUserRole: string;
};

const UsersTableRow = ({
  staffInfo,
  visibleItems,
  toggleViewItems,
  handleEdit,
  handleDelete,
  handleAction,
  tableHeadData,
  currentUserRole,
}: Props) => {
  const staffId = staffInfo.id ?? "";
  const staffCreatedAt = staffInfo.createdAt ?? "";
  const isVisible = !!visibleItems[staffId];
  const isEditable = true;

  // Row data configuration
  const rowData = [
    {
      id: "Name",
      content: `${staffInfo.first_name.toUpperCase()} ${staffInfo.last_name.toUpperCase()}`,
      showOnMobile: true,
      minWidth: "120px",
      mobileLabel: "Request",
    },
    {
      id: "email",
      content: staffInfo.email!,
      showOnMobile: true,
      minWidth: "100px",
      mobileLabel: "Role",
    },
    {
      id: "role",
      content: staffInfo.role!,
      showOnMobile: true,
      minWidth: "100px",
      mobileLabel: "Role",
      showOnTablet: true,
    },
    {
      id: "isDeleted",
      content: (
        <UserBadge
          isDeleted={staffInfo.isDeleted!}
          status={staffInfo.isDeleted ? "Inactive" : "Active"}
        />
      ),
      showOnMobile: false,
      showOnTablet: true,
      minWidth: "100px",
      mobileLabel: "Status",
    },
  ];

  // Actions column - separate from rowData to avoid nesting issues
  const actionsColumn =
    currentUserRole === "SUPER-ADMIN"
      ? {
          id: "actions",
          content: (
            <div className="flex space-x-4">
              <Modal>
                <Modal.Open open={`userCog-${staffInfo.id}`}>
                  <button
                    className="text-primary hover:text-indigo-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <UserCog className="h-5 w-5" />
                  </button>
                </Modal.Open>
              </Modal>

              {!staffInfo.isDeleted && (
                <button
                  className="text-red-600 hover:text-red-900"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(staffInfo.id!);
                  }}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          ),
          showOnMobile: true,
          minWidth: "100px",
          mobileLabel: "Actions",
        }
      : null;

  const headers = tableHeadData || [
    ...rowData.map((item) => ({
      label: item.mobileLabel || item.id,
      showOnMobile: item.showOnMobile,
      showOnTablet: item.showOnTablet,
      minWidth: item.minWidth,
    })),
    ...(actionsColumn
      ? [
          {
            label: actionsColumn.mobileLabel,
            showOnMobile: actionsColumn.showOnMobile,
            minWidth: actionsColumn.minWidth,
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Desktop/Tablet View */}
      <TableRowMain
        key={staffId}
        requestId={staffId}
        toggleViewItems={toggleViewItems}
        className="hidden sm:table-row"
      >
        {rowData.map(({ id, content, showOnMobile, showOnTablet }) => (
          <TableData
            key={`${staffId}-${id}`}
            className={`
              ${!showOnMobile ? "hidden md:table-cell" : ""}
              ${showOnTablet ? "hidden sm:table-cell md:table-cell" : ""}
              px-3 py-2.5 md:px-4 md:py-3
            `}
          >
            {content}
          </TableData>
        ))}
        {actionsColumn && (
          <TableData
            key={`${staffId}-actions`}
            className="px-3 py-2.5 md:px-4 md:py-3"
          >
            {actionsColumn.content}
          </TableData>
        )}
      </TableRowMain>

      {/* Mobile View - Card Layout */}
      <tr key={`${staffId}-mobile`} className="sm:hidden">
        <td colSpan={headers.length} className="p-4 border-b border-gray-200">
          <RequestCard
            request={staffInfo}
            requestId={staffId}
            identifier={staffInfo.id}
            dateValue={staffCreatedAt}
            actionIconsProps={{
              isEditable,
              staffId,
              visibleItems,
              onToggleView: toggleViewItems,
              onEdit: () => handleEdit(staffInfo),
              onDelete: () => handleDelete(staffId),
              staffInfo,
              variant: "list",
              hideInspect: false,
            }}
            context="list"
            className="sm:hidden"
          />
        </td>
      </tr>

      {/* Expanded Details */}
      {isVisible && (
        <tr key={`${staffId}-details`} className="rounded-lg">
          <td
            colSpan={headers.length}
            className="w-full bg-[#F8F8F8] border border-gray-300 px-4 md:px-6 py-4 rounded-lg shadow-sm"
          >
            <StaffDetails staffInfo={staffInfo} />
          </td>
        </tr>
      )}
    </>
  );
};

export default UsersTableRow;
