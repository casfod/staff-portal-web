import BaseRequestCard, { RequestCardWrapperProps } from '../../components/custom/BaseRequestCard';
import { getUserFullName } from '../../utils/getUserFullName';
import { IVendor } from '../../interfaces';

interface VendorCardProps extends RequestCardWrapperProps {
  vendor: IVendor;
}

const VendorCard = ({ vendor, requestId, ...rest }: VendorCardProps) => (
  <BaseRequestCard
    displayName={getUserFullName(vendor.createdBy)}
    identifier={vendor.vendorCode}
    status={vendor.status}
    date={vendor.createdAt}
    requestId={requestId ?? vendor.id}
    {...rest}
  />
);

export default VendorCard;
