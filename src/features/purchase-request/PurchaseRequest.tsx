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
import { useUpdatePurChaseRequest } from "./Hooks/useUpdatePurChaseRequest";
import { PurchaseRequestDetails } from "./PurchaseRequestDetails";
import StatusBadge from "../../ui/StatusBadge";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import StatusUpdateForm from "../../ui/StatusUpdateForm";
import AdminApprovalSection from "../../ui/AdminApprovalSection";
import Button from "../../ui/Button";
import TextHeader from "../../ui/TextHeader";
import { FileUpload } from "../../ui/FileUpload";
import SpinnerMini from "../../ui/SpinnerMini";
import { useStatusUpdate } from "../../hooks/useStatusUpdate";

const PurchaseRequest = () => {
  const currentUser = localStorageUser();
  const purchaseRequest = useSelector(
    (state: RootState) => state.purchaseRequest.purchaseRequest
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
  const { updatePurchaseRequest, isPending: isUpdating } =
    useUpdatePurChaseRequest(requestId!);

  // Fetch admins data
  const { data: adminsData, isLoading: isLoadingAmins } = useAdmins();
  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);

  // Redirect if no purchase request or params
  useEffect(() => {
    if (!requestId || !purchaseRequest) {
      navigate("/purchase-requests");
    }
  }, [purchaseRequest, requestId, navigate]);

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
    updatePurchaseRequest({ data: formData, files: selectedFiles });
  };

  if (!purchaseRequest) {
    return <div>No purchase request data available.</div>;
  }

  // Calculate total amount once
  const totalAmount =
    purchaseRequest.itemGroups?.reduce((sum, item) => sum + item.total, 0) || 0;

  // User role checks
  const currentUserId = currentUser.id;
  const userRole = currentUser.role;
  const requestStatus = purchaseRequest.status;

  // Permission flags
  const isCreator = purchaseRequest.createdBy?.id === currentUserId;
  const isReviewer = purchaseRequest.reviewedBy?.id === currentUserId;
  const isApprover = purchaseRequest.approvedBy?.id === currentUserId;
  const isAdmin = ["SUPER-ADMIN", "ADMIN"].includes(userRole);

  // Conditional rendering flags
  const canUploadFiles = isCreator && requestStatus === "approved";
  const canUpdateStatus =
    !isCreator &&
    ((userRole === "REVIEWER" && requestStatus === "pending" && isReviewer) ||
      (isAdmin && requestStatus === "reviewed" && isApprover));

  const showAdminApproval =
    !purchaseRequest.approvedBy &&
    requestStatus === "reviewed" &&
    (isCreator ||
      (isReviewer && !purchaseRequest.reviewedBy) ||
      (isApprover && !purchaseRequest.approvedBy));

  // Table data
  const tableHeadData = ["Request", "Status", "Department", "Amount", "Date"];
  const tableRowData = [
    purchaseRequest.requestedBy,
    <StatusBadge status={requestStatus!} key="status-badge" />,
    purchaseRequest.department,
    moneyFormat(totalAmount, "NGN"),
    dateformat(purchaseRequest.createdAt!),
  ];

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Purchase Request</TextHeader>
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
            <tr key={purchaseRequest.id} className="h-[40px] max-h-[40px]">
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
                  <PurchaseRequestDetails request={purchaseRequest} />

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

                  {purchaseRequest.reviewedBy && requestStatus !== "draft" && (
                    <div className="  mt-4 tracking-wide">
                      <RequestCommentsAndActions request={purchaseRequest} />

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

export default PurchaseRequest;
