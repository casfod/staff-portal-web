import { List } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { RootState } from "../../store/store";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import { moneyFormat } from "../../utils/moneyFormat";

import { localStorageUser } from "../../utils/localStorageUser";
import { useAdmins } from "../user/Hooks/useAdmins";

import { AdvanceRequestDetails } from "./AdvanceRequestDetails";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import AdminApprovalSection from "../../ui/AdminApprovalSection";
import StatusUpdateForm from "../../ui/StatusUpdateForm";
import StatusBadge from "../../ui/StatusBadge";
import Button from "../../ui/Button";
import TextHeader from "../../ui/TextHeader";
import { FileUpload } from "../../ui/FileUpload";
import SpinnerMini from "../../ui/SpinnerMini";
import { useStatusUpdate } from "../../hooks/useStatusUpdate";
import {
  useAdvanceRequest,
  useCopy,
  useUpdateAdvanceRequest,
  useUpdateStatus,
  useAddComment,
  useUpdateComment,
  useDeleteComment,
} from "./Hooks/useAdvanceRequest";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import Spinner from "../../ui/Spinner";
import { DataStateContainer } from "../../ui/DataStateContainer";
import ActionIcons from "../../ui/ActionIcons";
import { usePdfDownload } from "../../hooks/usePdfDownload";
import CommentSection from "../../ui/CommentSection";
import { Comment } from "../../interfaces";

