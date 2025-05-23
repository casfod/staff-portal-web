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
import TextHeader from "../../ui/TextHeader";
import Button from "../../ui/Button";
import { FileUpload } from "../../ui/FileUpload";
import SpinnerMini from "../../ui/SpinnerMini";

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

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
    updateTravelRequest({ data: formData, files: selectedFiles });
  };

  if (!travelRequest) {
    return (
      <div className="p-4 text-center">No travel request data available.</div>
    );
  }

  const isCreator = travelRequest!.createdBy!.id === localStorageUserX.id;
  const isReviewer = travelRequest!.reviewedBy?.id === localStorageUserX.id;
  const isApprover = travelRequest!.approvedBy?.id === localStorageUserX.id;

  const isAllowed = isCreator || isReviewer || isApprover;

  const isFile = selectedFiles.length > 0;

  const isReviewerUpdatingPending =
    localStorageUserX.role === "REVIEWER" &&
    travelRequest.status === "pending" &&
    isReviewer;

  const isAdminUpdatingReviewed =
    ["SUPER-ADMIN", "ADMIN"].includes(localStorageUserX.role) &&
    travelRequest.status === "reviewed" &&
    isApprover;

  const showStatusUpdate =
    !isCreator && (isReviewerUpdatingPending || isAdminUpdatingReviewed);

  const tableHeadData = ["Request", "Status", "Budget", "Date"];

  const tableRowData = [
    `${travelRequest?.staffName}`,
    <StatusBadge status={travelRequest?.status!} key="status-badge" />,
    moneyFormat(travelRequest?.budget!, "NGN"),
    dateformat(travelRequest?.createdAt!),
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
            <tr key={travelRequest.id} className="h-[40px] max-h-[40px] ">
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
                  <TravelRequestDetails request={travelRequest} />

                  {isCreator && travelRequest.status === "approved" && (
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

                  {travelRequest.reviewedBy &&
                    travelRequest.status !== "draft" && (
                      <div className="text-gray-600 mt-4 tracking-wide">
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
                    travelRequest.status === "reviewed" &&
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
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TravelRequest;
