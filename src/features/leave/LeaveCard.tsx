// ProjectCard.tsx - Card for IProject
import { getUserFullName } from '@/utils/userHelpers';
import BaseRequestCard, { RequestCardWrapperProps } from '../../components/custom/BaseRequestCard';
import { ILeave } from '../../interfaces';

interface LeaveCardProps extends RequestCardWrapperProps {
  leave: ILeave;
}

const LeaveCard = ({ leave, requestId, actionIconsProps, ...rest }: LeaveCardProps) => (
  <BaseRequestCard
    displayName={getUserFullName(leave.createdBy)}
    identifier={leave.leaveNumber}
    date={leave.createdAt}
    status={leave.status}
    actionIconsProps={actionIconsProps}
    requestId={requestId ?? leave.id}
    {...rest}
  />
);

export default LeaveCard;
