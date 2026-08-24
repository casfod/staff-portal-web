// GoodsReceivedCard.tsx - Card for IGoodsReceived
//
// IGoodsReceived has no `status` field (only isCompleted), and its "name" is
// really the linked purchase order, which may or may not be populated.
import BaseRequestCard, { RequestCardWrapperProps } from '../../../components/custom/BaseRequestCard';
import { IGoodsReceived } from '../../../interfaces';

interface GoodsReceivedCardProps extends RequestCardWrapperProps {
  goodsReceived: IGoodsReceived;
}

const getPurchaseOrderLabel = (goodsReceived: IGoodsReceived): string => {
  const { purchaseOrder } = goodsReceived;
  if (typeof purchaseOrder === 'string') {
    return `PO: ${purchaseOrder.substring(0, 8)}`;
  }
  return purchaseOrder?.rfqTitle || purchaseOrder?.poCode || 'N/A';
};

const GoodsReceivedCard = ({ goodsReceived, requestId, ...rest }: GoodsReceivedCardProps) => (
  <BaseRequestCard
    displayName={getPurchaseOrderLabel(goodsReceived)}
    identifier={goodsReceived.grdCode}
    status={goodsReceived.isCompleted ? 'approved' : 'pending'}
    date={goodsReceived.createdAt}
    requestId={requestId ?? goodsReceived.id}
    {...rest}
  />
);

export default GoodsReceivedCard;
