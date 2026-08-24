import { IPaymentRequest } from '@/interfaces';
import BaseRequestCard, { RequestCardWrapperProps } from '@/components/custom/BaseRequestCard';
import { getUserFullName } from '@/utils/getUserFullName';

interface PaymentRequestCardProps extends RequestCardWrapperProps {
  paymentRequest: IPaymentRequest;
}

const PaymentRequestCard = ({ paymentRequest, requestId, ...rest }: PaymentRequestCardProps) => (
  <BaseRequestCard
    displayName={getUserFullName(paymentRequest.createdBy)}
    identifier={paymentRequest.pmrNumber}
    status={paymentRequest.status}
    date={paymentRequest.createdAt}
    requestId={requestId ?? paymentRequest.id}
    {...rest}
  />
);

export default PaymentRequestCard;
