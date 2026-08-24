import BaseRequestCard, { RequestCardWrapperProps } from '../../components/custom/BaseRequestCard';
import { getUserFullName } from '../../utils/getUserFullName';
import { IRFQ } from '../../interfaces';
import { sumItemGroupTotal } from '@/utils/sumItemGroupTotal';

interface RFQCardProps extends RequestCardWrapperProps {
  rfq: IRFQ;
}

const RFQCard = ({ rfq, requestId, ...rest }: RFQCardProps) => (
  <BaseRequestCard
    displayName={getUserFullName(rfq.createdBy)}
    identifier={rfq.rfqCode}
    status={rfq.status}
    totalAmount={sumItemGroupTotal(rfq.itemGroups)}
    date={rfq.createdAt}
    requestId={requestId ?? rfq.id}
    {...rest}
  />
);

export default RFQCard;
