import { ReportType } from "../../interfaces";
import { localStorageUser } from "../../utils/localStorageUser";
import StatusBadge from "../../ui/StatusBadge";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import { ReportDetails } from "./ReportDetails";
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
  report: ReportType;
  visibleItems: { [key: string]: boolean };
  toggleViewItems: (id: string) => void;
  handleEdit: (report: ReportType) => void;
  handleDelete: (id: string) => void;
  handleAction: (report: ReportType) => void;
  tableHeadData?: TableHeaderConfig[];
};

const ReportTableRow = ({
  report,
  visibleItems,
  toggleViewItems,
  handleEdit,
  handleDelete,
  handleAction,
  tableHeadData,
}: Props) => {
  const currentUser = localStorageUser();

  const reportId = report.id ?? "";
  const reportStatus = report.status ?? "pending";
  const reportCreatedAt = report.createdAt ?? "";
  const createdById = report.createdBy?.id;

  const isVisible = !!visibleItems[reportId];
  const isEditable =
    (reportStatus === "draft" || reportStatus === "rejected") &&
    createdById === currentUser?.id;

  const fullDate = formatToDDMMYYYY(reportCreatedAt);

  const rowData = [
    // {
    //   id: "reportTitle",
    //   content: report.reportTitle,
    //   showOnMobile: true,
    //   minWidth: "160px",
    //   mobileLabel: "Report",
    // },
    {
      id: "reportby",
      content: `${report.createdBy?.first_name} ${report.createdBy?.last_name}`,
      showOnMobile: true,
      minWidth: "160px",
      mobileLabel: "Report By",
    },
    {
      id: "reportType",
      content: report.reportType,
      showOnMobile: false,
      showOnTablet: true,
      minWidth: "140px",
      mobileLabel: "Type",
    },
    {
      id: "status",
      content: <StatusBadge status={report.status!} />,
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
    },
    {
      id: "actions",
      content: (
        <ActionIcons
          isEditable={isEditable}
          requestId={reportId}
          visibleItems={visibleItems}
          onToggleView={toggleViewItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
          request={report}
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
      {/* Desktop/Tablet View */}
      <TableRowMain
        key={reportId}
        requestId={reportId}
        toggleViewItems={toggleViewItems}
        className="hidden sm:table-row"
      >
        {rowData.map(({ id, content, showOnMobile, showOnTablet }) => (
          <TableData
            key={`${reportId}-${id}`}
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

      {/* Mobile Card View */}
      <tr key={`${reportId}-mobile`} className="sm:hidden">
        <td colSpan={headers.length} className="p-4 border-b border-gray-200">
          <RequestCard
            request={report as any}
            totalAmount={0}
            requestId={reportId}
            identifier={report.reportNumber}
            dateValue={reportCreatedAt}
            actionIconsProps={{
              isEditable,
              requestId: reportId,
              visibleItems,
              onToggleView: toggleViewItems,
              onEdit: handleEdit,
              onDelete: handleDelete,
              request: report,
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
        <tr key={`${reportId}-details`} className="rounded-lg">
          <td
            colSpan={headers.length}
            className="w-full bg-[#F8F8F8] border border-gray-300 px-4 md:px-6 py-4 rounded-lg shadow-sm"
          >
            <ReportDetails report={report} />
            <RequestCommentsAndActions
              request={report as any}
              handleAction={handleAction}
            />
          </td>
        </tr>
      )}
    </>
  );
};

export default ReportTableRow;
