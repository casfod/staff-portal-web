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
import TextHeader from "../../ui/TextHeader";
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
import { useAdmins } from "../user/Hooks/useUsers";
import { Comment as AppComment } from "../../interfaces";
import TableRowMain from "../../ui/TableRowMain";
import TableData from "../../ui/TableData";
import RequestCard from "../../ui/RequestCard";
import RequestDetailLayout from "../../ui/RequestDetailLayout";

const ConceptNote = () => {
  const currentUser = localStorageUser();
  const navigate = useNavigate();
  const { requestId } = useParams();

  // Data fetching and reconciliation
  const { data: remoteData, isLoading, isError } = useConceptNote(requestId!);

  const conceptNote = useSelector(
    (state: RootState) => state.conceptNote.conceptNote
  );

  const request = useMemo(
    () => remoteData?.data || conceptNote,
    [remoteData, conceptNote]
  );

  // Redirect logic
  useEffect(() => {
    if (!requestId || (!isLoading && !request)) {
      navigate("/concept-notes");
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
  const { updateConceptNote, isPending: isUpdating } = useUpdateConceptNote(
    request?.id!
  );

  // Comment hooks
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
    filename: `ConceptNote-${request?.id}`,
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
  const requestStatus = request?.status;

  // Permission flags
  const isCreator = request?.preparedBy?.id === currentUserId;
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

  // Permission to update status
  const canUpdateStatus =
    !isCreator &&
    ((requestStatus === "pending" && isReviewer) ||
      (isAdmin && requestStatus === "reviewed" && isApprover));

  // Users who can add comments
  const canAddComments =
    isCreator ||
    isReviewer ||
    isApprover ||
    isCopiedTo ||
    isAdmin ||
    (userRole === "REVIEWER" && requestStatus === "pending");

  // Show admin approval section (for reviewed concept notes)
  const showAdminApproval =
    !request?.approvedBy &&
    requestStatus === "reviewed" &&
    (isCreator ||
      (isReviewer && !request?.reviewedBy) ||
      (isApprover && !request?.approvedBy));

  // Cast comments to Comment[] type for TypeScript
  const comments = (request?.comments || []) as AppComment[];

  const requestCreatedAt = request?.createdAt ?? "";
  const fullDate = formatToDDMMYYYY(requestCreatedAt);

  // Table data configuration - matching Purchase Request structure
  const tableHeadData = [
    { label: "Prepared By", showOnMobile: true, minWidth: "120px" },
    { label: "Status", showOnMobile: true, minWidth: "100px" },
    {
      label: "Date",
      showOnMobile: false,
      showOnTablet: true,
      minWidth: "100px",
    },
    { label: "Actions", showOnMobile: true, minWidth: "100px" },
  ];

  const tableRowData = [
    {
      id: "name",
      content: `${request?.preparedBy?.first_name} ${request?.preparedBy?.last_name}`,
      showOnMobile: true,
      showOnTablet: true,
    },
    {
      id: "status",
      content: <StatusBadge status={request?.status!} />,
      showOnMobile: true,
      showOnTablet: true,
    },
    {
      id: "date",
      content: fullDate,
      showOnMobile: false,
      showOnTablet: true,
    },
    {
      id: "actions",
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
          hideInspect={true}
        />
      ),
      showOnMobile: true,
      showOnTablet: true,
    },
  ];

  return (
    <div className="flex flex-col space-y-3 pb-20">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Concept Note</TextHeader>
          <Button onClick={() => navigate("/concept-notes")}>
            <List className="h-4 w-4 mr-1 md:mr-2" />
            List
          </Button>
        </div>
      </div>

      {/* Main Content Section */}
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
                  {/* Desktop/Tablet Row */}
                  <TableRowMain
                    key={request?.id}
                    requestId={request?.id || ""}
                    toggleViewItems={() => {}}
                    className="hidden sm:table-row"
                  >
                    {tableRowData.map(
                      ({ id, content, showOnMobile, showOnTablet }) => (
                        <TableData
                          key={`${request?.id}-${id}`}
                          className={`
                          ${!showOnMobile ? "hidden md:table-cell" : ""}
                          ${
                            showOnTablet
                              ? "hidden sm:table-cell md:table-cell"
                              : ""
                          }
                          px-3 py-2.5 md:px-4 md:py-3
                        `}
                        >
                          {content}
                        </TableData>
                      )
                    )}
                  </TableRowMain>

                  {/* Mobile Card View */}
                  <tr key={`${request?.id}-mobile`} className="sm:hidden">
                    <td
                      colSpan={tableHeadData.length}
                      className="p-4 border-b border-gray-200"
                    >
                      <RequestCard
                        request={request!}
                        totalAmount={Number(request?.activity_budget || 0)}
                        requestId={request?.id || ""}
                        identifier={request?.cnNumber}
                        dateValue={requestCreatedAt}
                        actionIconsProps={{
                          copyTo: copyto,
                          isCopying,
                          canShareRequest,
                          isGeneratingPDF: isGenerating,
                          onDownloadPDF: handleDownloadPDF,
                          showTagDropdown,
                          setShowTagDropdown,
                          hideInspect: true,
                        }}
                        context="detail"
                        showActions={true}
                        showStatus={true}
                        showIdentifier={true}
                        showDate={true}
                        className="sm:hidden"
                      />
                    </td>
                  </tr>

                  {/* Details Section */}
                  <tr>
                    <td colSpan={tableHeadData.length}>
                      <RequestDetailLayout
                        request={request}
                        requestStatus={request?.status || ""}
                        // File upload props
                        canUploadFiles={canUploadFiles}
                        selectedFiles={selectedFiles}
                        setSelectedFiles={setSelectedFiles}
                        isUploading={isUpdating}
                        handleUpload={handleSend}
                        // Status update props
                        canUpdateStatus={canUpdateStatus}
                        status={status}
                        setStatus={setStatus}
                        comment={comment}
                        setComment={setComment}
                        isUpdatingStatus={isUpdatingStatus}
                        handleStatusChange={onStatusChangeHandler}
                        // Comment props
                        comments={comments}
                        canAddComments={canAddComments}
                        handleAddComment={handleAddComment}
                        handleUpdateComment={handleUpdateComment}
                        handleDeleteComment={handleDeleteComment}
                        isAddingComment={isAddingComment}
                        isUpdatingComment={isUpdatingComment}
                        isDeletingComment={isDeletingComment}
                        // Admin approval props
                        showAdminApproval={showAdminApproval}
                        formData={formData}
                        handleFormChange={handleFormChange}
                        admins={admins}
                        isLoadingAmins={isLoadingAmins}
                      >
                        <ConceptNoteDetails request={request!} />
                      </RequestDetailLayout>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </DataStateContainer>
      </div>
    </div>
  );
};

export default ConceptNote;
