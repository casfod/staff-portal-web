// src/features/staff-strategy/StaffStrategyTableRow.tsx
import { IStaffStrategy, TableHeaderConfig } from '../../interfaces';
import { localStorageUser } from '../../utils/localStorageUser';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';

// Custom Components
import { BaseTableRow } from '../../components/custom/BaseTableRow';
import ActionIcons from '../../components/custom/ActionIcons';
import RequestCommentsAndActions from '../../components/custom/RequestCommentsAndActions';
import StaffStrategyCard from './StaffStrategyCard';
import { StaffStrategyDetails } from './StaffStrategyDetails';
import StatusBadge from '@/components/custom/StatusBadge';

interface StaffStrategyTableRowProps {
  request: IStaffStrategy;
  handleEdit: (request: IStaffStrategy) => void;
  handleDelete: (id: string) => void;
  handleAction: (request: IStaffStrategy) => void;
  tableHeadData?: TableHeaderConfig[];
}

const StaffStrategyTableRow = ({
  request,
  handleEdit,
  handleDelete,
  handleAction,
}: StaffStrategyTableRowProps) => {
  const currentUser = localStorageUser();

  const requestId = request.id ?? '';
  const requestStatus = request.status ?? '';
  const requestCreatedAt = request.createdAt ?? '';
  const createdById = request.createdBy?.id;

  const isEditable =
    (requestStatus === 'draft' || requestStatus === 'rejected') && createdById === currentUser?.id;

  const fullDate = formatToDDMMYYYY(requestCreatedAt);
  const createdBy = request.createdBy;

  // Define row data for the table
  const rowData = [
    {
      id: 'staffName',
      content: `${createdBy?.firstName || 'N/A'} ${createdBy?.lastName || 'N/A'}`.trim(),
      showOnMobile: true,
    },
    {
      id: 'code',
      content: request.strategyCode || 'N/A',
      showOnMobile: false,
      showOnTablet: true,
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
      <StaffStrategyDetails request={request} />
      <div className="mt-4 pt-4 border-t border-gray-200">
        <RequestCommentsAndActions request={request} handleAction={handleAction} />
      </div>
    </>
  );

  // Mobile card for small screens
  const mobileCard = (
    <StaffStrategyCard
      staffStrategy={request}
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

export default StaffStrategyTableRow;