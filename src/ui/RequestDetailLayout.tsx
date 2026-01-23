import { ReactNode } from "react";
import { Comment, PurChaseRequestType } from "../interfaces";
import AdminApprovalSection from "./AdminApprovalSection";
import Button from "./Button";
import CommentSection from "./CommentSection";
import { FileUpload } from "./FileUpload";
import RequestCommentsAndActions from "./RequestCommentsAndActions";
import SpinnerMini from "./SpinnerMini";
import StatusUpdateForm from "./StatusUpdateForm";

interface RequestDetailLayoutProps {
  request: any;
  children: ReactNode;

  // Two-step approval props
  isFinanceReviewer?: boolean;
  isProcurementReviewer?: boolean;
  isApprover?: boolean;
  financeReviewStatus?: "pending" | "approved" | "rejected";
  procurementReviewStatus?: "pending" | "approved" | "rejected";
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
  comments?: Comment[];
  canAddComments?: boolean;
  handleAddComment?: (text: string) => Promise<void>;
  handleUpdateComment?: (commentId: string, text: string) => Promise<void>;
  handleDeleteComment?: (commentId: string) => Promise<void>;
  isAddingComment?: boolean;
  isUpdatingComment?: boolean;
  isDeletingComment?: boolean;

  // Admin approval props
  showAdminApproval?: boolean;
  formData?: Partial<PurChaseRequestType>;
  handleFormChange?: (field: string, value: string) => void;
  admins?: any[];
  isLoadingAmins?: boolean;

  // Other props
  requestStatus: string;
  handleAction?: (request: any) => void;
}

const RequestDetailLayout = ({
  request,
  children,

  // Two-step approval props
  isFinanceReviewer = false,
  isProcurementReviewer = false,
  isApprover = false,
  financeReviewStatus,
  procurementReviewStatus,
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
  status = "",
  setStatus,
  comment = "",
  setComment,
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
}: RequestDetailLayoutProps) => {
  // Async wrapper functions for comments
  const asyncHandleAddComment = async (text: string) => {
    if (handleAddComment) {
      return handleAddComment(text);
    }
    return Promise.resolve();
  };

  const asyncHandleUpdateComment = async (commentId: string, text: string) => {
    if (handleUpdateComment) {
      return handleUpdateComment(commentId, text);
    }
    return Promise.resolve();
  };

  const asyncHandleDeleteComment = async (commentId: string) => {
    if (handleDeleteComment) {
      return handleDeleteComment(commentId);
    }
    return Promise.resolve();
  };

  // Determine which status options to show
  // const getStatusOptions = () => {
  //   const options = [];

  //   // Add appropriate options based on user role and current status
  //   if (canReviewFinance) {
  //     options.push(
  //       { value: "approved", label: "Approve Finance Review" },
  //       { value: "rejected", label: "Reject Finance Review" }
  //     );
  //   } else if (canReviewProcurement) {
  //     options.push(
  //       { value: "approved", label: "Approve Procurement Review" },
  //       { value: "rejected", label: "Reject Procurement Review" }
  //     );
  //   } else if (canApprove) {
  //     options.push(
  //       { value: "approved", label: "Approve Request" },
  //       { value: "rejected", label: "Reject Request" }
  //     );
  //   } else {
  //     // Fallback for backward compatibility
  //     if (requestStatus === "pending") {
  //       options.push({ value: "reviewed", label: "Approve Review" });
  //     }
  //     if (requestStatus === "reviewed") {
  //       options.push({ value: "approved", label: "Approve Request" });
  //     }
  //     options.push({ value: "rejected", label: "Reject" });
  //   }

  //   return options;
  // };

  const getStatusOptions = () => {
    const options = [];
  
    // Check if this is a purchase order (has POCode field)
    const isPurchaseOrder = request?.POCode !== undefined;
  
    if (isPurchaseOrder) {
      // Purchase orders have direct approval
      options.push(
        { value: "approved", label: "Approve Purchase Order" },
        { value: "rejected", label: "Reject Purchase Order" }
      );
    } else if (canReviewFinance) {
      options.push(
        { value: "approved", label: "Approve Finance Review" },
        { value: "rejected", label: "Reject Finance Review" }
      );
    } else if (canReviewProcurement) {
      options.push(
        { value: "approved", label: "Approve Procurement Review" },
        { value: "rejected", label: "Reject Procurement Review" }
      );
    } else if (canApprove) {
      options.push(
        { value: "approved", label: "Approve Request" },
        { value: "rejected", label: "Reject Request" }
      );
    } else {
      // Fallback for backward compatibility
      if (requestStatus === "pending") {
        options.push({ value: "reviewed", label: "Approve Review" });
      }
      if (requestStatus === "reviewed") {
        options.push({ value: "approved", label: "Approve Request" });
      }
      options.push({ value: "rejected", label: "Reject" });
    }
  
    return options;
  };
  const statusOptions = getStatusOptions();

  return (
    <div className="border border-gray-300 px-3 py-2.5 md:px-6 md:py-3 rounded-md h-auto relative">
      {/* Main Content */}
      {children}

      {/* Two-step approval status display */}
      {(financeReviewStatus || procurementReviewStatus) && (
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h3 className="font-bold text-lg mb-2">Review Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {financeReviewStatus && (
              <div className="flex items-center justify-between p-3 bg-white rounded border">
                <span className="font-medium">Finance Review:</span>
                <span
                  className={`px-3 py-1 rounded text-sm font-semibold ${
                    financeReviewStatus === "approved"
                      ? "bg-green-100 text-green-800"
                      : financeReviewStatus === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {financeReviewStatus.toUpperCase()}
                </span>
              </div>
            )}
            {procurementReviewStatus && (
              <div className="flex items-center justify-between p-3 bg-white rounded border">
                <span className="font-medium">Procurement Review:</span>
                <span
                  className={`px-3 py-1 rounded text-sm font-semibold ${
                    procurementReviewStatus === "approved"
                      ? "bg-green-100 text-green-800"
                      : procurementReviewStatus === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {procurementReviewStatus.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* File Upload Section */}
      {canUploadFiles && (
        <div className="flex flex-col gap-3 mt-3">
          <FileUpload
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles || (() => {})}
            accept=".jpg,.png,.pdf,.xlsx,.docx"
            multiple={true}
          />

          {selectedFiles.length > 0 && (
            <div className="self-center">
              <Button
                disabled={isUploading}
                onClick={handleUpload || (() => {})}
              >
                {isUploading ? <SpinnerMini /> : "Upload"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Comments and Actions Section */}
      {request?.reviewedBy && requestStatus !== "draft" && (
        <div className="mt-4 tracking-wide">
          <RequestCommentsAndActions
            request={request}
            handleAction={handleAction}
          />
        </div>
      )}

      {/* Status Update Form */}
      {canUpdateStatus && (
        <div className="mt-4">
          <StatusUpdateForm
            requestStatus={requestStatus}
            status={status}
            setStatus={setStatus || (() => {})}
            comment={comment}
            setComment={setComment || (() => {})}
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
      {requestStatus !== "draft" && canAddComments && (
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
            formData={formData}
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
