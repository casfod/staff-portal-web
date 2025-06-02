import { List } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

import { RootState } from "../../store/store";
import { localStorageUser } from "../../utils/localStorageUser";
import { useAdmins } from "../user/Hooks/useAdmins";
import { useUpdateStatus } from "./Hooks/useUpdateStatus";
import { useUpdateExpenseClaim } from "./Hooks/useUpdateExpenseClaim";

import { dateformat } from "../../utils/dateFormat";
import { moneyFormat } from "../../utils/moneyFormat";
import ExpenseClaimDetails from "./ExpenseClaimDetails";
import StatusBadge from "../../ui/StatusBadge";
import StatusUpdateForm from "../../ui/StatusUpdateForm";
import AdminApprovalSection from "../../ui/AdminApprovalSection";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import TextHeader from "../../ui/TextHeader";
import Button from "../../ui/Button";
import { FileUpload } from "../../ui/FileUpload";
import SpinnerMini from "../../ui/SpinnerMini";
import { useStatusUpdate } from "../../hooks/useStatusUpdate";
import { useExpenseClaim } from "./Hooks/useExpenseClaim";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import Spinner from "../../ui/Spinner";
import { DataStateContainer } from "../../ui/DataStateContainer";
import { ExpenseClaimType } from "../../interfaces";

interface ExpenseClaimContentProps {
  requestData: ExpenseClaimType;
  status: string;
  comment: string;
  formData: { approvedBy: null | string };
  selectedFiles: File[];
  onStatusChange: () => void;
  onFormChange: (field: string, value: string) => void;
  onFileUpload: (e: React.FormEvent) => void;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  setComment: React.Dispatch<React.SetStateAction<string>>;
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  isCreator: boolean;
  isAdmin: boolean;
  userRole: string;
  currentUserId: string;
  isUpdating: boolean;
  isUpdatingStatus: boolean;
  isLoadingAmins: boolean;
  admins: any[]; // Replace with your Admin type
}

const ExpenseClaim2 = () => {
  // Initialization
  const currentUser = localStorageUser();
  const navigate = useNavigate();
  const { requestId } = useParams();

  // Data fetching
  const { data: remoteData, isLoading, isError } = useExpenseClaim(requestId!);
  const expenseClaim = useSelector(
    (state: RootState) => state.expenseClaim.expenseClaim
  );

  // Memoized data
  const requestData = useMemo(
    () => remoteData?.data || expenseClaim,
    [remoteData, expenseClaim]
  );

  // Redirect logic
  useEffect(() => {
    if (!requestId || (!isLoading && !requestData)) {
      navigate("/expense-claims");
    }
  }, [requestData, requestId, navigate, isLoading]);

  // State management
  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");
  const [formData, setFormData] = useState({ approvedBy: null });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Custom hooks
  const { handleStatusChange } = useStatusUpdate();
  const { updateStatus, isPending: isUpdatingStatus } = useUpdateStatus(
    requestId!
  );
  const { updateExpenseClaim, isPending: isUpdating } = useUpdateExpenseClaim(
    requestId!
  );
  const { data: adminsData, isLoading: isLoadingAmins } = useAdmins();
  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);

  // Memoized callbacks
  const handleFormChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const onStatusChangeHandler = useCallback(() => {
    handleStatusChange(status, comment, async (data) => {
      try {
        await updateStatus(data);
      } catch (error) {
        throw error;
      }
    });
  }, [status, comment, handleStatusChange, updateStatus]);

  const handleSend = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      updateExpenseClaim({ data: formData, files: selectedFiles });
    },
    [formData, selectedFiles, updateExpenseClaim]
  );

  // Derived values
  const { id: currentUserId, role: userRole } = currentUser;
  const requestStatus = requestData?.status;
  const isCreator = requestData?.createdBy?.id === currentUserId;
  const isReviewer = requestData?.reviewedBy?.id === currentUserId;
  const isApprover = requestData?.approvedBy?.id === currentUserId;
  const isAdmin = ["SUPER-ADMIN", "ADMIN"].includes(userRole);

  // Memoized header component
  const headerSection = useMemo(
    () => (
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Expense Claim</TextHeader>
          <Button onClick={() => navigate("/expense-claims")}>
            <List className="h-4 w-4 mr-1 md:mr-2" />
            List
          </Button>
        </div>
      </div>
    ),
    [navigate]
  );

  return (
    <div className="flex flex-col space-y-3 pb-80">
      {headerSection}

      <DataStateContainer
        isLoading={isLoading}
        isError={isError}
        data={requestData}
        errorComponent={<NetworkErrorUI />}
        loadingComponent={<Spinner />}
        emptyComponent={<div>No expense claim data available</div>}
      >
        <ExpenseClaimContent
          requestData={requestData!}
          status={status}
          comment={comment}
          formData={formData}
          selectedFiles={selectedFiles}
          onStatusChange={onStatusChangeHandler}
          onFormChange={handleFormChange}
          onFileUpload={handleSend}
          setStatus={setStatus}
          setComment={setComment}
          setSelectedFiles={setSelectedFiles}
          isCreator={isCreator}
          isAdmin={isAdmin}
          userRole={userRole}
          currentUserId={currentUserId}
          isUpdating={isUpdating}
          isUpdatingStatus={isUpdatingStatus}
          isLoadingAmins={isLoadingAmins}
          admins={admins}
          isReviewer={isReviewer}
          isApprover={isApprover}
          requestStatus={requestStatus}
        />
      </DataStateContainer>
    </div>
  );
};