const Request = () => {
  const currentUser = localStorageUser();
  const navigate = useNavigate();
  const { requestId } = useParams();

  // Data fetching and reconciliation
  const {
    data: remoteData,
    isLoading,
    isError,
  } = useAdvanceRequest(requestId!);

  const advanceRequest = useSelector(
    (state: RootState) => state.advanceRequest.advanceRequest
  );

  const request = useMemo(
    () => remoteData?.data || advanceRequest,
    [remoteData, advanceRequest]
  );

  // Redirect logic
  useEffect(() => {
    if (!requestId || (!isLoading && !request)) {
      navigate("/advance-requests");
    }
  }, [request, requestId, navigate, isLoading]);

  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");
  const [formData, setFormData] = useState({ approvedBy: null });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  // Custom hooks
  const { handleStatusChange } = useStatusUpdate();
  const { updateStatus, isPending: isUpdatingStatus } = useUpdateStatus(
    requestId!
  );
  const { updateAdvanceRequest, isPending: isUpdating } =
    useUpdateAdvanceRequest(requestId!);

  // Comment hooks
  const { addComment, isPending: isAddingComment } = useAddComment(requestId!);
  const { updateComment, isPending: isUpdatingComment } = useUpdateComment(
    requestId!
  );
  const { deleteComment, isPending: isDeletingComment } = useDeleteComment(
    requestId!
  );

  // Fetch admins data
  const { data: adminsData, isLoading: isLoadingAmins } = useAdmins();
  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);

  const { copyto, isPending: isCopying } = useCopy(requestId!);

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle status change with confirmation dialog
  const onStatusChangeHandler = () => {
    handleStatusChange(status, comment, async (data) => {
      try {
        await updateStatus(data, {
          onError: (error) => {
            // This will be caught by the handleStatusChange's try/catch
            throw error;
          },
        });
      } catch (error) {
        // Re-throw to ensure the promise chain is maintained
        throw error;
      }
    });
  };

  // Handle form submission
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdvanceRequest({ data: formData, files: selectedFiles });
  };

  // Comment handlers
  const handleAddComment = async (text: string) => {
    await addComment({ text });
  };

  const handleUpdateComment = async (commentId: string, text: string) => {
    await updateComment({ commentId, text });
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
  };

  //PDF logic
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const { downloadPdf, isGenerating } = usePdfDownload({
    filename: `AdvanceRequest-${advanceRequest?.id}`,
    multiPage: true,
    titleOptions: {
      text: "Advance Request",
    },
  });
  const handleDownloadPDF = () => {
    downloadPdf(pdfContentRef);
  };

  const totalAmount =
    request?.itemGroups?.reduce((sum, item) => sum + item.total, 0) || 0;

  // User references
  const currentUserId = currentUser.id;
  const userRole = currentUser.role;
  const requestStatus = request?.status;

  // Permission flags with explicit null checks
  const isCreator = request?.createdBy?.id === currentUserId;
  const isReviewer = request?.reviewedBy?.id === currentUserId;
  const isApprover = request?.approvedBy?.id === currentUserId;
  const isAdmin = ["SUPER-ADMIN", "ADMIN"].includes(userRole);

  // Check if user is in copiedTo array
  const isCopiedTo = request?.copiedTo?.some(
    (user: any) => user.id === currentUserId
  );

  // Conditional rendering flags
  const canUploadFiles = isCreator && requestStatus === "approved";
  const canShareRequest =
    isCreator ||
    ["SUPER-ADMIN", "ADMIN", "REVIEWER"].includes(currentUser.role);
  const canUpdateStatus =
    !isCreator &&
    ((userRole === "REVIEWER" && requestStatus === "pending" && isReviewer) ||
      (isAdmin && requestStatus === "reviewed" && isApprover));

  // Users who can add comments
  const canAddComments =
    isCreator ||
    isReviewer ||
    isApprover ||
    isCopiedTo ||
    isAdmin ||
    (userRole === "REVIEWER" && requestStatus === "pending");

  const showAdminApproval =
    !request?.approvedBy &&
    requestStatus === "reviewed" &&
    (isCreator ||
      (isReviewer && !request?.reviewedBy) ||
      (isApprover && !request?.approvedBy));
  const requestCreatedAt = request?.createdAt ?? "";

  const fullDate = formatToDDMMYYYY(requestCreatedAt);

  // Table data
  // Responsive table header configuration
  const tableHeadData = [
    { label: "Request", showOnMobile: true, minWidth: "120px" },
    { label: "Status", showOnMobile: true, minWidth: "100px" },
    { label: "Amount", showOnMobile: true, minWidth: "100px" },
    {
      label: "Date",
      showOnMobile: false,
      showOnTablet: true,
      minWidth: "100px",
    },
    { label: "Actions", showOnMobile: true, minWidth: "100px" },
  ];
  const tableRowData = [
    { id: "requestedBy", content: request?.requestedBy },
    { id: "status", content: <StatusBadge status={request?.status!} /> },
    { id: "totalAmount", content: moneyFormat(totalAmount, "NGN") },
    { id: "createdAt", content: formatToDDMMYYYY(request?.createdAt!) },
    {
      id: "action",
      content: (
        <ActionIcons
          copyTo={copyto}
          isCopying={isCopying}
          canShareRequest={canShareRequest}
          requestId={request?.id}
          isGeneratingPDF={isGenerating}
          onDownloadPDF={handleDownloadPDF}
          showTagDropdown={showTagDropdown}
          setShowTagDropdown={setShowTagDropdown}
        />
      ),
    },
  ];

  // Cast comments to Comment[] type for TypeScript
  const comments = (request?.comments || []) as Comment[];

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Advance Request</TextHeader>
          <Button onClick={() => navigate("/advance-requests")}>
            <List className="h-4 w-4 mr-1 md:mr-2" />
            List
          </Button>
        </div>
      </div>

      {/* Main Table Section */}

      <div id="pdfContentRef" ref={pdfContentRef}>
        <DataStateContainer
          isLoading={isLoading}
          isError={isError}
          data={request}
          errorComponent={<NetworkErrorUI />}
          loadingComponent={<Spinner />}
          emptyComponent={<div>No data available</div>}
        >
          <div className="overflow-x-auto">
            <div className="md:min-w-full">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 hidden sm:table-header-group">
                  <tr>
                    {tableHeadData.map((header, index) => (
                      <th
                        key={index}
                        className={`
                          px-3 py-2.5 md:px-4 md:py-3 
                          text-left font-medium uppercase 
                          tracking-wider
                          ${!header.showOnMobile ? "hidden md:table-cell" : ""}
                          ${
                            header.showOnTablet
                              ? "hidden sm:table-cell md:table-cell"
                              : ""
                          }
                          text-xs md:text-sm
                          whitespace-nowrap
                        `}
                        style={{ minWidth: header.minWidth }}
                      >
                        {header.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  <>
                    {/* Advance Request Details Row */}
                    <tr key={request?.id} className="hidden sm:table-row">
                      {tableRowData.map((data, index) => (
                        <td
                          key={`${data.id}-${index}`}
                          className="px-3 py-2.5 md:px-6 md:py-3 text-left text-sm 2xl:text-base tracking-wider"
                        >
                          {data.content}
                        </td>
                      ))}
                    </tr>

                    {/* Mobile Card View */}
                    <tr key={`${requestId}-mobile`} className="sm:hidden">
                      <td
                        colSpan={tableHeadData.length}
                        className="p-4 border-b border-gray-200"
                      >
                        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm space-y-3">
                          {/* Top Row - Main Info */}

                          <div className="flex flex-col items-center gap-1">
                            <div className="mt-1">
                              <StatusBadge
                                status={request?.status!}
                                size="sm"
                              />
                            </div>

                            <h3 className="text-center font-semibold text-gray-900 truncate">
                              {request?.requestedBy}
                            </h3>
                          </div>

                          <div className="text-center">
                            <div className="text-xs font-bold">
                              {moneyFormat(totalAmount, "NGN")}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {fullDate}
                            </div>
                          </div>

                          {/* Bottom Row - Actions */}
                          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <span className="text-sm text-gray-600">
                              {request?.arNumber ||
                                `ID: ${requestId?.substring(0, 8)}`}
                            </span>
                            <div className="flex items-center space-x-2">
                              <ActionIcons
                                copyTo={copyto}
                                isCopying={isCopying}
                                canShareRequest={canShareRequest}
                                requestId={request?.id}
                                isGeneratingPDF={isGenerating}
                                onDownloadPDF={handleDownloadPDF}
                                showTagDropdown={showTagDropdown}
                                setShowTagDropdown={setShowTagDropdown}
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* Items Table Section */}
                    <tr>
                      <td colSpan={5}>
                        <div className="border border-gray-300 px-3 py-2.5 md:px-6 md:py-3 rounded-md h-auto relative">
                          <AdvanceRequestDetails request={request!} />

                          {canUploadFiles && (
                            <div className="flex flex-col gap-3 mt-3">
                              <FileUpload
                                selectedFiles={selectedFiles}
                                setSelectedFiles={setSelectedFiles}
                                accept=".jpg,.png,.pdf,.xlsx,.docx"
                                multiple={true}
                              />

                              {selectedFiles.length > 0 && (
                                <div className="self-center">
                                  <Button
                                    disabled={isUpdating}
                                    onClick={handleSend}
                                  >
                                    {isUpdating ? <SpinnerMini /> : "Upload"}
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Comments and Actions Section */}
                          {request?.reviewedBy &&
                            request?.status !== "draft" && (
                              <div className="  mt-4 tracking-wide">
                                <RequestCommentsAndActions request={request} />

                                {canUpdateStatus && (
                                  <StatusUpdateForm
                                    requestStatus={request?.status!}
                                    status={status}
                                    setStatus={setStatus}
                                    comment={comment}
                                    setComment={setComment}
                                    isUpdatingStatus={isUpdatingStatus}
                                    handleStatusChange={onStatusChangeHandler}
                                  />
                                )}
                              </div>
                            )}

                          {/* Comment Section for all authorized users */}
                          {request?.status !== "draft" && canAddComments && (
                            <CommentSection
                              comments={comments}
                              canComment={canAddComments}
                              onAddComment={handleAddComment}
                              onUpdateComment={handleUpdateComment}
                              onDeleteComment={handleDeleteComment}
                              isLoading={isAddingComment}
                              isUpdating={isUpdatingComment}
                              isDeleting={isDeletingComment}
                            />
                          )}

                          {/* Admin Approval Section (for STAFF role) */}
                          {showAdminApproval && (
                            <div className="relative z-10 pb-64">
                              <AdminApprovalSection
                                formData={formData}
                                handleFormChange={handleFormChange}
                                admins={admins}
                                isLoadingAmins={isLoadingAmins}
                                isUpdating={isUpdating}
                                handleSend={handleSend}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  </>
                </tbody>
              </table>
            </div>
          </div>
        </DataStateContainer>
      </div>
    </div>
  );
};

export default Request;
