import { List } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { RootState } from "../../store/store";
import { useEffect, useMemo, useState } from "react";
import { dateformat } from "../../utils/dateFormat";
import { moneyFormat } from "../../utils/moneyFormat";
import { useUpdateStatus } from "./Hooks/useUpdateStatus";
import Swal from "sweetalert2";
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

const PurchaseRequest = () => {
  const localStorageUserX = localStorageUser();
  const purchaseRequest = useSelector(
    (state: RootState) => state.purchaseRequest.purchaseRequest
  );

  const navigate = useNavigate();
  const param = useParams();

  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");
  const [formData, setFormData] = useState({ approvedBy: null });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Custom hooks for updating status and purchase request
  const { updateStatus, isPending: isUpdatingStatus } = useUpdateStatus(
    param.requestId!
  );
  const { updatePurchaseRequest, isPending: isUpdating } =
    useUpdatePurChaseRequest(param.requestId!);

  // Fetch admins data
  const { data: adminsData, isLoading: isLoadingAmins } = useAdmins();
  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);

  // Fetch purchase request from Redux store

  // Redirect if no purchase request or params are available
  useEffect(() => {
    if (!param || !purchaseRequest) {
      navigate("/purchase-requests");
    }
  }, [purchaseRequest, param, navigate]);

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!param) {
      navigate("/purchase-requests");
    }
  }, [param, navigate]);

  // Stabilized handleStatusChange
  const handleStatusChange = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to change this request status?",
      showCancelButton: true,
      confirmButtonColor: "#1373B0",
      cancelButtonColor: "#DC3340",
      confirmButtonText: "Yes, update it!",
      customClass: { popup: "custom-style" },
    }).then((result) => {
      if (result.isConfirmed) {
        updateStatus(
          { status, comment },
          {
            onError: (error) => {
              Swal.fire("Error!", error.message, "error");
            },
          }
        );
      }
    });
  };

  // Handle form submission
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    updatePurchaseRequest({ data: formData, files: selectedFiles });
  };

  // Handle the case where purchaseRequest is null
  if (!purchaseRequest) {
    return <div>No purchase request data available.</div>;
  }

  const totalAmount =
    purchaseRequest.itemGroups?.reduce((sum, item) => sum + item.total, 0) || 0;

  const isCreator = purchaseRequest!.createdBy!.id === localStorageUserX.id;
  const isReviewer = purchaseRequest!.reviewedBy?.id === localStorageUserX.id;
  const isApprover = purchaseRequest!.approvedBy?.id === localStorageUserX.id;

  const isAllowed =
    isCreator ||
    (isReviewer && !purchaseRequest.reviewedBy) ||
    (isApprover && !purchaseRequest.approvedBy);

  const isFile = selectedFiles.length > 0;

  // const isReviewerUpdatingPending =
  //   localStorageUserX.role === "REVIEWER" &&
  //   purchaseRequest.status === "pending";

  // const isAdminUpdatingReviewed =
  //   ["SUPER-ADMIN", "ADMIN"].includes(localStorageUserX.role) &&
  //   purchaseRequest.status === "reviewed";

  const isReviewerUpdatingPending =
    localStorageUserX.role === "REVIEWER" &&
    purchaseRequest.status === "pending" &&
    isReviewer;

  const isAdminUpdatingReviewed =
    ["SUPER-ADMIN", "ADMIN"].includes(localStorageUserX.role) &&
    purchaseRequest.status === "reviewed" &&
    isApprover;

  const showStatusUpdate =
    !isCreator && (isReviewerUpdatingPending || isAdminUpdatingReviewed);

  const tableHeadData = ["Request", "Status", "Department", "Amount", "Date"];

  const tableRowData = [
    purchaseRequest?.requestedBy,
    <StatusBadge status={purchaseRequest?.status!} />,
    purchaseRequest?.department,
    moneyFormat(totalAmount, "NGN"),
    dateformat(purchaseRequest?.createdAt!),
  ];

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          {" "}
          <TextHeader>Purchase Request</TextHeader>
          <Button
            onClick={() => navigate(-1)} // Use relative path here
          >
            <List className="h-4 w-4 mr-1 md:mr-2" />
            List
          </Button>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="w-full bg-inherit shadow-sm rounded-lg  border pb-[200px] overflow-x-scroll">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 ">
            <tr>
              {tableHeadData.map((title, index) => (
                <th
                  key={index}
                  className="px-3 py-2.5 md:px-6 md:py-3 text-left  font-medium text-gray-600 uppercase text-xs 2xl:text-text-sm tracking-wider overflow-x-scroll"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            <>
              {/* Purchase Request Details Row */}
              <tr key={purchaseRequest.id} className="h-[40px] max-h-[40px] ">
                {tableRowData.map((data, index) => (
                  <td
                    key={index}
                    className="min-w-[150px] px-3 py-2.5 md:px-6 md:py-3 text-left  font-medium text-gray-600 uppercase text-sm 2xl:text-text-base tracking-wider"
                  >
                    {data}
                  </td>
                ))}
              </tr>

              {/* Item Table Section */}
              <tr>
                <td colSpan={5}>
                  <div className="border border-gray-300 px-3 py-2.5 md:px-6 md:py-3 rounded-md h-auto relative">
                    <PurchaseRequestDetails request={purchaseRequest} />

                    {isCreator && purchaseRequest.status === "approved" && (
                      <div className="flex flex-col gap-3 mt-3">
                        <FileUpload
                          selectedFiles={selectedFiles}
                          setSelectedFiles={setSelectedFiles}
                          accept=".jpg,.png,.pdf,.xlsx,.docx"
                          multiple={true}
                        />

                        {isFile && (
                          <div className="self-center">
                            <Button disabled={isUpdating} onClick={handleSend}>
                              {isUpdating ? <SpinnerMini /> : "Upload"}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Comments and Actions Section */}

                    {purchaseRequest?.reviewedBy &&
                      purchaseRequest.status !== "draft" && (
                        <div className="text-gray-600 mt-4 tracking-wide">
                          <RequestCommentsAndActions
                            request={purchaseRequest}
                          />

                          {showStatusUpdate && (
                            <StatusUpdateForm
                              requestStatus={purchaseRequest.status!}
                              status={status}
                              setStatus={setStatus}
                              comment={comment}
                              setComment={setComment}
                              isUpdatingStatus={isUpdatingStatus}
                              handleStatusChange={handleStatusChange}
                            />
                          )}

                          {/* <Button onClick={handleStatusChange}>TEST</Button> */}
                        </div>
                      )}

                    {/* Admin Approval Section (for STAFF role) */}
                    {!purchaseRequest.approvedBy && // Check if approvedBy is not set
                      purchaseRequest.status === "reviewed" &&
                      isAllowed && (
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
  );
};

export default PurchaseRequest;
