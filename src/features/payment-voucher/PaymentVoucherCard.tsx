import { IPaymentVoucher } from '@/interfaces';
import BaseRequestCard, { RequestCardWrapperProps } from '@/components/custom/BaseRequestCard';
import { getUserFullName } from '@/utils/getUserFullName';

interface PaymentVoucherProps extends RequestCardWrapperProps {
  paymentVoucher: IPaymentVoucher;
}

const PaymentVoucherCard = ({ paymentVoucher, requestId, ...rest }: PaymentVoucherProps) => (
  <BaseRequestCard
    displayName={getUserFullName(paymentVoucher.createdBy)}
    identifier={paymentVoucher.pvNumber}
    status={paymentVoucher.status}
    date={paymentVoucher.createdAt}
    requestId={requestId ?? paymentVoucher.id}
    {...rest}
  />
);

export default PaymentVoucherCard;
