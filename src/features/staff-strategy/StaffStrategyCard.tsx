// features/staff-strategy/StaffStrategyCard.tsx
import { getUserFullName } from '@/utils/userHelpers';
import BaseRequestCard, { RequestCardWrapperProps } from '../../components/custom/BaseRequestCard';
import { IStaffStrategy } from '../../interfaces';

interface StaffStrategyCardProps extends RequestCardWrapperProps {
  staffStrategy: IStaffStrategy;
}

const StaffStrategyCard = ({ staffStrategy, requestId, ...rest }: StaffStrategyCardProps) => {
  // Get vendor name
  return (
    <BaseRequestCard
      displayName={getUserFullName(staffStrategy.createdBy)}
      identifier={staffStrategy.strategyCode}
      status={staffStrategy.status}
      date={staffStrategy.createdAt}
      requestId={requestId ?? staffStrategy.id}
      {...rest}
    />
  );
};

export default StaffStrategyCard;
