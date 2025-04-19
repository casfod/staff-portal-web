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
    updatePurchaseRequest(formData);
  };

  // Handle the case where purchaseRequest is null
  if (!purchaseRequest) {
    return <div>No purchase request data available.</div>;
  }

  const totalAmount =
    purchaseRequest.itemGroups?.reduce((sum, item) => sum + item.total, 0) || 0;
  const showStatusUpdate =
    (localStorageUserX.role === "REVIEWER" &&
      purchaseRequest.status === "pending") ||
    (["SUPER-ADMIN", "ADMIN"].includes(localStorageUserX.role) &&
      purchaseRequest.status === "reviewed");

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

      {/* Main Table Section */}
      <div className="w-full bg-inherit shadow-sm rounded-lg overflow-hidden border pb-[200px]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-2 text-left font-medium text-gray-600 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-2 text-left font-medium text-gray-600 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-2 text-left font-medium text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-2 text-left font-medium text-gray-600 uppercase tracking-wider">
                Requested By
              </th>
              <th className="px-6 py-2 text-left font-medium text-gray-600 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <>
              {/* Purchase Request Details Row */}
              <tr key={purchaseRequest.id} className="h-[40px] max-h-[40px]">
                <td className="px-6 py-2 whitespace-nowrap font-medium text-gray-700 uppercase">
                  {purchaseRequest.department}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-gray-600">
                  {moneyFormat(totalAmount, "NGN")}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-gray-600 uppercase">
                  <StatusBadge status={purchaseRequest.status!} />
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-gray-600 uppercase">
                  {purchaseRequest.requestedBy}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-gray-600 uppercase">
                  {dateformat(purchaseRequest.createdAt!)}
                </td>
              </tr>

              {/* Item Table Section */}
              <tr>
                <td colSpan={5}>
                  <div className="border border-gray-300 px-6 py-4 rounded-md h-auto relative">
                    <PurchaseRequestDetails request={purchaseRequest} />

                    {/* Comments and Actions Section */}
                    {purchaseRequest?.reviewedBy &&
                      purchaseRequest.status !== "draft" && (
                        <div className="text-gray-700 mt-4 tracking-wide">
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
                        </div>
                      )}

                    {/* Admin Approval Section (for STAFF role) */}
                    {!purchaseRequest.approvedBy && // Check if approvedBy is not set
                      localStorageUserX.role === "STAFF" &&
                      purchaseRequest.status === "reviewed" && (
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

export default PurchaseRequest;
