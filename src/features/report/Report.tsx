import { List } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { RootState } from "../../store/store";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import { localStorageUser } from "../../utils/localStorageUser";
import { useAdmins } from "../user/Hooks/useUsers";
import { ReportDetails } from "./ReportDetails";
import StatusBadge from "../../ui/StatusBadge";
import Button from "../../ui/Button";
import TextHeader from "../../ui/TextHeader";
import { useStatusUpdate } from "../../hooks/useStatusUpdate";
import {
  useReport,
  useCopyReport,
  useUpdateReport,
  useUpdateReportStatus,
  useAddReportComment,
  useUpdateReportComment,
  useDeleteReportComment,
} from "./Hooks/useReport";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import Spinner from "../../ui/Spinner";
import { DataStateContainer } from "../../ui/DataStateContainer";
import ActionIcons from "../../ui/ActionIcons";
import { usePdfDownload } from "../../hooks/usePdfDownload";
import { Comment } from "../../interfaces";
import TableData from "../../ui/TableData";
import TableRowMain from "../../ui/TableRowMain";
import RequestCard from "../../ui/RequestCard";
import RequestDetailLayout from "../../ui/RequestDetailLayout";
import { capitalizeFirstLetter } from "../../utils/capitalizeFirstLetter";

const Report = () => {
  const currentUser = localStorageUser();
  const navigate = useNavigate();
  const { requestId } = useParams();

  const { data: remoteData, isLoading, isError } = useReport(requestId!);

  const reportFromStore = useSelector(
    (state: RootState) => state.report.report
  );

  const report = useMemo(
    () => remoteData?.data || reportFromStore,
    [remoteData, reportFromStore]
  );

  // console.log({ report, requestId, navigate, isLoading });

  useEffect(() => {
    if (!requestId || (!isLoading && !report)) {
      navigate("/reporting");
    }
  }, [report, requestId, navigate, isLoading]);

  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");
  const [formData, setFormData] = useState({ approvedBy: null });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const { handleStatusChange } = useStatusUpdate();
  const { updateStatus, isPending: isUpdatingStatus } = useUpdateReportStatus(
    requestId!
  );
  const { updateReport, isPending: isUpdating } = useUpdateReport(requestId!);

  const { addComment, isPending: isAddingComment } = useAddReportComment(
    requestId!
  );
  const { updateComment, isPending: isUpdatingComment } =
    useUpdateReportComment(requestId!);
  const { deleteComment, isPending: isDeletingComment } =
    useDeleteReportComment(requestId!);

  const { data: adminsData, isLoading: isLoadingAmins } = useAdmins();
  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);

  const { copyTo, isPending: isCopying } = useCopyReport(requestId!);

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    updateReport({ data: formData, files: selectedFiles });
  };

  const handleAddComment = async (text: string) => {
    await addComment({ text });
  };
  const handleUpdateComment = async (commentId: string, text: string) => {
    await updateComment({ commentId, text });
  };
  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
  };

  const pdfContentRef = useRef<HTMLDivElement>(null);
  const { downloadPdf, isGenerating } = usePdfDownload({
    filename: `CASFOD-Report-${report?.id}`,
    multiPage: true,
    titleOptions: {
      text: `CASFOD Report : ${capitalizeFirstLetter(report?.status ?? "")}`,
    },
    footerCode: {
      label: "CASFOD Report",
      value: report?.reportNumber ?? "",
    },
  });
  const handleDownloadPDF = () => {
    downloadPdf(pdfContentRef);
  };

  const currentUserId = currentUser.id;
  const userRole = currentUser.role;
  const requestStatus = report?.status;

  const isCreator = report?.createdBy?.id === currentUserId;
  const isReviewer = report?.reviewedBy?.id === currentUserId;
  const isApprover = report?.approvedBy?.id === currentUserId;
  const isAdmin = ["SUPER-ADMIN", "ADMIN"].includes(userRole);

  const isCopiedTo = report?.copiedTo?.some(
    (user: any) => user.id === currentUserId
  );

  const canUploadFiles = isCreator && requestStatus === "approved";
  const canShareRequest =
    isCreator ||
    ["SUPER-ADMIN", "ADMIN", "REVIEWER"].includes(currentUser.role);
  const canUpdateStatus =
    !isCreator &&
    ((userRole === "REVIEWER" && requestStatus === "pending" && isReviewer) ||
      (isAdmin && requestStatus === "reviewed" && isApprover));

  const canAddComments =
    isCreator ||
    isReviewer ||
    isApprover ||
    isCopiedTo ||
    isAdmin ||
    (userRole === "REVIEWER" && requestStatus === "pending");

  const showAdminApproval =
    !report?.approvedBy &&
    requestStatus === "reviewed" &&
    (isCreator ||
      (isReviewer && !report?.reviewedBy) ||
      (isApprover && !report?.approvedBy));

  const reportCreatedAt = report?.createdAt ?? "";

  const tableHeadData = [
    { label: "Report By", showOnMobile: true, minWidth: "160px" },
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
      id: "reportby",
      content: `${report?.createdBy?.first_name} ${report?.createdBy?.last_name}`,
      showOnMobile: true,
      minWidth: "160px",
      mobileLabel: "Report By",
    },
    {
      id: "status",
      content: <StatusBadge status={report?.status!} />,
      showOnMobile: true,
      showOnTablet: true,
    },
    {
      id: "date",
      content: formatToDDMMYYYY(report?.createdAt!),
      showOnMobile: false,
      showOnTablet: true,
    },
    {
      id: "action",
      content: (
        <ActionIcons
          copyTo={copyTo}
          isCopying={isCopying}
          canShareRequest={canShareRequest}
          requestId={report?.id}
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

  const comments = (report?.comments || []) as Comment[];

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Report</TextHeader>
          <Button onClick={() => navigate("/reporting")}>
            <List className="h-4 w-4 mr-1 md:mr-2" />
            List
          </Button>
        </div>
      </div>

      <div>
        <DataStateContainer
          isLoading={isLoading}
          isError={isError}
          data={report}
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
                          text-left font-medium uppercase tracking-wider
                          ${!header.showOnMobile ? "hidden md:table-cell" : ""}
                          ${
                            header.showOnTablet
                              ? "hidden sm:table-cell md:table-cell"
                              : ""
                          }
                          text-xs md:text-sm whitespace-nowrap
                        `}
                        style={{ minWidth: header.minWidth }}
                      >
                        {header.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  <TableRowMain
                    key={report?.id}
                    requestId={report?.id || ""}
                    toggleViewItems={() => {}}
                    className="hidden sm:table-row"
                  >
                    {tableRowData.map(
                      ({ id, content, showOnMobile, showOnTablet }) => (
                        <TableData
                          key={`${report?.id}-${id}`}
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

                  {/* Mobile Card */}
                  <tr key={`${report?.id}-mobile`} className="sm:hidden">
                    <td
                      colSpan={tableHeadData.length}
                      className="p-4 border-b border-gray-200"
                    >
                      <RequestCard
                        request={report as any}
                        totalAmount={0}
                        requestId={report?.id || ""}
                        identifier={report?.reportNumber}
                        dateValue={reportCreatedAt}
                        actionIconsProps={{
                          copyTo,
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
                        request={report as any}
                        requestStatus={report?.status || ""}
                        canUploadFiles={canUploadFiles}
                        selectedFiles={selectedFiles}
                        setSelectedFiles={setSelectedFiles}
                        isUploading={isUpdating}
                        handleUpload={handleSend}
                        canUpdateStatus={canUpdateStatus}
                        status={status}
                        setStatus={setStatus}
                        comment={comment}
                        setComment={setComment}
                        isUpdatingStatus={isUpdatingStatus}
                        handleStatusChange={onStatusChangeHandler}
                        comments={comments}
                        canAddComments={canAddComments}
                        handleAddComment={handleAddComment}
                        handleUpdateComment={handleUpdateComment}
                        handleDeleteComment={handleDeleteComment}
                        isAddingComment={isAddingComment}
                        isUpdatingComment={isUpdatingComment}
                        isDeletingComment={isDeletingComment}
                        showAdminApproval={showAdminApproval}
                        formData={formData}
                        handleFormChange={handleFormChange}
                        admins={admins}
                        isLoadingAmins={isLoadingAmins}
                      >
                        <div ref={pdfContentRef}>
                          <ReportDetails report={report!} />
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

export default Report;
