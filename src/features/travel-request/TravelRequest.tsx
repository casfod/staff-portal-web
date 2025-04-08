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
import FormRow from "../../ui/FormRow";
import SpinnerMini from "../../ui/SpinnerMini";
import Select from "../../ui/Select";
import { AdvanceRequestType } from "../../interfaces";
import { useUpdateTravelRequest } from "./Hooks/useUpdateTravelRequest";
import Button from "../../ui/Button";
import { TravelRequestDetails } from "./TravelRequestDetails";

const TravelRequest = () => {
  // State and hooks initialization
  const localStorageUserX = localStorageUser();
  const travelRequest = useSelector(
    (state: RootState) => state.travelRequest.travelRequest
  );

  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");
  const [formData, setFormData] = useState<Partial<AdvanceRequestType>>({
    approvedBy: null,
  });

  const navigate = useNavigate();
  const param = useParams();

  // Fetch purchase request from Redux store

  // Redirect if no purchase request or params are available
  useEffect(() => {
    if (!param || !travelRequest) {
      navigate("/travel-requests");
    }
  }, [travelRequest, param]);

  // Custom hooks for updating status and purchase request
  const { updateStatus, isPending: isUpdatingStatus } = useUpdateStatus(
    param.requestId!
  );
  const { updateTravelRequest, isPending: isUpdating } = useUpdateTravelRequest(
    param.requestId!
  );

  // Fetch admins data
  const { data: adminsData, isLoading: isLoadingAmins } = useAdmins();
  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);

  // Handle form field changes
  const handleFormChange = (field: keyof AdvanceRequestType, value: string) => {
    setFormData({ ...formData, [field]: value });
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
      animation: false, // Disable animations
    }).then((result) => {
      if (result.isConfirmed) {
        updateStatus(
          { status: status, comment: comment },
          {
            onError: (error) => {
              Swal.fire({
                title: "Error!",
                text: error.message,
                icon: "error",
                animation: false, // Disable animations for error modal
              });
            },
          }
        );
      }
    });
  };

  // Handle form submission
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    const data = { ...formData };
    updateTravelRequest(data);
  };

  // Handle the case where purchaseRequest is null
  if (!travelRequest) {
    return <div>No purchase request data available.</div>;
  }

  return (
    <div className="flex flex-col items-center gap-6 pb-16">
      {/* Header Section */}
      <div className="w-full flex justify-between items-center">
        <h1
          className="text-2xl font-semibold text-gray-700"
          style={{ fontFamily: "Lato", letterSpacing: "2px" }}
        >
          Review Request
        </h1>
        <button
          onClick={() => navigate(-1)} // Use relative path here
          className="inline-flex items-center px-4 py-2 border border-transparent font-medium rounded-md shadow-sm text-white bg-buttonColor hover:bg-buttonColorHover "
        >
          <List className="h-4 w-4 mr-2" />
          All Requests
        </button>
      </div>

      {/* Main Table Section */}
      <div className="w-full bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Requested By
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <>
              {/* Purchase Request Details Row */}
              <tr key={travelRequest.id} className="h-[40px] max-h-[40px]">
                <td className="px-6 py-2 whitespace-nowrap font-medium text-gray-700 uppercase">
                  {travelRequest.staffName}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-gray-500">
                  {moneyFormat(
                    travelRequest?.expenses!.reduce(
                      (sum, item) => sum + item.total,
                      0
                    ),
                    "NGN"
                  )}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-gray-500 uppercase">
                  <div
                    className={`w-fit h-fit border text-white px-2  whitespace-nowrap  rounded-lg uppercase mb-1
                      ${travelRequest.status === "pending" && "bg-secondary"} ${
                      travelRequest.status === "approved" && "bg-teal-600"
                    } ${travelRequest.status === "rejected" && "bg-red-500"} ${
                      travelRequest.status === "reviewed" && "bg-buttonColor"
                    }
                      `}
                  >
                    <p
                      className={``}
                      style={{ letterSpacing: "1px" }}
                    >{`${travelRequest.status}`}</p>
                  </div>
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-gray-500 uppercase">
                  {travelRequest.staffName}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-gray-500 uppercase">
                  {dateformat(travelRequest.createdAt!)}
                </td>
              </tr>

              {/* Items Table Section */}
              <tr
                key={`${travelRequest.id}-items`}
                className="w-full h-10 scale-[98%] "
              >
                <td colSpan={6}>
                  <div className="border border-gray-400 px-6 py-4 rounded-md">
                    <TravelRequestDetails request={travelRequest} />

                    {/* Comments and Actions Section */}
                    {travelRequest?.reviewedBy &&
                      travelRequest.status !== "draft" && (
                        <div className="text-gray-700 mt-4">
                          <p className="mb-2">
                            <span className="font-bold mr-1  uppercase">
                              Reviewed By :
                            </span>
                            {`${travelRequest?.reviewedBy?.first_name} ${travelRequest?.reviewedBy?.last_name}`}
                          </p>
                          {travelRequest?.approvedBy && (
                            <p className="mb-2">
                              <span className="font-bold mr-1  uppercase">
                                Approval:
                              </span>
                              {`${travelRequest?.approvedBy?.first_name} ${travelRequest?.approvedBy?.last_name}`}
                            </p>
                          )}
                          <div className="flex flex-col gap-1">
                            <span className="font-bold mr-1  uppercase">
                              Comments :
                            </span>

                            <div className="flex flex-col gap-2 mb-2">
                              {travelRequest?.comments?.map((comment) => (
                                <div className="w-fit border-2 px-4 py-2 rounded-lg shadow-lg">
                                  <p className="text-base font-extrabold">
                                    {`${comment.user.role}: ${comment.user.first_name} ${comment.user.last_name}`}
                                  </p>
                                  <p className="text-sm">{`${comment.text}`}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {
                            // Condition 1: Render for REVIEWER when status is "pending"
                            (localStorageUserX.role === "REVIEWER" &&
                              travelRequest.status === "pending") ||
                            // Condition 2: Render for SUPER-ADMIN or ADMIN when status is "reviewed"
                            ((localStorageUserX.role === "SUPER-ADMIN" ||
                              localStorageUserX.role === "ADMIN") &&
                              travelRequest.status === "reviewed") ? (
                              <form
                                className="flex flex-col w-full gap-3"
                                style={{ letterSpacing: "1px" }}
                              >
                                {(localStorageUserX.role === "SUPER-ADMIN" ||
                                  (travelRequest?.reviewedBy &&
                                    localStorageUserX.id ===
                                      travelRequest.reviewedBy.id) ||
                                  (travelRequest?.approvedBy &&
                                    localStorageUserX.id ===
                                      travelRequest.approvedBy.id)) && (
                                  <>
                                    <div className="flex flex-col w-full gap-2">
                                      <label htmlFor="content">
                                        <span className="font-bold uppercase">
                                          Comment
                                        </span>{" "}
                                        <em>(Optional)</em>
                                      </label>
                                      <textarea
                                        id="content"
                                        className="border-2 w-full p-2 min-h-40 text-base rounded-lg shadow-sm focus:outline-none"
                                        value={comment}
                                        onChange={(e) =>
                                          setComment(e.target.value)
                                        }
                                        aria-label="Enter your comment"
                                      />
                                    </div>

                                    <div className="w-fit border border-gray-700   rounded-md">
                                      <label
                                        htmlFor={`status-${travelRequest?.id}`}
                                        className="sr-only"
                                      >
                                        Select Action
                                      </label>
                                      <select
                                        className="text-xs md:text-sm bg-inherit px-3 py-2 rounded-md"
                                        id={`status-${travelRequest?.id}`}
                                        value={status}
                                        onChange={(e) =>
                                          setStatus(e.target.value)
                                        }
                                        disabled={isUpdatingStatus}
                                      >
                                        <option value="">ACTIONS</option>
                                        {travelRequest.status === "reviewed" ? (
                                          <option value="approved">
                                            APPROVE REQUEST
                                          </option>
                                        ) : (
                                          <option value="reviewed">
                                            APPROVE REVIEW
                                          </option>
                                        )}
                                        <option value="rejected">REJECT</option>
                                      </select>
                                    </div>

                                    {status && (
                                      <div className="flex w-full justify-center p-4">
                                        <Button
                                          size="medium"
                                          onClick={handleStatusChange}
                                        >
                                          {isUpdatingStatus ? (
                                            <SpinnerMini />
                                          ) : (
                                            "Update Status"
                                          )}
                                        </Button>
                                      </div>
                                    )}
                                  </>
                                )}
                              </form>
                            ) : null
                          }
                        </div>
                      )}

                    {/* Admin Approval Section (for STAFF role) */}
                    {!travelRequest.approvedBy && // Check if approvedBy is not set
                      localStorageUserX.role === "STAFF" &&
                      travelRequest.status === "reviewed" && (
                        <div>
                          <FormRow label="Approved By *" type="small">
                            {isLoadingAmins ? (
                              <SpinnerMini /> // Show a spinner while loading admins
                            ) : (
                              <Select
                                id="approvedBy"
                                customLabel="Select an admin"
                                value={formData.approvedBy || ""} // Use empty string if null
                                onChange={(value) =>
                                  handleFormChange("approvedBy", value)
                                }
                                options={
                                  admins
                                    ? admins
                                        .filter((admin) => admin.id) // Filter out admins with undefined IDs
                                        .map((admin) => ({
                                          id: admin.id as string, // Assert that admin.id is a string
                                          name: `${admin.first_name} ${admin.last_name}`,
                                        }))
                                    : []
                                }
                                required
                              />
                            )}
                          </FormRow>
                          {travelRequest.status === "reviewed" && (
                            <div className="flex w-full justify-center p-4">
                              {formData.approvedBy && (
                                <Button size="medium" onClick={handleSend}>
                                  {isUpdating ? (
                                    <SpinnerMini />
                                  ) : (
                                    "Request Approval"
                                  )}
                                </Button>
                              )}
                            </div>
                          )}
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

export default TravelRequest;
