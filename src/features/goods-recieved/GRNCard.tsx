// ProjectCard.tsx - Card for IProject
import { getUserFullName } from '@/utils/userHelpers';
import BaseRequestCard, { RequestCardWrapperProps } from '../../components/custom/BaseRequestCard';
import { IGoodsReceived } from '../../interfaces';

interface GRNCardProps extends RequestCardWrapperProps {
  grn: IGoodsReceived;
}

const GRNCard = ({ grn, requestId, actionIconsProps, ...rest }: GRNCardProps) => (
  <BaseRequestCard
    displayName={getUserFullName(grn.createdBy)}
    identifier={grn.grdCode}
    date={grn.createdAt}
    actionIconsProps={actionIconsProps}
    requestId={requestId ?? grn.id}
    {...rest}
  />
);

export default GRNCard;
