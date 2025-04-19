import { List } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import Swal from "sweetalert2";

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

const TravelRequest = () => {
  const localStorageUserX = localStorageUser();
  const travelRequest = useSelector(
    (state: RootState) => state.travelRequest.travelRequest
  );
  const navigate = useNavigate();
  const param = useParams();

  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");
  const [formData, setFormData] = useState({ approvedBy: null });

  const { updateStatus, isPending: isUpdatingStatus } = useUpdateStatus(
    param.requestId!
  );
  const { updateTravelRequest, isPending: isUpdating } = useUpdateTravelRequest(
    param.requestId!
  );
  const { data: adminsData, isLoading: isLoadingAmins } = useAdmins();

  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);

  useEffect(() => {
    if (!param || !travelRequest) {
      navigate("/travel-requests");
    }
  }, [travelRequest, param, navigate]);

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    updateTravelRequest(formData);
  };

  if (!travelRequest) {
    return (
      <div className="p-4 text-center">No travel request data available.</div>
    );
  }

  const totalAmount =
    travelRequest.expenses?.reduce((sum, item) => sum + item.total, 0) || 0;
  const showStatusUpdate =
    (localStorageUserX.role === "REVIEWER" &&
      travelRequest.status === "pending") ||
    (["SUPER-ADMIN", "ADMIN"].includes(localStorageUserX.role) &&
      travelRequest.status === "reviewed");

  return (
    <div className="flex flex-col items-center gap-6 pb-80">
      <div className="w-full flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-700 tracking-wide">
          Travel Request
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center px-4 py-2 border border-transparent font-medium rounded-md shadow-sm text-white bg-buttonColor hover:bg-buttonColorHover"
        >
          <List className="h-4 w-4 mr-1 md:mr-2" />
          All Requests
        </button>
      </div>

      <div className="w-full bg-inherit shadow-sm rounded-lg overflow-hidden border pb-[200px]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-2 text-left font-medium text-gray-600 uppercase tracking-wider">
                Name
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
            <tr>
              <td className="px-6 py-2 whitespace-nowrap font-medium text-gray-700 uppercase">
                {travelRequest.staffName}
              </td>
              <td className="px-6 py-2 whitespace-nowrap text-gray-600">
                {moneyFormat(totalAmount, "NGN")}
              </td>
              <td className="px-6 py-2 whitespace-nowrap text-gray-600 uppercase">
                <StatusBadge status={travelRequest.status!} />
              </td>
              <td className="px-6 py-2 whitespace-nowrap text-gray-600 uppercase">
                {travelRequest.staffName}
              </td>
              <td className="px-6 py-2 whitespace-nowrap text-gray-600 uppercase">
                {dateformat(travelRequest.createdAt!)}
              </td>
            </tr>

            {/* Item Table Section */}
            <tr>
              <td colSpan={5}>
                <div className="border border-gray-300 px-6 py-4 rounded-md h-auto relative">
                  <TravelRequestDetails request={travelRequest} />

                  {travelRequest.reviewedBy &&
                    travelRequest.status !== "draft" && (
                      <div className="text-gray-700 mt-4 tracking-wide">
                        <RequestCommentsAndActions request={travelRequest} />

                        {showStatusUpdate && (
                          <StatusUpdateForm
                            requestStatus={travelRequest.status!}
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

                  {!travelRequest.approvedBy &&
                    localStorageUserX.role === "STAFF" &&
                    travelRequest.status === "reviewed" && (
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
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TravelRequest;
