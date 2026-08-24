// AppraisalCard.tsx - Card for IConceptNote
import { IAppraisal } from '@/interfaces';
import BaseRequestCard, { RequestCardWrapperProps } from '@/components/custom/BaseRequestCard';
import { getUserFullName } from '@/utils/getUserFullName';

interface AppraisalCardProps extends RequestCardWrapperProps {
  appraisal: IAppraisal;
}

const AppraisalCard = ({ appraisal, requestId, ...rest }: AppraisalCardProps) => (
  <BaseRequestCard
    displayName={getUserFullName(appraisal.createdBy)}
    identifier={appraisal.appraisalCode}
    status={appraisal.status}
    date={appraisal.createdAt}
    requestId={requestId ?? appraisal.id}
    {...rest}
  />
);

export default AppraisalCard;
