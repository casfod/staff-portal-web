import { List } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import { localStorageUser } from "../../utils/localStorageUser";
import Button from "../../ui/Button";
import StatusBadge from "../../ui/StatusBadge";
import { ConceptNoteDetails } from "./ConceptNoteDetails";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import StatusUpdateForm from "../../ui/StatusUpdateForm";
import TextHeader from "../../ui/TextHeader";
import { FileUpload } from "../../ui/FileUpload";
// import { ConceptNoteType } from "../../interfaces";
import SpinnerMini from "../../ui/SpinnerMini";
import { useStatusUpdate } from "../../hooks/useStatusUpdate";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import Spinner from "../../ui/Spinner";
import { DataStateContainer } from "../../ui/DataStateContainer";
import { usePdfDownload } from "../../hooks/usePdfDownload";
import ActionIcons from "../../ui/ActionIcons";
import {
  useAddComment,
  useConceptNote,
  useCopy,
  useDeleteComment,
  useUpdateComment,
  useUpdateConceptNote,
  useUpdateStatus,
} from "./Hooks/useConceptNotes";
import AdminApprovalSection from "../../ui/AdminApprovalSection"; // ADD THIS
import { useAdmins } from "../user/Hooks/useAdmins"; // ADD THIS
import CommentSection from "../../ui/CommentSection";
import { Comment as AppComment } from "../../interfaces";

