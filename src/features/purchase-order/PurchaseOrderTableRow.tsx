// features/purchase-order/PurchaseOrderTableRow.tsx
import { IPurchaseOrder, TableHeaderConfig } from '../../interfaces';
import { localStorageUser } from '../../utils/localStorageUser';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import { moneyFormat } from '../../utils/moneyFormat';

// Custom Components
import { BaseTableRow } from '../../components/custom/BaseTableRow';
import ActionIcons from '../../components/custom/ActionIcons';
import { PurchaseOrderDetails } from './PurchaseOrderDetails';
import PurchaseOrderCard from './PurchaseOrderCard';
import StatusBadge from '@/components/custom/StatusBadge';
import RequestCommentsAndActions from '../../components/custom/RequestActions';

interface PurchaseOrderTableRowProps {
  purchaseOrder: IPurchaseOrder;
  handleEdit: (purchaseOrder: IPurchaseOrder) => void;
  handleDelete: (id: string) => void;
  handleAction: (purchaseOrder: IPurchaseOrder) => void;
  tableHeadData?: TableHeaderConfig[];
}

const PurchaseOrderTableRow = ({
  purchaseOrder,
  handleEdit,
  handleDelete,
  handleAction,
}: PurchaseOrderTableRowProps) => {
  const currentUser = localStorageUser();

  const purchaseOrderId = purchaseOrder.id ?? '';
  // const purchaseOrderStatus = purchaseOrder.status ?? "";
  // const createdById = purchaseOrder.createdBy?.id;

  // Get vendor name - handle both string and IVendor
  const getVendorName = (): string => {
    if (!purchaseOrder.selectedVendor) return 'No Vendor';
    if (
      typeof purchaseOrder.selectedVendor === 'object' &&
      'businessName' in purchaseOrder.selectedVendor
    ) {
      return purchaseOrder.selectedVendor.businessName;
    }
    return 'No Vendor';
  };

  const isEditable =
    ((currentUser.role === 'SUPER-ADMIN' && !purchaseOrder.rfqCode) ||
      currentUser?.procurementRole?.canUpdate) &&
    purchaseOrder.status === 'rejected' &&
    !purchaseOrder.rfqCode;

  const isDeletable =
    (currentUser.role === 'SUPER-ADMIN' || currentUser?.procurementRole?.canDelete) &&
    purchaseOrder.status === 'rejected';

  const fullDate = formatToDDMMYYYY(purchaseOrder.createdAt);
  const totalAmount = purchaseOrder.totalAmount || 0;

  // Define row data for the table
  const rowData = [
    {
      id: 'vendor',
      content: getVendorName(),
      showOnMobile: true,
    },
    {
      id: 'status',
      content: <StatusBadge status={purchaseOrder.status} />,
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
          isDeletable={isDeletable}
          requestId={purchaseOrderId}
          onEdit={() => handleEdit(purchaseOrder)}
          onDelete={() => handleDelete(purchaseOrderId)}
          request={purchaseOrder}
          variant="list"
        />
      ),
      showOnMobile: true,
    },
  ];

  // Expanded content when row is expanded
  const expandedContent = (
    <>
      <PurchaseOrderDetails purchaseOrder={purchaseOrder} />
      <div className="mt-4 pt-4 border-t border-gray-200">
        <RequestCommentsAndActions request={purchaseOrder} handleAction={handleAction} />
      </div>
    </>
  );

  // Mobile card for small screens
  const mobileCard = (
    <PurchaseOrderCard
      purchaseOrder={purchaseOrder}
      actionIconsProps={{
        isEditable,
        isDeletable,
        requestId: purchaseOrderId,
        onEdit: handleEdit,
        onDelete: handleDelete,
        request: purchaseOrder,
        variant: 'list',
      }}
      context="list"
      className="sm:hidden"
    />
  );

  return (
    <BaseTableRow
      id={purchaseOrderId}
      rowData={rowData}
      expandedContent={expandedContent}
      mobileCard={mobileCard}
      isExpandable={true}
    />
  );
};

export default PurchaseOrderTableRow;
