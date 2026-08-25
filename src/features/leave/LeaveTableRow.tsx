// src/features/leave/LeaveTableRow.tsx
import { ILeave, TableHeaderConfig } from '../../interfaces';
import { localStorageUser } from '../../utils/localStorageUser';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';

// Custom Components
import { BaseTableRow } from '../../components/custom/BaseTableRow';
import ActionIcons from '../../components/custom/ActionIcons';
import RequestCommentsAndActions from '../../components/custom/RequestActions';
import LeaveCard from './LeaveCard';
import { LeaveDetails } from './LeaveDetails';
import StatusBadge from '@/components/custom/StatusBadge';
import { getUserFullName } from '@/utils/userHelpers';

interface LeaveTableRowProps {
  request: ILeave;
  handleEdit: (request: ILeave) => void;
  handleDelete: (id: string) => void;
  handleAction: (request: ILeave) => void;
  tableHeadData?: TableHeaderConfig[];
}

const LeaveTableRow = ({
  request,
  handleEdit,
  handleDelete,
  handleAction,
}: LeaveTableRowProps) => {
  const currentUser = localStorageUser();

  const requestId = request.id ?? '';
  const requestStatus = request.status ?? '';
  const requestCreatedAt = request.createdAt ?? '';
  const createdById = request.createdBy?.id;

  const isEditable =
    (requestStatus === 'draft' || requestStatus === 'rejected') && createdById === currentUser?.id;

  const fullDate = formatToDDMMYYYY(requestCreatedAt);

  // Define row data for the table
  const rowData = [
    {
      id: 'staffName',
      content: getUserFullName(request.createdBy),
      showOnMobile: true,
    },
    {
      id: 'leaveType',
      content: request.leaveType || 'N/A',
      showOnMobile: true,
    },
    {
      id: 'status',
      content: <StatusBadge status={request.status} />,
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
          requestId={requestId}
          onEdit={() => handleEdit(request)}
          onDelete={handleDelete}
          request={request}
          variant="list"
        />
      ),
      showOnMobile: true,
    },
  ];

  // Expanded content when row is expanded
  const expandedContent = (
    <>
      <LeaveDetails request={request} />
      <div className="mt-4 pt-4 border-t border-gray-200">
        <RequestCommentsAndActions request={request} handleAction={handleAction} />
      </div>
    </>
  );

  // Mobile card for small screens
  const mobileCard = (
    <LeaveCard
      leave={request}
      requestId={requestId}
      actionIconsProps={{
        isEditable,
        requestId,
        onEdit: handleEdit,
        onDelete: handleDelete,
        request,
        variant: 'list',
        hideInspect: false,
      }}
      context="list"
      className="sm:hidden"
    />
  );

  return (
    <BaseTableRow
      id={requestId}
      rowData={rowData}
      expandedContent={expandedContent}
      mobileCard={mobileCard}
      isExpandable={true}
    />
  );
};

export default LeaveTableRow;