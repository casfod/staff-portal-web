import { List } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { RootState } from "../../store/store";
import { useEffect, useState } from "react";
import { dateformat } from "../../utils/dateFormat";
import { moneyFormat } from "../../utils/moneyFormat";
import { useUpdateStatus } from "./pRHooks/useUpdateStatus";
import Swal from "sweetalert2";
import { localStorageUser } from "../../utils/localStorageUser";

const Request = () => {
  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");
  const navigate = useNavigate();
  const param = useParams();
  const localStorageUserX = localStorageUser();

  const purchaseRequest = useSelector(
    (state: RootState) => state.purchaseRequest.purchaseRequest
  );

  useEffect(() => {
    if (!param || !purchaseRequest) {
      navigate("/purchase-requests");
    }
  }, [purchaseRequest, param]);

  const { updateStatus, isPending } = useUpdateStatus(param.requestId!);

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value;
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
        setStatus(newStatus);

        updateStatus(
          { status: newStatus, comments: [{ comment: comment }] },
          {
            onError: (error) => {
              Swal.fire({
                title: "Error!",
                text: error.message,
                icon: "error",
                animation: false, // Disable animations for error modal
              });
            },
            // onSuccess: () => {
            //   Swal.fire({
            //     title: "Success!",
            //     text: "User role updated successfully.",
            //     icon: "success",
            //     animation: false // Disable animations for success modal
            //   });
            // },
          }
        );
      }
    });
  };

  // Handle the case where purchaseRequest is null
  if (!purchaseRequest) {
    return <div>No purchase request data available.</div>;
  }

  return (
    <div className="flex flex-col items-center gap-6 pb-16">
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
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                Department
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
              <tr key={purchaseRequest._id} className="h-[40px] max-h-[40px]">
                <td className="px-6 py-2 whitespace-nowrap font-medium text-gray-700">
                  {purchaseRequest.department}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-gray-500">
                  {moneyFormat(
                    purchaseRequest?.itemGroups!.reduce(
                      (sum, item) => sum + item.total,
                      0
                    ),
                    "NGN"
                  )}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-gray-500 uppercase">
                  {purchaseRequest.status}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-gray-500">
                  {purchaseRequest.requestedBy}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-gray-500">
                  {dateformat(purchaseRequest.createdAt!)}
                </td>
              </tr>

              {/* ///////////////////////////// */}
              {/*ITEMS TABLE*/}
              {/* ///////////////////////////// */}

              <tr
                key={`${purchaseRequest._id}-items`}
                className="w-full h-10 scale-[98%] "
              >
                <td colSpan={6}>
                  <div className="border border-gray-400 px-6 py-4 rounded-md">
                    <div
                      className="w-full text-gray-700 mb-3"
                      style={{ letterSpacing: "1px" }}
                    >
                      <p>
                        <span className="font-bold mr-1 uppercase">
                          Account Code :{" "}
                        </span>{" "}
                        {purchaseRequest.accountCode}
                      </p>
                      <p>
                        <span className="font-bold mr-1 uppercase">
                          Charged To :{" "}
                        </span>
                        {purchaseRequest.expenseChargedTo}
                      </p>
                      <p>
                        <span className="font-bold mr-1 uppercase">
                          Address :{" "}
                        </span>{" "}
                        {purchaseRequest.address}
                      </p>
                      <p>
                        <span className="font-bold mr-1 uppercase">
                          City :{" "}
                        </span>{" "}
                        {purchaseRequest.city}
                      </p>
                      <p>
                        <span className="font-bold mr-1 uppercase">
                          Delivery Point :{" "}
                        </span>
                        {purchaseRequest.finalDeliveryPoint}
                      </p>

                      <p>
                        <span className="font-bold mr-1 uppercase">
                          Period Of Activity :
                        </span>
                        {purchaseRequest.periodOfActivity}
                      </p>
                      <p>
                        <span className="font-bold mr-1 uppercase">
                          Activity Description :{" "}
                        </span>
                        {purchaseRequest.activityDescription}
                      </p>
                    </div>

                    <h2
                      className="text-center text-lg text-gray-700 font-semibold"
                      style={{ letterSpacing: "2px" }}
                    >
                      ITEMS
                    </h2>
                    <table className=" min-w-full divide-y divide-gray-200 rounded-md mb-4">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Frequency
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Unit Cost
                          </th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 ">
                        {purchaseRequest?.itemGroups!.map((item) => (
                          <tr key={item._id!}>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                              {item.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                              {item.frequency}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                              {moneyFormat(item.unitCost, "NGN")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                              {moneyFormat(item.total, "NGN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {purchaseRequest?.reviewedBy &&
                      purchaseRequest.status !== "draft" && (
                        <div className="text-gray-700">
                          <p className="mb-2">
                            <span className="font-bold mr-1  uppercase">
                              Reviewed By :
                            </span>
                            {`${purchaseRequest?.reviewedBy?.first_name} ${purchaseRequest?.reviewedBy?.last_name}`}
                          </p>
                          <div className="mb-2">
                            <span className="font-bold mr-1  uppercase">
                              Comments :
                            </span>

                            {purchaseRequest?.comments?.map((comment) => (
                              <p>{`${comment.comment}`}</p>
                            ))}
                          </div>

                          {purchaseRequest.status !== "approved" &&
                            purchaseRequest.status !== "rejected" && (
                              <form
                                className="flex flex-col w-full gap-3"
                                style={{ letterSpacing: "1px" }}
                              >
                                {localStorageUserX.id ===
                                  purchaseRequest?.reviewedBy.id && (
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
                                )}

                                <div className="bg-buttonColor hover:to-buttonColorHover text-white self-center px-3 py-2 rounded-md">
                                  <label
                                    htmlFor={`status-${purchaseRequest?._id}`}
                                    className="sr-only"
                                  >
                                    Select Action
                                  </label>
                                  <select
                                    className="text-xs md:text-sm bg-inherit"
                                    id={`status-${purchaseRequest?._id}`}
                                    value={status}
                                    onChange={handleStatusChange}
                                    disabled={isPending}
                                  >
                                    <option value="">ACTIONS</option>
                                    <option value="approved">APPROVE</option>
                                    <option value="rejected">REJECT</option>
                                  </select>
                                </div>
                              </form>
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

export default Request;
