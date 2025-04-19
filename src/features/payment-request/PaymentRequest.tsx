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
    updatePaymentRequest(formData);
  };

  // Handle the case where paymentRequest is null
  if (!paymentRequest) {
    return <div>No payment request data available.</div>;
  }

  const showStatusUpdate =
    (localStorageUserX.role === "REVIEWER" &&
      paymentRequest.status === "pending") ||
    (["SUPER-ADMIN", "ADMIN"].includes(localStorageUserX.role) &&
      paymentRequest.status === "reviewed");

  return (
    <div className="flex flex-col items-center gap-6 pb-80">
      {/* Header Section */}
      <div className="w-full flex justify-between items-center">
        <h1
          className=" md:text-lg lg:text-2xl font-semibold text-gray-700"
          style={{ fontFamily: "Lato", letterSpacing: "2px" }}
        >
          Review Request
        </h1>
        <button
          onClick={() => navigate(-1)} // Use relative path here
          className="inline-flex items-center px-4 py-2 border border-transparent font-medium rounded-md shadow-sm text-white bg-buttonColor hover:bg-buttonColorHover "
        >
          <List className="h-4 w-4 mr-1 md:mr-2" />
          All Requests
        </button>
      </div>

      <div className="w-full bg-inherit shadow-sm rounded-lg overflow-hidden border pb-[200px]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left  font-medium text-gray-600 uppercase text-xs 2xl:text-text-sm tracking-wider">
                Request
              </th>
              <th className="px-6 py-3 text-left  font-medium text-gray-600 uppercase text-xs 2xl:text-text-sm tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left  font-medium text-gray-600 uppercase text-xs 2xl:text-text-sm tracking-wider">
                Budget
              </th>
              <th className="px-6 py-3 text-left  font-medium text-gray-600 uppercase text-xs 2xl:text-text-sm tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <>
              <tr key={paymentRequest.id}>
                <td className="px-6 py-4 whitespace-nowrap  font-medium text-gray-700 uppercase">
                  {paymentRequest.requestBy}
                </td>
                <td className="px-6 py-4 whitespace-nowrap  text-gray-600">
                  <StatusBadge status={paymentRequest.status!} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap  text-gray-600">
                  {moneyFormat(paymentRequest.amountInFigure, "NGN")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap  text-gray-600 uppercase">
                  {dateformat(paymentRequest.createdAt!)}
                </td>
              </tr>

              {/* Item Table Section */}
              <tr>
                <td colSpan={5}>
                  <div className="border border-gray-300 px-6 py-4 rounded-md h-auto relative">
                    <PaymentRequestDetails request={paymentRequest} />

                    {/* Comments and Actions Section */}
                    {paymentRequest?.reviewedBy &&
                      paymentRequest.status !== "draft" && (
                        <div className="text-gray-700 mt-4 tracking-wide">
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
                      localStorageUserX.role === "STAFF" &&
                      paymentRequest.status === "reviewed" && (
                        <div className="relative z-10">
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
