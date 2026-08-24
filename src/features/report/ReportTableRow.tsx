// features/report/ReportTableRow.tsx
import { IReport, TableHeaderConfig } from '../../interfaces';
import { localStorageUser } from '../../utils/localStorageUser';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';

// Custom Components
import { BaseTableRow } from '../../components/custom/BaseTableRow';
import ActionIcons from '../../components/custom/ActionIcons';
import RequestCommentsAndActions from '../../components/custom/RequestCommentsAndActions';
import ReportCard from './ReportCard';
import { ReportDetails } from './ReportDetails';
import StatusBadge from '@/components/custom/StatusBadge';

interface ReportTableRowProps {
  report: IReport;
  handleEdit: (report: IReport) => void;
  handleDelete: (id: string) => void;
  handleAction: (report: IReport) => void;
  tableHeadData?: TableHeaderConfig[];
}

const ReportTableRow = ({
  report,
  handleEdit,
  handleDelete,
  handleAction,
}: ReportTableRowProps) => {
  const currentUser = localStorageUser();

  const reportId = report.id ?? '';
  const reportStatus = report.status ?? '';
  const reportCreatedAt = report.createdAt ?? '';
  const createdById = report.createdBy?.id;

  const isEditable =
    (reportStatus === 'draft' || reportStatus === 'rejected') && createdById === currentUser?.id;

  const fullDate = formatToDDMMYYYY(reportCreatedAt);

  // Define row data for the table
  const rowData = [
    {
      id: 'reportBy',
      content: `${report.createdBy?.firstName || 'N/A'} ${report.createdBy?.lastName || 'N/A'}`,
      showOnMobile: true,
    },
    {
      id: 'reportType',
      content: report.reportType || 'N/A',
      showOnMobile: false,
      showOnTablet: true,
    },
    {
      id: 'status',
      content: <StatusBadge status={report.status} />,
      showOnMobile: true,
    },
    {
      id: 'date',
      content: fullDate,
      showOnMobile: false,
      showOnTablet: true,
    },
    {
      id: 'actions',
      content: (
        <ActionIcons
          isEditable={isEditable}
          requestId={reportId}
          onEdit={() => handleEdit(report)}
          onDelete={handleDelete}
          request={report}
          variant="list"
        />
      ),
      showOnMobile: true,
    },
  ];

  // Expanded content when row is expanded
  const expandedContent = (
    <>
      <ReportDetails report={report} />
      <div className="mt-4 pt-4 border-t border-gray-200">
        <RequestCommentsAndActions request={report} handleAction={handleAction} />
      </div>
    </>
  );

  // Mobile card for small screens
  const mobileCard = (
    <ReportCard
      report={report}
      requestId={reportId}
      actionIconsProps={{
        isEditable,
        requestId: reportId,
        onEdit: handleEdit,
        onDelete: handleDelete,
        request: report,
        variant: 'list',
        hideInspect: false,
      }}
      context="list"
      className="sm:hidden"
    />
  );

  return (
    <BaseTableRow
      id={reportId}
      rowData={rowData}
      expandedContent={expandedContent}
      mobileCard={mobileCard}
      isExpandable={true}
    />
  );
};

export default ReportTableRow;