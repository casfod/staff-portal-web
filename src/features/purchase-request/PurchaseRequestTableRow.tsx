// PurchaseRequestTableRow.tsx - Refactored with BaseTableRow
import { IPurchaseRequest, TableHeaderConfig } from '../../interfaces';
import { localStorageUser } from '../../utils/localStorageUser';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import { moneyFormat } from '../../utils/moneyFormat';

// Custom Components
import { BaseTableRow } from '../../components/custom/BaseTableRow';
import ActionIcons from '../../components/custom/ActionIcons';
import { PurchaseRequestDetails } from './PurchaseRequestDetails';
import RequestCommentsAndActions from '../../components/custom/RequestCommentsAndActions';
import PurchaseRequestCard from './PurchaseRequestCard';
import StatusBadge from '@/components/custom/StatusBadge';

interface PurchaseRequestTableRowProps {
  request: IPurchaseRequest;
  handleEdit: (request: IPurchaseRequest) => void;
  handleDelete: (id: string) => void;
  handleAction: (request: IPurchaseRequest) => void;
  tableHeadData?: TableHeaderConfig[];
}

const PurchaseRequestTableRow = ({
  request,
  handleEdit,
  handleDelete,
  handleAction,
}: PurchaseRequestTableRowProps) => {
  const currentUser = localStorageUser();

  const requestId = request.id ?? '';
  const requestStatus = request.status ?? 'pending';
  const requestCreatedAt = request.createdAt ?? '';
  const createdById = request.createdBy?.id;

  const isEditable =
    (requestStatus === 'draft' || requestStatus === 'rejected') && createdById === currentUser?.id;

  const totalAmount = request.itemGroups?.reduce((sum, item) => sum + item.total!, 0) ?? 0;

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
      content: formatToDDMMYYYY(requestCreatedAt),
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

  const expandedContent = (
    <>
      <PurchaseRequestDetails request={request} />
      <div className="mt-4 pt-4 border-t border-gray-200">
        <RequestCommentsAndActions request={request} handleAction={handleAction} />
      </div>
    </>
  );

  const mobileCard = (
    <PurchaseRequestCard
      purchaseRequest={request}
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

export default PurchaseRequestTableRow;
