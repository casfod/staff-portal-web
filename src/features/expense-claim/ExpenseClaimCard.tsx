// ExpenceClaimCard.tsx - Card for IexpenceClaim
//
// Note: IexpenceClaim has no `requestedBy` field (only `createdBy`), so we
// resolve the display name off createdBy via getUserFullName.
import BaseRequestCard, { RequestCardWrapperProps } from '../../components/custom/BaseRequestCard';
import { sumItemGroupTotal } from '../../utils/sumItemGroupTotal';
import { getUserFullName } from '../../utils/getUserFullName';
import { IExpenseClaim } from '../../interfaces';

interface ExpenseClaimCardProps extends RequestCardWrapperProps {
  expenseClaim: IExpenseClaim;
}

const ExpenseClaimCard = ({ expenseClaim, requestId, ...rest }: ExpenseClaimCardProps) => (
  <BaseRequestCard
    displayName={getUserFullName(expenseClaim.createdBy)}
    identifier={expenseClaim.ecNumber}
    status={expenseClaim.status}
    date={expenseClaim.createdAt}
    totalAmount={sumItemGroupTotal(expenseClaim.expenses)}
    requestId={requestId ?? expenseClaim.id}
    {...rest}
  />
);

export default ExpenseClaimCard;
