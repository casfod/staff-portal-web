// RequestCommentsAndActions.tsx - Fixed Version
import { SlMagnifier } from 'react-icons/sl';
import { Button } from '@/components/ui/button';
// import { Badge } from "@/components/ui/badge";
import { IComment, IUser, WorkflowStatus } from '@/interfaces';
import SystemInfo from './SystemInfo';

// Base request interface (without index signature)
export interface IBaseRequestComments {
  id: string;
  status: WorkflowStatus | string;
  comments?: IComment[];
  reviewedBy?: Partial<IUser> | null;
  approvedBy?: Partial<IUser> | null;
  createdBy?: Partial<IUser>;
}

// Extended for two-step approval
export interface ITwoStepRequestComments extends IBaseRequestComments {
  financeReviewBy?: Partial<IUser> | null;
  procurementReviewBy?: Partial<IUser> | null;
  financeReviewStatus?: 'pending' | 'approved' | 'rejected';
  procurementReviewStatus?: 'pending' | 'approved' | 'rejected';
}

export type TRequestEntityComments = IBaseRequestComments | ITwoStepRequestComments;

// Type guard for two-step approval
// function isTwoStepApprovalRequestComments(request: TRequestEntityComments): request is ITwoStepRequestComments {
//   return 'financeReviewBy' in request || 'procurementReviewBy' in request;
// }

// Generic props with constraint
interface RequestActionsProps<
  T extends TRequestEntityComments = TRequestEntityComments,
> {
  request: T;
  handleAction?: (request: T) => void;
  renderCustomApprovalInfo?: (request: T) => React.ReactNode;
  renderCustomComments?: (request: T) => React.ReactNode;
}

const RequestActions = <T extends TRequestEntityComments>({
  request,
  handleAction,
  renderCustomApprovalInfo,
  renderCustomComments,
}: RequestActionsProps<T>) => {

  if (request.status === 'draft') return null;

  return (
    <div className="flex flex-col gap-4 mt-4 text-sm tracking-wide">
      {/* Custom approval info renderer */}
      {renderCustomApprovalInfo && renderCustomApprovalInfo(request)}

      <SystemInfo request={request} />

      {/* Custom comments renderer */}
      {renderCustomComments && renderCustomComments(request)}

      {/* Action button */}
      {handleAction && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={() => handleAction(request)} className="min-w-[120px]">
            <SlMagnifier className="mr-2" />
            Inspect
          </Button>
        </div>
      )}
    </div>
  );
};

export default RequestActions;
