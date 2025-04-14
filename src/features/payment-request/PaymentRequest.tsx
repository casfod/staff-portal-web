import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { RootState } from "../../store/store";
import { localStorageUser } from "../../utils/localStorageUser";
import { PaymentRequestType } from "../../interfaces";
import Swal from "sweetalert2";
import { useAdmins } from "../user/Hooks/useAdmins";
import { useUpdateStatus } from "./Hooks/useUpdateStatus";
import { useUpdatePaymentRequest } from "./Hooks/useUpdatePaymentRequest";
import { List } from "lucide-react";
import { moneyFormat } from "../../utils/moneyFormat";
import { dateformat } from "../../utils/dateFormat";
import SpinnerMini from "../../ui/SpinnerMini";
import Button from "../../ui/Button";
import FormRow from "../../ui/FormRow";
import Select from "../../ui/Select";
// import { RequestDetails } from "./RequestDetails";
import { PaymentRequestDetails } from "./PaymentRequestDetails";

const PaymentRequest = () => {
  const localStorageUserX = localStorageUser();

  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");
  const [formData, setFormData] = useState<Partial<PaymentRequestType>>({
    approvedBy: null,
  });

  const navigate = useNavigate();

  const param = useParams();

  // Access the paymentRequest state from Redux

  const paymentRequest = useSelector(
    (state: RootState) => state.paymentRequest.paymentRequest
  );

  useEffect(() => {
    if (!param || !paymentRequest) {
      navigate("/payment-requests");
    }
  }, [paymentRequest, param]);

  // Custom hooks for updating status and payment request
  const { updateStatus, isPending: isUpdatingStatus } = useUpdateStatus(
    param.requestId!
  );
  const { updatePaymentRequest, isPending: isUpdating } =
    useUpdatePaymentRequest(param.requestId!);

  // Fetch admins data
  const { data: adminsData, isLoading: isLoadingAmins } = useAdmins();
  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);

  // Handle form field changes
  const handleFormChange = (field: keyof PaymentRequestType, value: string) => {
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
    updatePaymentRequest(data);
  };

  // Handle the case where paymentRequest is null
  if (!paymentRequest) {
    return <div>No payment request data available.</div>;
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

      <div className="w-full bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Request
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Budget
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
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
                <td className="px-6 py-4 whitespace-nowrap  text-gray-500">
                  <div
                    className={`w-fit h-fit px-2 whitespace-nowrap rounded-lg uppercase 
                        ${
                          paymentRequest.status === "draft" &&
                          "border border-gray-400"
                        } 
                        ${
                          paymentRequest.status === "pending" &&
                          "bg-amber-500 text-white"
                        } ${
                      paymentRequest.status === "approved" &&
                      "bg-teal-600 text-white"
                    } 
                      ${
                        paymentRequest.status === "rejected" &&
                        "bg-red-500 text-white"
                      }  ${
                      paymentRequest.status === "reviewed" &&
                      "bg-buttonColor text-white"
                    }`}
                  >
                    {paymentRequest.status}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap  text-gray-500">
                  {moneyFormat(paymentRequest.amountInFigure, "NGN")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap  text-gray-500 uppercase">
                  {dateformat(paymentRequest.createdAt!)}
                </td>
              </tr>

              <tr
                key={`${paymentRequest.id}-details`}
                className="w-full h-10 "
                style={{ letterSpacing: "1px" }}
              >
                <td colSpan={5}>
                  <div className="border border-gray-300 px-6 py-4 rounded-lg shadow-sm">
                    {/* paymentRequest Details Section */}

                    <PaymentRequestDetails
                      request={paymentRequest}
                      // handleAction={handleAction}
                    />

                    {/* Comments and Actions Section */}
                    {paymentRequest?.reviewedBy &&
                      paymentRequest.status !== "draft" && (
                        <div className="text-gray-700  mt-3">
                          {/* <p className="mb-2">
                            <span className="font-bold mr-1  uppercase">
                              Reviewed By :
                            </span>
                            {`${paymentRequest?.reviewedBy?.first_name} ${paymentRequest?.reviewedBy?.last_name}`}
                          </p> */}
                          {/* {paymentRequest?.approvedBy && (
                            <p className="mb-2">
                              <span className="font-bold mr-1  uppercase">
                                Approval:
                              </span>
                              {`${paymentRequest?.approvedBy?.first_name} ${paymentRequest?.approvedBy?.last_name}`}
                            </p>
                          )} */}
                          {/* <div className="flex flex-col gap-2">
                            <span className="font-bold mr-1  uppercase">
                              Comments :
                            </span>

                            <div className="flex flex-col gap-2 mb-2">
                              {paymentRequest?.comments?.map((comment) => (
                                <div className="w-fit border-2 px-4 py-2 rounded-lg shadow-lg">
                                  <p className="text-base font-extrabold">
                                    {`${comment.user.role}: ${comment.user.first_name} ${comment.user.last_name}`}
                                  </p>
                                  <p className="">{`${comment.text}`}</p>
                                </div>
                              ))}
                            </div>
                          </div> */}

                          {
                            // Condition 1: Render for REVIEWER when status is "pending"
                            (localStorageUserX.role === "REVIEWER" &&
                              paymentRequest.status === "pending") ||
                            // Condition 2: Render for SUPER-ADMIN or ADMIN when status is "reviewed"
                            ((localStorageUserX.role === "SUPER-ADMIN" ||
                              localStorageUserX.role === "ADMIN") &&
                              paymentRequest.status === "reviewed") ? (
                              <form
                                className="flex flex-col w-full gap-3"
                                style={{ letterSpacing: "1px" }}
                              >
                                {/* Comment Section */}
                                {(localStorageUserX.role === "SUPER-ADMIN" ||
                                  localStorageUserX.id ===
                                    paymentRequest?.reviewedBy.id ||
                                  localStorageUserX.id ===
                                    paymentRequest?.approvedBy.id) && (
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

                                    {/* Action Dropdown */}
                                    <div className="w-fit border border-gray-700   rounded-md">
                                      <label
                                        htmlFor={`status-${paymentRequest?.id}`}
                                        className="sr-only"
                                      >
                                        Select Action
                                      </label>
                                      <select
                                        className="text-sm md: bg-inherit px-3 py-2 rounded-md"
                                        id={`status-${paymentRequest?.id}`}
                                        value={status}
                                        onChange={(e) =>
                                          setStatus(e.target.value)
                                        }
                                        disabled={isUpdatingStatus}
                                      >
                                        <option value="">ACTIONS</option>
                                        {paymentRequest.status ===
                                        "reviewed" ? (
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
                    {!paymentRequest.approvedBy && // Check if approvedBy is not set
                      localStorageUserX.role === "STAFF" &&
                      paymentRequest.status === "reviewed" && (
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
                          {paymentRequest.status === "reviewed" && (
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

export default PaymentRequest;
