// RequestDetailLayout.tsx - Complete Fixed Version
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
// import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
import { Loader2 } from 'lucide-react';
import AdminApprovalSection from './AdminApprovalSection';
import CommentSection from './CommentSection';
import { FileUpload } from './FileUpload';
import RequestActions from './RequestActions';
import StatusUpdateForm from './StatusUpdateForm';
import { IComment, IUser, WorkflowStatus } from '@/interfaces';

// =============================================
// TYPES
// =============================================

export interface IBaseRequest {
  id: string;
  status: WorkflowStatus | string;
  comments?: IComment[];
  reviewedBy?: Partial<IUser> | null;
  approvedBy?: Partial<IUser> | null;
  createdBy?: Partial<IUser>;
  files?: File[] | unknown[];
  copiedTo?: IUser[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface ITwoStepApprovalRequest extends IBaseRequest {
  financeReviewBy?: Partial<IUser> | null;
  procurementReviewBy?: Partial<IUser> | null;
  financeReviewStatus?: 'pending' | 'approved' | 'rejected';
  procurementReviewStatus?: 'pending' | 'approved' | 'rejected';
}

export interface IAdminApprovalRequest extends IBaseRequest {
  approvedBy?: Partial<IUser> | null;
}

export type TRequestEntity = IBaseRequest | ITwoStepApprovalRequest | IAdminApprovalRequest;

export interface IStatusOption {
  value: string;
  label: string;
}

export type TRequestType =
  | 'project'
  | 'conceptNote'
  | 'purchaseRequest'
  | 'paymentRequest'
  | 'advanceRequest'
  | 'travelRequest'
  | 'expenseClaim'
  | 'report'
  | 'rfq'
  | 'purchaseOrder'
  | 'goodsReceived'
  | 'paymentVoucher'
  | 'leave'
  | 'staffStrategy'
  | 'appraisal'
  | 'vendor';

export interface IRequestTypeConfig {
  identifierField: string;
  displayNameField?: string;
  dateField?: string;
  hasTwoStepApproval?: boolean;
  hasAdminApproval?: boolean;
}

// =============================================
// TYPE GUARDS
// =============================================

function isTwoStepApprovalRequest(request: TRequestEntity): request is ITwoStepApprovalRequest {
  return 'financeReviewBy' in request || 'procurementReviewBy' in request;
}

function isSpecialEntity(request: TRequestEntity): boolean {
  return 'poCode' in request || 'strategyCode' in request || 'appraisalCode' in request;
}

// =============================================
// PROPS
// =============================================

interface RequestDetailLayoutProps {
  request: TRequestEntity;
  children: ReactNode;
  requestType?: TRequestType; // Kept for future use

  // Two-step approval props
  isFinanceReviewer?: boolean;
  isProcurementReviewer?: boolean;
  isApprover?: boolean;
  financeReviewStatus?: 'pending' | 'approved' | 'rejected';
  procurementReviewStatus?: 'pending' | 'approved' | 'rejected';
  canReviewFinance?: boolean;
  canReviewProcurement?: boolean;
  canApprove?: boolean;

  // File upload props
  canUploadFiles?: boolean;
  selectedFiles?: File[];
  setSelectedFiles?: (files: File[]) => void;
  isUploading?: boolean;
  handleUpload?: (e: React.FormEvent) => void;

  // Status update props
  canUpdateStatus?: boolean;
  status?: string;
  setStatus?: (status: string) => void;
  comment?: string;
  setComment?: (comment: string) => void;
  isUpdatingStatus?: boolean;
  handleStatusChange?: () => void;

  // Comment props
  comments?: IComment[];
  canAddComments?: boolean;
  handleAddComment?: (text: string) => Promise<void>;
  handleUpdateComment?: (commentId: string, text: string) => Promise<void>;
  handleDeleteComment?: (commentId: string) => Promise<void>;
  isAddingComment?: boolean;
  isUpdatingComment?: boolean;
  isDeletingComment?: boolean;

  // Admin approval props
  showAdminApproval?: boolean;
  formData?: { approvedBy?: string | null };
  handleFormChange?: (field: string, value: string) => void;
  admins?: IUser[];
  isLoadingAmins?: boolean;

  // Other props
  requestStatus: WorkflowStatus | string;
  handleAction?: (request: TRequestEntity) => void;
  getStatusOptions?: (request: TRequestEntity) => IStatusOption[];
}

// =============================================
// COMPONENT
// =============================================

const RequestDetailLayout = ({
  request,
  children,
  // Use underscore prefix for intentionally unused props
  requestType: _requestType = 'purchaseRequest',

  // Two-step approval props
  isFinanceReviewer = false,
  isProcurementReviewer = false,
  isApprover = false,
  // financeReviewStatus,
  // procurementReviewStatus,
  canReviewFinance = false,
  canReviewProcurement = false,
  canApprove = false,

  // File upload
  canUploadFiles = false,
  selectedFiles = [],
  setSelectedFiles,
  isUploading = false,
  handleUpload,

  // Status update
  canUpdateStatus = false,
  status = '',
  setStatus,
  isUpdatingStatus = false,
  handleStatusChange,

  // Comments
  comments = [],
  canAddComments = false,
  handleAddComment,
  handleUpdateComment,
  handleDeleteComment,
  isAddingComment = false,
  isUpdatingComment = false,
  isDeletingComment = false,

  // Admin approval
  showAdminApproval = false,
  formData = { approvedBy: null },
  handleFormChange,
  admins = [],
  isLoadingAmins = false,

  // Other
  requestStatus,
  handleAction,
  getStatusOptions,
}: RequestDetailLayoutProps) => {
  // Default status options generator
  const defaultGetStatusOptions = (req: TRequestEntity): IStatusOption[] => {
    const options: IStatusOption[] = [];

    const isTwoStep = isTwoStepApprovalRequest(req);

    if (isSpecialEntity(req)) {
      options.push({ value: 'approved', label: 'Approve' }, { value: 'rejected', label: 'Reject' });
    } else if (isTwoStep) {
      if (canReviewFinance) {
        options.push(
          { value: 'approved', label: 'Approve Finance Review' },
          { value: 'rejected', label: 'Reject Finance Review' }
        );
      } else if (canReviewProcurement) {
        options.push(
          { value: 'approved', label: 'Approve Procurement Review' },
          { value: 'rejected', label: 'Reject Procurement Review' }
        );
      } else if (canApprove) {
        options.push(
          { value: 'approved', label: 'Approve Request' },
          { value: 'rejected', label: 'Reject Request' }
        );
      }
    } else {
      if (requestStatus === 'pending') {
        options.push({ value: 'reviewed', label: 'Approve Review' });
      }
      if (requestStatus === 'reviewed') {
        options.push({ value: 'approved', label: 'Approve Request' });
      }
      options.push({ value: 'rejected', label: 'Reject' });
    }

    return options;
  };

  const statusOptions = getStatusOptions
    ? getStatusOptions(request)
    : defaultGetStatusOptions(request);

  const asyncHandleAddComment = async (text: string) => {
    if (handleAddComment) return handleAddComment(text);
    return Promise.resolve();
  };

  const asyncHandleUpdateComment = async (commentId: string, text: string) => {
    if (handleUpdateComment) return handleUpdateComment(commentId, text);
    return Promise.resolve();
  };

  const asyncHandleDeleteComment = async (commentId: string) => {
    if (handleDeleteComment) return handleDeleteComment(commentId);
    return Promise.resolve();
  };

  // const isTwoStep = isTwoStepApprovalRequest(request);

  return (
    <div className="border border-gray-300 px-3 py-2.5 md:px-6 md:py-3 rounded-md h-auto relative">
      {/* Main Content */}
      {children}

      {/* File Upload Section */}
      {request.status === 'pending' && canUploadFiles && (
        <div className="flex flex-col gap-3 mt-3">
          <FileUpload
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles || (() => {})}
            accept=".jpg,.png,.pdf,.xlsx,.docx"
            multiple={true}
          />

          {selectedFiles.length > 0 && (
            <div className="self-center">
              <Button variant="primary" disabled={isUploading} onClick={handleUpload || (() => {})}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Comments and Actions Section */}
      {request?.reviewedBy && requestStatus !== 'draft' && (
        <div className="mt-4 tracking-wide">
          <RequestActions request={request} handleAction={handleAction} />
        </div>
      )}

      {/* Status Update Form */}
      {canUpdateStatus && (
        <div className="mt-4">
          <StatusUpdateForm
            requestStatus={requestStatus}
            status={status}
            setStatus={setStatus || (() => {})}
            isUpdatingStatus={isUpdatingStatus}
            handleStatusChange={handleStatusChange || (() => {})}
            statusOptions={statusOptions}
            isFinanceReviewer={isFinanceReviewer}
            isProcurementReviewer={isProcurementReviewer}
            isApprover={isApprover}
          />
        </div>
      )}

      {/* Comment Section */}
      {requestStatus !== 'draft' && canAddComments && (
        <CommentSection
          comments={comments}
          canComment={canAddComments}
          onAddComment={asyncHandleAddComment}
          onUpdateComment={asyncHandleUpdateComment}
          onDeleteComment={asyncHandleDeleteComment}
          isLoading={isAddingComment}
          isUpdating={isUpdatingComment}
          isDeleting={isDeletingComment}
        />
      )}

      {/* Admin Approval Section */}
      {showAdminApproval && (
        <div className="relative z-10 pb-64">
          <AdminApprovalSection
            formData={formData || { approvedBy: null }}
            handleFormChange={handleFormChange || (() => {})}
            admins={admins}
            isLoadingAmins={isLoadingAmins}
            isUpdating={isUploading}
            handleSend={handleUpload || (() => {})}
          />
        </div>
      )}
    </div>
  );
};

export default RequestDetailLayout;
