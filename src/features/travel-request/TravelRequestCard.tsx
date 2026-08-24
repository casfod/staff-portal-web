// TravelRequestCard.tsx - Card for ItravelRequest
//
// Note: ItravelRequest has no `requestedBy` field (only `createdBy`), so we
// resolve the display name off createdBy via getUserFullName.
import BaseRequestCard, { RequestCardWrapperProps } from '../../components/custom/BaseRequestCard';
import { sumItemGroupTotal } from '../../utils/sumItemGroupTotal';
import { getUserFullName } from '../../utils/getUserFullName';
import { ITravelRequest } from '../../interfaces';

interface TravelRequestCardProps extends RequestCardWrapperProps {
  travelRequest: ITravelRequest;
}

const TravelRequestCard = ({ travelRequest, requestId, ...rest }: TravelRequestCardProps) => (
  <BaseRequestCard
    displayName={getUserFullName(travelRequest.createdBy)}
    identifier={travelRequest.trNumber}
    status={travelRequest.status}
    date={travelRequest.createdAt}
    totalAmount={sumItemGroupTotal(travelRequest.expenses)}
    requestId={requestId ?? travelRequest.id}
    {...rest}
  />
);

export default TravelRequestCard;
