import { List } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { RootState } from "../../store/store";
import { useEffect, useMemo, useState } from "react";
import { dateformat } from "../../utils/dateFormat";
import { moneyFormat } from "../../utils/moneyFormat";
import { useUpdateStatus } from "./Hooks/useUpdateStatus";
import { localStorageUser } from "../../utils/localStorageUser";
import { useAdmins } from "../user/Hooks/useAdmins";

import { useUpdateAdvanceRequest } from "./Hooks/useUpdateAdvanceRequest";

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
import { useAdvanceRequest } from "./Hooks/useAdvanceRequest";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import Spinner from "../../ui/Spinner";

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

  const requestData = useMemo(
    () => remoteData?.data || advanceRequest,
    [remoteData, advanceRequest]
  );

  // Redirect logic - PLACE IT HERE
  useEffect(() => {
    if (!requestId || (!isLoading && !requestData)) {
      navigate("/advance-requests");
    }
  }, [requestData, requestId, navigate, isLoading]);

  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");
  const [formData, setFormData] = useState({ approvedBy: null });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Custom hooks
  const { handleStatusChange } = useStatusUpdate();
  const { updateStatus, isPending: isUpdatingStatus } = useUpdateStatus(
    requestId!
  );
  const { updateAdvanceRequest, isPending: isUpdating } =
    useUpdateAdvanceRequest(requestId!);
  const { data: adminsData, isLoading: isLoadingAmins } = useAdmins();
  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);

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

  // Handle the case where advanceRequest is null
  if (isError) return <NetworkErrorUI />;
  if (!requestData) return <div>No purchase request data available.</div>;

  const totalAmount =
    requestData.itemGroups?.reduce((sum, item) => sum + item.total, 0) || 0;

  // User references
  const currentUserId = currentUser.id;
  const userRole = currentUser.role;
  const requestStatus = requestData.status;

  // Permission flags with explicit null checks
  const isCreator = requestData.createdBy?.id === currentUserId;
  const isReviewer = requestData.reviewedBy?.id === currentUserId;
  const isApprover = requestData.approvedBy?.id === currentUserId;
  const isAdmin = ["SUPER-ADMIN", "ADMIN"].includes(userRole);

  console.log("isCreator:=>", isCreator);

  // Conditional rendering flags
  const canUploadFiles = isCreator && requestStatus === "approved";
  const canUpdateStatus =
    !isCreator &&
    ((userRole === "REVIEWER" && requestStatus === "pending" && isReviewer) ||
      (isAdmin && requestStatus === "reviewed" && isApprover));

  const showAdminApproval =
    !requestData.approvedBy &&
    requestStatus === "reviewed" &&
    (isCreator ||
      (isReviewer && !requestData.reviewedBy) ||
      (isApprover && !requestData.approvedBy));

  // Table data
  // const tableHeadData = ["Request", "Status", "Department", "Amount", "Date"];
  const tableHeadData = ["Request", "Status", "Amount", "Date"];
  const tableRowData = [
    requestData?.requestedBy,
    <StatusBadge status={requestData?.status!} />,
    requestData?.department,
    moneyFormat(totalAmount, "NGN"),
    dateformat(requestData?.createdAt!),
  ];

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Advance Request</TextHeader>
          <Button
            onClick={() => navigate("/advance-requests")} // Use relative path here
          >
            <List className="h-4 w-4 mr-1 md:mr-2" />
            List
          </Button>
        </div>
      </div>

      {/* Main Table Section */}
      {isLoading ? (
        <div className="flex justify-center w-full h-full">
          <Spinner />
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border overflow-x-scroll">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {tableHeadData.map((title, index) => (
                  <th
                    key={index}
                    className="min-w-[150px] px-3 py-2.5 md:px-6 md:py-3 text-left  font-medium   uppercase text-xs 2xl:text-text-sm tracking-wider"
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              <>
                {/* Purchase Request Details Row */}
                <tr key={requestData?.id} className="h-[40px] max-h-[40px] ">
                  {tableRowData.map((data, index) => (
                    <td
                      key={index}
                      className="min-w-[150px] px-3 py-2.5 md:px-6 md:py-3 text-left  font-medium   uppercase text-sm 2xl:text-text-base tracking-wider"
                    >
                      {data}
                    </td>
                  ))}
                </tr>

                {/* Items Table Section */}
                <tr>
                  <td colSpan={5}>
                    <div className="border border-gray-300 px-3 py-2.5 md:px-6 md:py-3 rounded-md h-auto relative">
                      <AdvanceRequestDetails request={requestData} />

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
                      {requestData?.reviewedBy &&
                        requestData?.status !== "draft" && (
                          <div className="  mt-4 tracking-wide">
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
      )}
    </div>
  );
};

export default Request;
