// VendorCard.tsx - Card for IVendor
// Note: IVendor has no `status` field, so the status badge is simply
// omitted (BaseRequestCard hides it automatically when status is undefined).
import BaseRequestCard, { RequestCardWrapperProps } from '../../../components/custom/BaseRequestCard';
import { IVendor } from '../../../interfaces';

interface VendorCardProps extends RequestCardWrapperProps {
  vendor: IVendor;
}

const VendorCard = ({ vendor, ...rest }: VendorCardProps) => (
  <BaseRequestCard
    displayName={vendor.businessName}
    identifier={vendor.vendorCode}
    date={vendor.createdAt}
    requestId={vendor.id}
    {...rest}
  />
);

export default VendorCard;
