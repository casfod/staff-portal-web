import { IStoreRequest, IUser } from '../../interfaces';
import { BaseTableRow } from '../../components/custom/BaseTableRow';
import StatusBadge from '@/components/custom/StatusBadge';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import { getUserFullName } from '../../utils/getUserFullName';
import StoreRequestCard from './StoreRequestCard';
import StoreRequestDetails from './StoreRequestDetails';
import { localStorageUser } from '@/utils/localStorageUser';
import ActionIcons from '@/components/custom/ActionIcons';
import RequestCommentsAndActions from '../../components/custom/RequestActions';

interface StoreRequestTableRowProps {
  request: IStoreRequest;
  handleEdit: (request: IStoreRequest) => void;
  handleDelete: (id: string) => void;
  handleAction: (request: IStoreRequest) => void;
}

const StoreRequestTableRow = ({ request, handleEdit, handleDelete, handleAction }: StoreRequestTableRowProps) => {
  const currentUser = localStorageUser();
  
  const requestId = request.id ?? '';
  const requestStatus = request.status ?? '';
  const requestDate = request.requestedAt || request.createdAt;
  const createdById = (request.createdBy as Partial<IUser>)?.id;

  const isEditable =
    (requestStatus === 'draft' || requestStatus === 'rejected') && createdById === currentUser?.id;

  const rowData = [
    {
      id: 'name',
      content: getUserFullName(request.createdBy),
      showOnMobile: true,
    },
    {
      id: 'type',
      content: <span className="uppercase">{request.requestType || 'N/A'}</span>,
      showOnMobile: true,
    },
    { id: 'code', content: request.srCode || 'N/A', showOnMobile: true },
    { id: 'status', content: <StatusBadge status={requestStatus} />, showOnMobile: true },
    {
      id: 'date',
      content: formatToDDMMYYYY(requestDate),
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
    }
  ];

  const expandedContent = (
    <>
      <StoreRequestDetails request={request} />
      <div className="mt-4 pt-4 border-t border-gray-200">
        <RequestCommentsAndActions request={request} handleAction={handleAction} />
      </div>
    </>
  );

  const mobileCard = (
    <StoreRequestCard
      storeRequest={request}
      actionIconsProps={{
        isEditable,
        requestId,
        onEdit: () => handleEdit(request),
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
      id={request.id}
      rowData={rowData}
      expandedContent={expandedContent}
      mobileCard={mobileCard}
      isExpandable
    />
  );
};

export default StoreRequestTableRow;