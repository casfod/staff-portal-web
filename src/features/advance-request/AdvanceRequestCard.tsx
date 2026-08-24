// AdvanceRequestCard.tsx - Card for IAdvanceRequest
//
// Note: IAdvanceRequest has no `requestedBy` field (only `createdBy`), so we
// resolve the display name off createdBy via getUserFullName.
import BaseRequestCard, { RequestCardWrapperProps } from '../../components/custom/BaseRequestCard';
import { sumItemGroupTotal } from '../../utils/sumItemGroupTotal';
import { getUserFullName } from '../../utils/getUserFullName';
import { IAdvanceRequest } from '../../interfaces';

interface AdvanceRequestCardProps extends RequestCardWrapperProps {
  advanceRequest: IAdvanceRequest;
}

const AdvanceRequestCard = ({ advanceRequest, requestId, ...rest }: AdvanceRequestCardProps) => (
  <BaseRequestCard
    displayName={getUserFullName(advanceRequest.createdBy)}
    identifier={advanceRequest.arNumber}
    status={advanceRequest.status}
    date={advanceRequest.createdAt}
    totalAmount={sumItemGroupTotal(advanceRequest.itemGroups)}
    requestId={requestId ?? advanceRequest.id}
    {...rest}
  />
);

export default AdvanceRequestCard;
