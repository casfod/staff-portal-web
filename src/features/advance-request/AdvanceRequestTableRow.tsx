// AdvanceRequestTableRow.tsx - Refactored with BaseTableRow
import { IAdvanceRequest, TableHeaderConfig } from '../../interfaces';
import { localStorageUser } from '../../utils/localStorageUser';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import { moneyFormat } from '../../utils/moneyFormat';

// Radix UI Components

// Custom Components
import { BaseTableRow } from '../../components/custom/BaseTableRow';
import ActionIcons from '../../components/custom/ActionIcons';
import { AdvanceRequestDetails } from './AdvanceRequestDetails';
import RequestCommentsAndActions from '../../components/custom/RequestCommentsAndActions';
import AdvanceRequestCard from './AdvanceRequestCard';
import StatusBadge from '@/components/custom/StatusBadge';

interface AdvanceRequestTableRowProps {
  request: IAdvanceRequest;
  handleEdit: (request: IAdvanceRequest) => void;
  handleDelete: (id: string) => void;
  handleAction: (request: IAdvanceRequest) => void;
  tableHeadData?: TableHeaderConfig[];
}

const AdvanceRequestTableRow = ({
  request,
  handleEdit,
  handleDelete,
  handleAction,
}: AdvanceRequestTableRowProps) => {
  const currentUser = localStorageUser();

  const requestId = request.id ?? '';
  const requestStatus = request.status ?? '';
  const requestCreatedAt = request.createdAt ?? '';
  const createdById = request.createdBy?.id;

  const isEditable =
    (requestStatus === 'draft' || requestStatus === 'rejected') && createdById === currentUser?.id;

  const totalAmount = request.itemGroups?.reduce((sum, item) => sum + item.total!, 0) ?? 0;

  const fullDate = formatToDDMMYYYY(requestCreatedAt);

  // Define row data for the table
  const rowData = [
    {
      id: 'name',
      content: `${request.createdBy?.firstName || 'N/A'} ${request.createdBy?.lastName || 'N/A'}`,
      showOnMobile: true,
    },
    {
      id: 'status',
      content: <StatusBadge status={request.status} />,
      showOnMobile: true,
    },
    {
      id: 'amount',
      content: moneyFormat(totalAmount, 'NGN'),
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
      <AdvanceRequestDetails request={request} />
      <div className="mt-4 pt-4 border-t border-gray-200">
        <RequestCommentsAndActions request={request} handleAction={handleAction} />
      </div>
    </>
  );

  // Mobile card for small screens
  const mobileCard = (
    <AdvanceRequestCard
      advanceRequest={request}
      actionIconsProps={{
        isEditable,
        requestId,
        onEdit: handleEdit,
        onDelete: handleDelete,
        request,
        variant: 'list',
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

export default AdvanceRequestTableRow;
