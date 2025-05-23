import { List } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import Swal from "sweetalert2";

import { RootState } from "../../store/store";
import { localStorageUser } from "../../utils/localStorageUser";
import { useAdmins } from "../user/Hooks/useAdmins";
import { useUpdateStatus } from "./Hooks/useUpdateStatus";
import { useUpdatePaymentRequest } from "./Hooks/useUpdatePaymentRequest";

import { dateformat } from "../../utils/dateFormat";
import { moneyFormat } from "../../utils/moneyFormat";
import PaymentRequestDetails from "./PaymentRequestDetails";
import StatusBadge from "../../ui/StatusBadge";
import AdminApprovalSection from "../../ui/AdminApprovalSection";
import StatusUpdateForm from "../../ui/StatusUpdateForm";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import Button from "../../ui/Button";
import TextHeader from "../../ui/TextHeader";
import { FileUpload } from "../../ui/FileUpload";
import SpinnerMini from "../../ui/SpinnerMini";

const PaymentRequest = () => {
  const localStorageUserX = localStorageUser();
  const paymentRequest = useSelector(
    (state: RootState) => state.paymentRequest.paymentRequest
  );

  const navigate = useNavigate();
  const param = useParams();

  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");
  const [formData, setFormData] = useState({ approvedBy: null });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Access the paymentRequest state from Redux

  // Custom hooks for updating status and payment request
  const { updateStatus, isPending: isUpdatingStatus } = useUpdateStatus(
    param.requestId!
  );
  const { updatePaymentRequest, isPending: isUpdating } =
    useUpdatePaymentRequest(param.requestId!);

  // Fetch admins data
  const { data: adminsData, isLoading: isLoadingAmins } = useAdmins();
  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);

  useEffect(() => {
    if (!param || !paymentRequest) {
      navigate("/payment-requests");
    }
  }, [paymentRequest, param, navigate]);

  // Handle form field changes

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    console.log(formData.approvedBy);
  };

  // Handle status change with confirmation dialog
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

    updatePaymentRequest({ data: formData, files: selectedFiles });
    console.log("send:", formData.approvedBy);
  };

  // Handle the case where paymentRequest is null
  if (!paymentRequest) {
    return <div>No payment request data available.</div>;
  }

  const isCreator = paymentRequest!.requestedBy!.id === localStorageUserX.id;
  const isReviewer = paymentRequest!.reviewedBy?.id === localStorageUserX.id;
  const isApprover = paymentRequest!.approvedBy?.id === localStorageUserX.id;

  const isAllowed =
    isCreator ||
    (isReviewer && !paymentRequest.reviewedBy) ||
    (isApprover && !paymentRequest.approvedBy);

  const isFile = selectedFiles.length > 0;

  const isReviewerUpdatingPending =
    localStorageUserX.role === "REVIEWER" &&
    paymentRequest.status === "pending" &&
    isReviewer;

  const isAdminUpdatingReviewed =
    ["SUPER-ADMIN", "ADMIN"].includes(localStorageUserX.role) &&
    paymentRequest.status === "reviewed" &&
    isApprover;

  // const isReviewerUpdatingPending =
  //   localStorageUserX.role === "REVIEWER" &&
  //   paymentRequest.status === "pending";

  // const isAdminUpdatingReviewed =
  //   ["SUPER-ADMIN", "ADMIN"].includes(localStorageUserX.role) &&
  //   paymentRequest.status === "reviewed";

  const showStatusUpdate =
    !isCreator && (isReviewerUpdatingPending || isAdminUpdatingReviewed);

  const tableHeadData = ["Request", "Status", "Budget", "Date"];

  const tableRowData = [
    `${paymentRequest?.requestedBy?.first_name} ${paymentRequest?.requestedBy?.last_name}`,
    <StatusBadge status={paymentRequest?.status!} key="status-badge" />,

    moneyFormat(paymentRequest?.amountInFigure!, "NGN"),
    dateformat(paymentRequest?.createdAt!),
  ];

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Payment Request</TextHeader>

          <Button
            onClick={() => navigate(-1)} // Use relative path here
          >
            <List className="h-4 w-4 mr-1 md:mr-2" />
            List
          </Button>
        </div>
      </div>

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
              <tr key={paymentRequest.id} className="h-[40px] max-h-[40px] ">
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
                    <PaymentRequestDetails request={paymentRequest} />

                    {isCreator && paymentRequest.status === "approved" && (
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
                    {paymentRequest?.reviewedBy &&
                      paymentRequest.status !== "draft" && (
                        <div className="text-gray-600 mt-4 tracking-wide">
                          <RequestCommentsAndActions request={paymentRequest} />

                          {showStatusUpdate && (
                            <StatusUpdateForm
                              requestStatus={paymentRequest.status!}
                              status={status}
                              setStatus={setStatus}
                              comment={comment}
                              setComment={setComment}
                              isUpdatingStatus={isUpdatingStatus}
                              handleStatusChange={handleStatusChange}
                            />
                          )}
                        </div>
                      )}

                    {/* Admin Approval Section (for STAFF role) */}
                    {!paymentRequest.approvedBy && // Check if approvedBy is not set
                      paymentRequest.status === "reviewed" &&
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

export default PaymentRequest;
