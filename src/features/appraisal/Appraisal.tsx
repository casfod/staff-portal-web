// src/features/appraisal/Appraisal.tsx
import { List } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import { localStorageUser } from "../../utils/localStorageUser";
import Button from "../../ui/Button";
import StatusBadge from "../../ui/StatusBadge";
import { AppraisalDetails } from "./AppraisalDetails";
import TextHeader from "../../ui/TextHeader";
import { useStatusUpdate } from "../../hooks/useStatusUpdate";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import Spinner from "../../ui/Spinner";
import { DataStateContainer } from "../../ui/DataStateContainer";
import ActionIcons from "../../ui/ActionIcons";
import {
  useAppraisal,
  useAddComment,
  useDeleteComment,
  useUpdateComment,
  useUpdateAppraisalStatus,
  useCopy,
} from "./Hooks/useAppraisal";
import { Comment as AppComment, UserType } from "../../interfaces";
import TableRowMain from "../../ui/TableRowMain";
import TableData from "../../ui/TableData";
import RequestCard from "../../ui/RequestCard";
import RequestDetailLayout from "../../ui/RequestDetailLayout";
import { usePdfDownload } from "../../hooks/usePdfDownload";
import { capitalizeFirstLetter } from "../../utils/capitalizeFirstLetter";

const Appraisal = () => {
  const currentUser = localStorageUser();
  const navigate = useNavigate();
  const { appraisalId } = useParams();

  // Data fetching
  const {
    data: remoteData,
    isLoading,
    isError,
    refetch,
  } = useAppraisal(appraisalId!);

  const appraisal = useSelector(
    (state: RootState) => state.appraisal?.appraisal
  );

  const request = useMemo(
    () => remoteData?.data || appraisal,
    [remoteData, appraisal]
  );

  // Redirect logic
  useEffect(() => {
    if (!appraisalId || (!isLoading && !request)) {
      navigate("/human-resources/appraisals");
    }
  }, [request, appraisalId, navigate, isLoading]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  // Custom hooks
  const { handleStatusChange } = useStatusUpdate();
  const { updateStatus, isPending: isUpdatingStatus } =
    useUpdateAppraisalStatus(appraisalId!);

  const { copyto, isPending: isCopying } = useCopy(appraisalId!);

  // Comment hooks
  const { addComment, isPending: isAddingComment } = useAddComment(
    appraisalId!
  );
  const { updateComment, isPending: isUpdatingComment } = useUpdateComment(
    appraisalId!
  );
  const { deleteComment, isPending: isDeletingComment } = useDeleteComment(
    appraisalId!
  );

  //PDF logic
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const { downloadPdf, isGenerating } = usePdfDownload({
    filename: `CASFOD-Appraisal-${request?.appraisalCode || request?.id}`,
    multiPage: true,
    // FIX: titleOptions should be an object with 'text' property, not just a string
    titleOptions: {
      text: `CASFOD Appraisal: ${capitalizeFirstLetter(request?.status ?? "")}`,

      fontSize: 16,
      fontStyle: "bold",
      color: "#000000",
      marginBottom: 10,
    },

    footerCode: {
      label: "CASFOD Appraisal",
      value: request?.appraisalCode ?? "",
    },
  });
  const handleDownloadPDF = () => {
    downloadPdf(pdfContentRef);
  };

  // Handle status change with confirmation dialog
  const onStatusChangeHandler = () => {
    handleStatusChange(status, comment, async () => {
      try {
        await updateStatus(
          { status, comment } as {
            status: "approved" | "rejected";
            comment?: string;
          },
          {
            onError: (error) => {
              throw error;
            },
          }
        );
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

  // User references and permission logic
  const currentUserId = currentUser?.id;
  const userRole = currentUser?.role;
  const requestStatus = request?.status;

  // Permission flags
  const isStaff = request?.staffId?.id === currentUserId;
  const isSupervisor = request?.supervisorId?.id === currentUserId;
  const isAdmin = ["SUPER-ADMIN", "ADMIN"].includes(userRole || "");

  // Permission to update status
  const canUpdateStatus =
    requestStatus === "pending" && (isSupervisor || isAdmin);

  // Permission to share/copy request
  const canShareRequest = isStaff || isSupervisor || isAdmin;

  // Users who can add comments
  const canAddComments = isStaff || isSupervisor || isAdmin;

  // Permission to edit different sections with correct status mapping
  const canEditStaffSections =
    isStaff && (requestStatus === "draft" || requestStatus === "pending");
  const canEditSupervisorSections = isSupervisor && requestStatus === "pending";

  const comments = (request?.comments || []) as AppComment[];

  const requestCreatedAt = request?.createdAt ?? "";
  const fullDate = formatToDDMMYYYY(requestCreatedAt);
  const createdBy: UserType | null = request?.createdBy;

  const tableHeadData = [
    { label: "Staff Name", showOnMobile: true, minWidth: "120px" },
    { label: "Status", showOnMobile: true, minWidth: "100px" },

    {
      label: "Appraisal Code",
      showOnMobile: false,
      showOnTablet: true,
      minWidth: "120px",
    },

    // {
    //   label: "Period",
    //   showOnMobile: false,
    //   showOnTablet: true,
    //   minWidth: "120px",
    // },
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
      content:
        request?.staffName ||
        `${createdBy?.first_name || ""} ${createdBy?.last_name || ""}`.trim() ||
        "N/A",
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
      id: "code",
      content: request?.appraisalCode || "N/A",
      showOnMobile: false,
      showOnTablet: true,
    },
    // {
    //   id: "period",
    //   content: request?.appraisalPeriod || "N/A",
    //   showOnMobile: false,
    //   showOnTablet: true,
    // },

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
          <TextHeader>Appraisal - {request?.appraisalCode}</TextHeader>
          <Button onClick={() => navigate("/human-resources/appraisals")}>
            <List className="h-4 w-4 mr-1 md:mr-2" />
            List
          </Button>
        </div>
      </div>

      {/* Main Content Section */}
      <div>
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
                        totalAmount={0}
                        requestId={request?.id || ""}
                        identifier={request?.appraisalCode}
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
                      >
                        <div ref={pdfContentRef}>
                          <AppraisalDetails
                            request={request!}
                            canEditStaffSections={canEditStaffSections}
                            canEditSupervisorSections={
                              canEditSupervisorSections
                            }
                            isStaff={isStaff}
                            isSupervisor={isSupervisor}
                            isAdmin={isAdmin}
                          />
                        </div>
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

export default Appraisal;
