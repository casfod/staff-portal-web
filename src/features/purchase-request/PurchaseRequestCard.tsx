// PurchaseRequestCard.tsx - Card for IPurchaseRequest
import { sumItemGroupTotal } from '@/utils/sumItemGroupTotal';
import { IPurchaseRequest } from '@/interfaces';
import BaseRequestCard, { RequestCardWrapperProps } from '@/components/custom/BaseRequestCard';
import { getUserFullName } from '@/utils/getUserFullName';

interface PurchaseRequestCardProps extends RequestCardWrapperProps {
  purchaseRequest: IPurchaseRequest;
}

const PurchaseRequestCard = ({ purchaseRequest, requestId, ...rest }: PurchaseRequestCardProps) => (
  <BaseRequestCard
    displayName={getUserFullName(purchaseRequest.createdBy)}
    identifier={purchaseRequest.pcrNumber}
    status={purchaseRequest.status}
    date={purchaseRequest.createdAt}
    totalAmount={sumItemGroupTotal(purchaseRequest.itemGroups)}
    requestId={requestId ?? purchaseRequest.id}
    {...rest}
  />
);

export default PurchaseRequestCard;