// ExpenseClaimContent Component
const ExpenseClaimContent = memo(
  ({
    requestData,
    status,
    comment,
    formData,
    selectedFiles,
    onStatusChange,
    onFormChange,
    onFileUpload,
    setStatus,
    setComment,
    setSelectedFiles,
    isCreator,
    isAdmin,
    userRole,
    // currentUserId,
    isUpdating,
    isUpdatingStatus,
    isLoadingAmins,
    admins,
    isReviewer,
    isApprover,
    requestStatus,
  }: ExpenseClaimContentProps & {
    isReviewer: boolean;
    isApprover: boolean;
    requestStatus?: string;
  }) => {
    // Table data
    const tableHeadData = useMemo(
      () => ["Request", "Status", "Budget", "Date"],
      []
    );
    const tableRowData = useMemo(
      () => [
        requestData?.staffName,
        <StatusBadge status={requestStatus!} key="status-badge" />,
        moneyFormat(requestData?.budget!, "NGN"),
        dateformat(requestData?.createdAt!),
      ],
      [requestData, requestStatus]
    );

    // Permission flags
    const canUploadFiles = isCreator && requestStatus === "approved";
    const canUpdateStatus =
      !isCreator &&
      ((userRole === "REVIEWER" && requestStatus === "pending" && isReviewer) ||
        (isAdmin && requestStatus === "reviewed" && isApprover));

    const showAdminApproval =
      !requestData?.approvedBy &&
      requestStatus === "reviewed" &&
      (isCreator ||
        (isReviewer && !requestData?.reviewedBy) ||
        (isApprover && !requestData?.approvedBy));

    return (
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
          <tr key={requestData?.id} className="h-[40px] max-h-[40px]">
            {tableRowData.map((data, index) => (
              <td
                key={index}
                className="min-w-[150px] px-3 py-2.5 md:px-6 md:py-3 text-left font-medium uppercase text-sm 2xl:text-text-base tracking-wider"
              >
                {data}
              </td>
            ))}
          </tr>

          <tr>
            <td colSpan={5}>
              <div className="border border-gray-300 px-3 py-2.5 md:px-6 md:py-3 rounded-md h-auto relative">
                <ExpenseClaimDetails request={requestData} />

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
                        <Button disabled={isUpdating} onClick={onFileUpload}>
                          {isUpdating ? <SpinnerMini /> : "Upload"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {requestData?.reviewedBy && requestStatus !== "draft" && (
                  <div className="mt-4 tracking-wide">
                    <RequestCommentsAndActions request={requestData} />

                    {canUpdateStatus && (
                      <StatusUpdateForm
                        requestStatus={requestStatus}
                        status={status}
                        setStatus={setStatus}
                        comment={comment}
                        setComment={setComment}
                        isUpdatingStatus={isUpdatingStatus}
                        handleStatusChange={onStatusChange}
                      />
                    )}
                  </div>
                )}

                {showAdminApproval && (
                  <div className="relative z-10 pb-64">
                    <AdminApprovalSection
                      formData={formData}
                      handleFormChange={onFormChange}
                      admins={admins}
                      isLoadingAmins={isLoadingAmins}
                      isUpdating={isUpdating}
                      handleSend={onFileUpload}
                    />
                  </div>
                )}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
);

export default ExpenseClaim2;
