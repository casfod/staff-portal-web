// RequestCommentsAndActions.tsx - Fixed Version
import { SlMagnifier } from 'react-icons/sl';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
interface RequestCommentsAndActionsProps<
  T extends TRequestEntityComments = TRequestEntityComments,
> {
  request: T;
  handleAction?: (request: T) => void;
  renderCustomApprovalInfo?: (request: T) => React.ReactNode;
  renderCustomComments?: (request: T) => React.ReactNode;
}

const RequestCommentsAndActions = <T extends TRequestEntityComments>({
  request,
  handleAction,
  renderCustomApprovalInfo,
  renderCustomComments,
}: RequestCommentsAndActionsProps<T>) => {
  const { requestId } = useParams();

  if (request.status === 'draft') return null;

  const getCommentUserDisplayName = (comment: IComment): string => {
    if (comment.user?.firstName && comment.user?.lastName) {
      return `${comment.user.role || 'User'}: ${comment.user.firstName} ${comment.user.lastName}`;
    }
    return `${comment.user?.role || 'User'}: Unknown User`;
  };

  return (
    <div className="flex flex-col gap-4 mt-4 text-sm tracking-wide">
      {/* Custom approval info renderer */}
      {renderCustomApprovalInfo && renderCustomApprovalInfo(request)}

      <SystemInfo request={request} />

      {/* Custom comments renderer */}
      {renderCustomComments && renderCustomComments(request)}

      {/* Default comments */}
      {!renderCustomComments && request.comments && request.comments.length > 0 && !requestId && (
        <div className="flex flex-col gap-2">
          <span className="font-bold uppercase">Comments:</span>
          <div className="flex flex-col gap-2">
            {request.comments.map((comment: IComment, index: number) => (
              <Card key={index} className="max-w-md md:max-w-full">
                <CardContent className="p-4">
                  <p className="text-xs sm:text-base font-extrabold">
                    {getCommentUserDisplayName(comment)}
                  </p>
                  <p className="text-sm mt-1">{comment.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

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

export default RequestCommentsAndActions;
