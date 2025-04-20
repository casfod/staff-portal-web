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

import { useUpdateAdvanceRequest } from "./Hooks/useUpdateAdvanceRequest";

import { AdvanceRequestDetails } from "./AdvanceRequestDetails";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import AdminApprovalSection from "../../ui/AdminApprovalSection";
import StatusUpdateForm from "../../ui/StatusUpdateForm";
import StatusBadge from "../../ui/StatusBadge";

const Request = () => {
  // State and hooks initialization
  const localStorageUserX = localStorageUser();
  const advanceRequest = useSelector(
    (state: RootState) => state.advanceRequest.advanceRequest
  );

  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");
  const [formData, setFormData] = useState({ approvedBy: null });

  const navigate = useNavigate();
  const param = useParams();

  // Fetch purchase request from Redux store

  // Redirect if no purchase request or params are available
  useEffect(() => {
    if (!param || !advanceRequest) {
      navigate("/purchase-requests");
    }
  }, [advanceRequest, param, navigate]);

  // Custom hooks for updating status and purchase request
  const { updateStatus, isPending: isUpdatingStatus } = useUpdateStatus(
    param.requestId!
  );
  const { updateAdvanceRequest, isPending: isUpdating } =
    useUpdateAdvanceRequest(param.requestId!);

  // Fetch admins data
  const { data: adminsData, isLoading: isLoadingAmins } = useAdmins();
  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);

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
    updateAdvanceRequest(formData);
  };

  // Handle the case where advanceRequest is null
  if (!advanceRequest) {
    return <div>No purchase request data available.</div>;
  }

  const totalAmount =
    advanceRequest.itemGroups?.reduce((sum, item) => sum + item.total, 0) || 0;
  const showStatusUpdate =
    (localStorageUserX.role === "REVIEWER" &&
      advanceRequest.status === "pending") ||
    (["SUPER-ADMIN", "ADMIN"].includes(localStorageUserX.role) &&
      advanceRequest.status === "reviewed");

  return (
    <div className="flex flex-col items-center gap-6 pt-6 pb-80">
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
          List
        </button>
      </div>

      {/* Main Table Section */}
      <div className="w-full bg-inherit shadow-sm rounded-lg overflow-hidden border pb-[200px]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="min-w-[150px] px-3 py-2.5 md:px-6 md:py-3 text-left  font-medium text-gray-600 uppercase text-xs 2xl:text-text-sm tracking-wider">
                Department
              </th>
              <th className="min-w-[150px] px-3 py-2.5 md:px-6 md:py-3 text-left  font-medium text-gray-600 uppercase text-xs 2xl:text-text-sm tracking-wider">
                Amount
              </th>
              <th className="min-w-[150px] px-3 py-2.5 md:px-6 md:py-3 text-left  font-medium text-gray-600 uppercase text-xs 2xl:text-text-sm tracking-wider">
                Status
              </th>
              <th className="min-w-[150px] px-3 py-2.5 md:px-6 md:py-3 text-left  font-medium text-gray-600 uppercase text-xs 2xl:text-text-sm tracking-wider">
                Requested By
              </th>
              <th className="min-w-[150px] px-3 py-2.5 md:px-6 md:py-3 text-left  font-medium text-gray-600 uppercase text-xs 2xl:text-text-sm tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <>
              {/* Purchase Request Details Row */}
              <tr key={advanceRequest.id} className="h-[40px] max-h-[40px]">
                <td className="px-6 py-2 whitespace-nowrap font-medium text-gray-700 uppercase">
                  {advanceRequest.department}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-gray-600">
                  {moneyFormat(totalAmount, "NGN")}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-gray-600 uppercase">
                  <StatusBadge status={advanceRequest.status!} />
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-gray-600 uppercase">
                  {advanceRequest.requestedBy}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-gray-600 uppercase">
                  {dateformat(advanceRequest.createdAt!)}
                </td>
              </tr>

              {/* Items Table Section */}
              {/* Item Table Section */}
              <tr>
                <td colSpan={5}>
                  <div className="border border-gray-300 px-3 py-2.5 md:px-6 md:py-3 rounded-md h-auto relative">
                    <AdvanceRequestDetails request={advanceRequest} />

                    {/* Comments and Actions Section */}
                    {advanceRequest?.reviewedBy &&
                      advanceRequest.status !== "draft" && (
                        <div className="text-gray-700 mt-4 tracking-wide">
                          <RequestCommentsAndActions request={advanceRequest} />

                          {showStatusUpdate && (
                            <StatusUpdateForm
                              requestStatus={advanceRequest.status!}
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
                    {!advanceRequest.approvedBy && // Check if approvedBy is not set
                      localStorageUserX.role === "STAFF" &&
                      advanceRequest.status === "reviewed" && (
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

export default Request;
