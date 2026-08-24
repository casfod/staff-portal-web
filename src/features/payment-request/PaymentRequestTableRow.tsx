// PaymentRequestTableRow.tsx - Refactored to match AdvanceRequestTableRow
import { IPaymentRequest, TableHeaderConfig } from '../../interfaces';
import { localStorageUser } from '../../utils/localStorageUser';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import { moneyFormat } from '../../utils/moneyFormat';

// Custom Components
import { BaseTableRow } from '../../components/custom/BaseTableRow';
import ActionIcons from '../../components/custom/ActionIcons';
import PaymentRequestDetails from './PaymentRequestDetails';
import RequestCommentsAndActions from '../../components/custom/RequestCommentsAndActions';
import PaymentRequestCard from './PaymentRequestCard';
import StatusBadge from '@/components/custom/StatusBadge';

interface PaymentRequestTableRowProps {
  request: IPaymentRequest;
  handleEdit: (request: IPaymentRequest) => void;
  handleDelete: (id: string) => void;
  handleAction: (request: IPaymentRequest) => void;
  tableHeadData?: TableHeaderConfig[];
}

const PaymentRequestTableRow = ({
  request,
  handleEdit,
  handleDelete,
  handleAction,
}: PaymentRequestTableRowProps) => {
  const currentUser = localStorageUser();

  const requestId = request.id ?? '';
  const requestStatus = request.status ?? '';
  const requestCreatedAt = request.createdAt ?? '';
  const createdById = request.createdBy?.id;

  const isEditable =
    (requestStatus === 'draft' || requestStatus === 'rejected') && createdById === currentUser?.id;

  const totalAmount = request.amountInFigure || 0;

  const fullDate = formatToDDMMYYYY(requestCreatedAt);

  // Define row data for the table
  const rowData = [
    {
      id: 'name',
      content: `${request.createdBy?.firstName || 'N/A'} ${request.createdBy?.lastName || ''}`,
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
      <PaymentRequestDetails request={request} />
      <div className="mt-4 pt-4 border-t border-gray-200">
        <RequestCommentsAndActions request={request} handleAction={handleAction} />
      </div>
    </>
  );

  // Mobile card for small screens
  const mobileCard = (
    <PaymentRequestCard
      paymentRequest={request}
      requestId={requestId}
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
      id={requestId}
      rowData={rowData}
      expandedContent={expandedContent}
      mobileCard={mobileCard}
      isExpandable={true}
    />
  );
};

export default PaymentRequestTableRow;
