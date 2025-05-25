import { List } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import { RootState } from "../../store/store";
import { localStorageUser } from "../../utils/localStorageUser";
import { useAdmins } from "../user/Hooks/useAdmins";
import { useUpdateStatus } from "./Hooks/useUpdateStatus";
import { useUpdateTravelRequest } from "./Hooks/useUpdateTravelRequest";

import { dateformat } from "../../utils/dateFormat";
import { moneyFormat } from "../../utils/moneyFormat";
import TravelRequestDetails from "./TravelRequestDetails";
import StatusBadge from "../../ui/StatusBadge";
import StatusUpdateForm from "../../ui/StatusUpdateForm";
import AdminApprovalSection from "../../ui/AdminApprovalSection";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import TextHeader from "../../ui/TextHeader";
import Button from "../../ui/Button";
import { FileUpload } from "../../ui/FileUpload";
import SpinnerMini from "../../ui/SpinnerMini";
import { useStatusUpdate } from "../../hooks/useStatusUpdate";

const TravelRequest = () => {
  const currentUser = localStorageUser();
  const travelRequest = useSelector(
    (state: RootState) => state.travelRequest.travelRequest
  );
  const navigate = useNavigate();
  const { requestId } = useParams();

  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");
  const [formData, setFormData] = useState({ approvedBy: null });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Custom hooks
  const { handleStatusChange } = useStatusUpdate();

  const { updateStatus, isPending: isUpdatingStatus } = useUpdateStatus(
    requestId!
  );
  const { updateTravelRequest, isPending: isUpdating } = useUpdateTravelRequest(
    requestId!
  );
  const { data: adminsData, isLoading: isLoadingAmins } = useAdmins();
  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);

  // Redirect if no travel request or params
  useEffect(() => {
    if (!requestId || !travelRequest) {
      navigate("/travel-requests");
    }
  }, [travelRequest, requestId, navigate]);

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    updateTravelRequest({ data: formData, files: selectedFiles });
  };

  if (!travelRequest) {
    return (
      <div className="p-4 text-center">No travel request data available.</div>
    );
  }

  // User references
  const currentUserId = currentUser.id;
  const userRole = currentUser.role;
  const requestStatus = travelRequest.status;

  // Permission flags with explicit null checks
  const isCreator = travelRequest.createdBy?.id === currentUserId;
  const isReviewer = travelRequest.reviewedBy?.id === currentUserId;
  const isApprover = travelRequest.approvedBy?.id === currentUserId;
  const isAdmin = ["SUPER-ADMIN", "ADMIN"].includes(userRole);

  // Conditional rendering flags
  const canUploadFiles = isCreator && requestStatus === "approved";
  const canUpdateStatus =
    !isCreator &&
    ((userRole === "REVIEWER" && requestStatus === "pending" && isReviewer) ||
      (isAdmin && requestStatus === "reviewed" && isApprover));

  const showAdminApproval =
    !travelRequest.approvedBy &&
    requestStatus === "reviewed" &&
    (isCreator ||
      (isReviewer && !travelRequest.reviewedBy) ||
      (isApprover && !travelRequest.approvedBy));

  // Table data
  const tableHeadData = ["Request", "Status", "Budget", "Date"];
  const tableRowData = [
    travelRequest.staffName,
    <StatusBadge status={requestStatus!} key="status-badge" />,
    moneyFormat(travelRequest.budget, "NGN"),
    dateformat(travelRequest.createdAt!),
  ];

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Travel Request</TextHeader>
          <Button onClick={() => navigate(-1)}>
            <List className="h-4 w-4 mr-1 md:mr-2" />
            List
          </Button>
        </div>
      </div>

      <div className="w-full bg-inherit shadow-sm rounded-lg border pb-[200px] overflow-x-scroll">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {tableHeadData.map((title, index) => (
                <th
                  key={index}
                  className="px-3 py-2.5 md:px-6 md:py-3 text-left font-medium   uppercase text-xs 2xl:text-text-sm tracking-wider"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            <tr key={travelRequest.id} className="h-[40px] max-h-[40px]">
              {tableRowData.map((data, index) => (
                <td
                  key={index}
                  className="min-w-[150px] px-3 py-2.5 md:px-6 md:py-3 text-left font-medium   uppercase text-sm 2xl:text-text-base tracking-wider"
                >
                  {data}
                </td>
              ))}
            </tr>

            <tr>
              <td colSpan={5}>
                <div className="border border-gray-300 px-3 py-2.5 md:px-6 md:py-3 rounded-md h-auto relative">
                  <TravelRequestDetails request={travelRequest} />

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

                  {travelRequest.reviewedBy && requestStatus !== "draft" && (
                    <div className="  mt-4 tracking-wide">
                      <RequestCommentsAndActions request={travelRequest} />

                      {canUpdateStatus && (
                        <StatusUpdateForm
                          requestStatus={requestStatus}
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
      </div>
    </div>
  );
};
export default TravelRequest;
