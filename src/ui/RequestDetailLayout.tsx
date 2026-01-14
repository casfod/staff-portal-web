// src/ui/RequestDetailLayout.tsx - Fixed version
import { ReactNode } from "react";
import Button from "./Button";
import SpinnerMini from "./SpinnerMini";
import RequestCommentsAndActions from "./RequestCommentsAndActions";
import StatusUpdateForm from "./StatusUpdateForm";
import AdminApprovalSection from "./AdminApprovalSection";
import CommentSection from "./CommentSection";
import { Comment } from "../interfaces";
import { FileUpload } from "./FileUpload";

interface RequestDetailLayoutProps {
  request: any;
  children: ReactNode;

  // File upload props
  canUploadFiles?: boolean;
  selectedFiles?: File[];
  setSelectedFiles?: (files: File[]) => void;
  isUploading?: boolean; // This was isUploading, not isUpdating
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
  isUpdatingComment?: boolean; // Changed from isUpdating to isUpdatingComment
  isDeletingComment?: boolean;

  // Admin approval props
  showAdminApproval?: boolean;
  formData?: any;
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
  isUpdatingComment = false, // Fixed prop name
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

  return (
    <div className="border border-gray-300 px-3 py-2.5 md:px-6 md:py-3 rounded-md h-auto relative">
      {/* Main Content */}
      {children}

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

          {canUpdateStatus && (
            <StatusUpdateForm
              requestStatus={requestStatus}
              status={status}
              setStatus={setStatus || (() => {})}
              comment={comment}
              setComment={setComment || (() => {})}
              isUpdatingStatus={isUpdatingStatus}
              handleStatusChange={handleStatusChange || (() => {})}
            />
          )}
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
          isUpdating={isUpdatingComment} // Fixed prop
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
            isUpdating={isUploading} // Use isUploading here
            handleSend={handleUpload || (() => {})}
          />
        </div>
      )}
    </div>
  );
};

export default RequestDetailLayout;
