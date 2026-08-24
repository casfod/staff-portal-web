// ExpenceClaimCard.tsx - Card for IexpenceClaim
//
// Note: IexpenceClaim has no `requestedBy` field (only `createdBy`), so we
// resolve the display name off createdBy via getUserFullName.
import BaseRequestCard, { RequestCardWrapperProps } from '../../components/custom/BaseRequestCard';
import { sumItemGroupTotal } from '../../utils/sumItemGroupTotal';
import { getUserFullName } from '../../utils/getUserFullName';
import { IExpenseClaim } from '../../interfaces';

interface ExpenceClaimCardProps extends RequestCardWrapperProps {
  expenceClaim: IExpenseClaim;
}

const ExpenceClaimCard = ({ expenceClaim, requestId, ...rest }: ExpenceClaimCardProps) => (
  <BaseRequestCard
    displayName={getUserFullName(expenceClaim.createdBy)}
    identifier={expenceClaim.ecNumber}
    status={expenceClaim.status}
    date={expenceClaim.createdAt}
    totalAmount={sumItemGroupTotal(expenceClaim.expenses)}
    requestId={requestId ?? expenceClaim.id}
    {...rest}
  />
);

export default ExpenceClaimCard;
