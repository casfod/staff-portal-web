// features/purchase-order/PurchaseOrderCard.tsx
import BaseRequestCard, { RequestCardWrapperProps } from '../../components/custom/BaseRequestCard';
import { IPurchaseOrder } from '../../interfaces';

interface PurchaseOrderCardProps extends RequestCardWrapperProps {
  purchaseOrder: IPurchaseOrder;
}

const PurchaseOrderCard = ({ purchaseOrder, requestId, ...rest }: PurchaseOrderCardProps) => {
  // Get vendor name
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

  return (
    <BaseRequestCard
      displayName={getVendorName()}
      identifier={purchaseOrder.poCode}
      status={purchaseOrder.status}
      date={purchaseOrder.createdAt}
      totalAmount={purchaseOrder.totalAmount}
      requestId={requestId ?? purchaseOrder.id}
      {...rest}
    />
  );
};

export default PurchaseOrderCard;
