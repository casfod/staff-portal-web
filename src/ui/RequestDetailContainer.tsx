// src/ui/RequestDetailContainer.tsx
import { ReactNode } from "react";
import Button from "./Button";
import SpinnerMini from "./SpinnerMini";

import RequestCommentsAndActions from "./RequestCommentsAndActions";
import StatusUpdateForm from "./StatusUpdateForm";
import AdminApprovalSection from "./AdminApprovalSection";
import { FileUpload } from "./FileUpload";

interface RequestDetailContainerProps {
  request: any;
  canUploadFiles?: boolean;
  selectedFiles?: File[];
  setSelectedFiles?: (files: File[]) => void;
  isUpdating?: boolean;
  handleSend?: (e: React.FormEvent) => void;
  requestStatus: string;
  reviewedBy?: any;
  showCommentsAndActions?: boolean;
  canUpdateStatus?: boolean;
  status?: string;
  setStatus?: (status: string) => void;
  comment?: string;
  setComment?: (comment: string) => void;
  isUpdatingStatus?: boolean;
  handleStatusChange?: () => void;
  showAdminApproval?: boolean;
  formData?: any;
  handleFormChange?: (field: string, value: string) => void;
  admins?: any[];
  isLoadingAmins?: boolean;
  handleAction?: (request: any) => void;
  children: ReactNode;
}

const RequestDetailContainer = ({
  request,
  canUploadFiles = false,
  selectedFiles = [],
  setSelectedFiles,
  isUpdating = false,
  handleSend,
  requestStatus,
  reviewedBy,
  showCommentsAndActions = true,
  canUpdateStatus = false,
  status = "",
  setStatus,
  comment = "",
  setComment,
  isUpdatingStatus = false,
  handleStatusChange,
  showAdminApproval = false,
  formData = { approvedBy: null },
  handleFormChange,
  admins = [],
  isLoadingAmins = false,
  handleAction,
  children,
}: RequestDetailContainerProps) => {
  return (
    <div className="border border-gray-300 px-3 py-2.5 md:px-6 md:py-3 rounded-md h-auto relative">
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
              <Button disabled={isUpdating} onClick={handleSend || (() => {})}>
                {isUpdating ? <SpinnerMini /> : "Upload"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Comments and Actions Section */}
      {reviewedBy && requestStatus !== "draft" && showCommentsAndActions && (
        <div className="mt-4 tracking-wide">
          <RequestCommentsAndActions
            request={request}
            handleAction={handleAction}
          />

          {canUpdateStatus && status !== undefined && (
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

      {/* Admin Approval Section */}
      {showAdminApproval && (
        <div className="relative z-10 pb-64">
          <AdminApprovalSection
            formData={formData}
            handleFormChange={handleFormChange || (() => {})}
            admins={admins}
            isLoadingAmins={isLoadingAmins}
            isUpdating={isUpdating}
            handleSend={handleSend || (() => {})}
          />
        </div>
      )}
    </div>
  );
};

export default RequestDetailContainer;