const ConceptNote = () => {
  const currentUser = localStorageUser();
  const navigate = useNavigate();
  const { requestId } = useParams();

  // Data fetching and reconciliation
  const { data: remoteData, isLoading, isError } = useConceptNote(requestId!);

  const conceptNote = useSelector(
    (state: RootState) => state.conceptNote.conceptNote
  );

  const requestData = useMemo(
    () => remoteData?.data || conceptNote,
    [remoteData, conceptNote]
  );

  // Redirect logic
  useEffect(() => {
    if (!requestId || (!isLoading && !requestData)) {
      navigate("/concept-notes");
    }
  }, [requestData, requestId, navigate, isLoading]);

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
  const { updateConceptNote, isPending: isUpdating } = useUpdateConceptNote(
    conceptNote?.id!
  );

  // Comment hooks (ADDED)
  const { addComment, isPending: isAddingComment } = useAddComment(requestId!);
  const { updateComment, isPending: isUpdatingComment } = useUpdateComment(
    requestId!
  );
  const { deleteComment, isPending: isDeletingComment } = useDeleteComment(
    requestId!
  );

  const { copyto, isPending: isCopying } = useCopy(requestId!);

  // Fetch admins data for approval section
  const { data: adminsData, isLoading: isLoadingAmins } = useAdmins();
  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    updateConceptNote({ data: formData, files: selectedFiles });
  };

  // Handle status change with confirmation dialog
  const onStatusChangeHandler = () => {
    handleStatusChange(status, comment, async (data) => {
      try {
        await updateStatus(data, {
          onError: (error) => {
            throw error;
          },
        });
      } catch (error) {
        throw error;
      }
    });
  };

  // Comment handlers (ADDED)
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
    filename: `ConceptNote-${conceptNote?.id}`,
    multiPage: true,
    titleOptions: {
      text: "Concept Note",
    },
  });

  const handleDownloadPDF = () => {
    downloadPdf(pdfContentRef);
  };

  // User references and permission logic
  const currentUserId = currentUser.id;
  const userRole = currentUser.role;
  const requestStatus = requestData?.status;

  // Permission flags with explicit null checks
  const isCreator = requestData?.preparedBy?.id === currentUserId;
  const isReviewer = requestData?.reviewedBy?.id === currentUserId;
  const isApprover = requestData?.approvedBy?.id === currentUserId;
  const isAdmin = ["SUPER-ADMIN", "ADMIN"].includes(userRole);

  // Check if user is in copiedTo array (ADDED)
  const isCopiedTo = requestData?.copiedTo?.some(
    (user: any) => user.id === currentUserId
  );

  // Conditional rendering flags
  const canUploadFiles = isCreator && requestStatus === "approved";
  const canShareRequest =
    isCreator ||
    ["SUPER-ADMIN", "ADMIN", "REVIEWER"].includes(currentUser.role);

  // Permission to update status
  const canUpdateStatus =
    !isCreator &&
    ((requestStatus === "pending" && isReviewer) ||
      (isAdmin && requestStatus === "reviewed" && isApprover));

  // Users who can add comments (ADDED)
  const canAddComments =
    isCreator ||
    isReviewer ||
    isApprover ||
    isCopiedTo ||
    isAdmin ||
    (userRole === "REVIEWER" && requestStatus === "pending");

  // Show admin approval section (for reviewed concept notes)
  const showAdminApproval =
    !requestData?.approvedBy &&
    requestStatus === "reviewed" &&
    (isCreator ||
      (isReviewer && !requestData?.reviewedBy) ||
      (isApprover && !requestData?.approvedBy));

  // Cast comments to Comment[] type for TypeScript (ADDED)
  const comments = (requestData?.comments || []) as AppComment[];

  const tableHeadData = ["Prepared By", "Status", "Date", "Actions"];

  const tableRowData = [
    {
      id: "name",
      content: `${requestData?.preparedBy?.first_name} ${requestData?.preparedBy?.last_name}`,
    },
    {
      id: "status",
      content: <StatusBadge status={requestData?.status!} key="status-badge" />,
    },
    { id: "createdAt", content: formatToDDMMYYYY(requestData?.createdAt!) },
    {
      id: "action",
      content: (
        <ActionIcons
          copyTo={copyto}
          isCopying={isCopying}
          canShareRequest={canShareRequest}
          requestId={requestData?.id}
          isGeneratingPDF={isGenerating}
          onDownloadPDF={handleDownloadPDF}
          showTagDropdown={showTagDropdown}
          setShowTagDropdown={setShowTagDropdown}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Concept Note</TextHeader>
          <Button onClick={() => navigate("/concept-notes")}>
            <List className="h-4 w-4 mr-1 md:mr-2" />
            List
          </Button>
        </div>
      </div>

      {/* Main Table Section */}
      <div ref={pdfContentRef}>
        <DataStateContainer
          isLoading={isLoading}
          isError={isError}
          data={requestData}
          errorComponent={<NetworkErrorUI />}
          loadingComponent={<Spinner />}
          emptyComponent={<div>No data available</div>}
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {tableHeadData.map((title, index) => (
                  <th
                    key={index}
                    className="px-3 py-2.5 md:px-6 md:py-3 text-left font-medium uppercase text-xs 2xl:text-text-sm tracking-wider"
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              <tr
                key={requestData?.id}
                className="h-[40px] max-h-[40px] hover:cursor-pointer hover:bg-[#f2f2f2]"
              >
                {tableRowData.map((data) => (
                  <td
                    key={data.id}
                    className="min-w-[150px] px-3 py-2.5 md:px-6 md:py-3 text-left font-medium uppercase text-sm 2xl:text-text-base tracking-wider"
                  >
                    {data.content}
                  </td>
                ))}
              </tr>

              <tr>
                <td colSpan={4}>
                  <div className="border border-gray-300 px-3 py-2.5 md:px-6 md:py-3 rounded-md h-auto relative">
                    <ConceptNoteDetails request={requestData!} />

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
                            <Button disabled={isUpdating} onClick={handleSend}>
                              {isUpdating ? <SpinnerMini /> : "Upload"}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Comments and Actions Section */}
                    {requestData?.reviewedBy &&
                      requestData?.status !== "draft" && (
                        <div className="mt-4 tracking-wide">
                          <RequestCommentsAndActions request={requestData} />

                          {canUpdateStatus && (
                            <StatusUpdateForm
                              requestStatus={requestData?.status!}
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

                    {/* Comment Section for all authorized users (ADDED) */}
                    {requestData?.status !== "draft" && canAddComments && (
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

                    {/* Admin Approval Section (for reviewed concept notes) */}
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
            </tbody>
          </table>
        </DataStateContainer>
      </div>
    </div>
  );
};

export default ConceptNote;
