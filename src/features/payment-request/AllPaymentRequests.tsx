import { Plus, Trash2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { useAllPaymentRequests } from "./Hooks/useAllPaymentRequests";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import { BiSearch } from "react-icons/bi";
import { GoXCircle } from "react-icons/go";
import { Pagination } from "../../ui/Pagination";
import { dateformat } from "../../utils/dateFormat";
import { moneyFormat } from "../../utils/moneyFormat";
import Spinner from "../../ui/Spinner";
import { HiMiniEye, HiMiniEyeSlash } from "react-icons/hi2";
import Swal from "sweetalert2";
import { useDeletePaymentRequest } from "./Hooks/useDeletePaymentRequest";
import { PaymentRequestType } from "../../interfaces";
import { useDispatch, useSelector } from "react-redux";
import { localStorageUser } from "../../utils/localStorageUser";
import {
  setSearchTerm,
  setPage,
  resetQuery,
} from "../../store/genericQuerySlice";

import { RootState } from "../../store/store";
import { setPaymentRequest } from "../../store/paymentRequestSlice";
import { RequestDetails } from "./RequestDetails";

const AllPaymentRequests = () => {
  const localStorageUserX = localStorageUser();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { searchTerm, sort, page, limit } = useSelector(
    (state: RootState) => state.genericQuerySlice
  );

  const [debouncedSearchTerm] = useDebounce(searchTerm, 600); // 500ms debounce
  const [visibleItems, setVisibleItems] = useState<{ [key: string]: boolean }>(
    {}
  );

  useEffect(() => {
    return () => {
      dispatch(resetQuery());
    };
  }, [dispatch]);

  const { data, isLoading, isError } = useAllPaymentRequests(
    debouncedSearchTerm,
    sort,
    page,
    limit
  );

  const { deletePaymentRequest } = useDeletePaymentRequest(
    debouncedSearchTerm,
    sort,
    page,
    limit
  );

  // Add null checks for `data` and `data.data`
  const paymentRequests = useMemo(
    () => data?.data?.paymentRequests ?? [],
    [data]
  );
  const totalPages = useMemo(() => data?.data?.totalPages ?? 1, [data]);

  const toggleViewItems = (requestId: string) => {
    setVisibleItems((prev) => ({
      ...prev,
      [requestId]: !prev[requestId], // Toggle visibility for the specific request
    }));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const handleAction = (request: PaymentRequestType) => {
    dispatch(setPaymentRequest(request));
    navigate(`/payment-requests/request/${request.id}`);
  };

  const handleEdit = (request: PaymentRequestType) => {
    dispatch(setPaymentRequest(request));
    navigate(`/payment-requests/edit-request/${request.id}`);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this Payment Request?",
      showCancelButton: true,
      confirmButtonColor: "#1373B0",
      cancelButtonColor: "#DC3340",
      confirmButtonText: "Yes, delete it!",
      customClass: { popup: "custom-style" },
    }).then((result) => {
      if (result.isConfirmed) {
        deletePaymentRequest(id, {
          onError: (error) => {
            Swal.fire("Error!", error.message, "error");
          },
        });
      }
    });
  };

  console.log(paymentRequests);

  if (isError) {
    return <NetworkErrorUI />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1
          className="text-2xl font-semibold text-gray-700"
          style={{ fontFamily: "Lato", letterSpacing: "2px" }}
        >
          Payment Requests
        </h1>
        <button
          onClick={() => navigate("/payment-requests/create-payment-request")}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-buttonColor hover:bg-buttonColorHover "
        >
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </button>
      </div>

      {/* Search Bar and Sort Dropdown */}
      <div className="flex items-center space-x-4">
        <div className="relative flex items-center w-full max-w-[298px] h-9 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus-within:border-gray-400 transition">
          <span className="p-2 text-gray-400">
            <BiSearch className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            className="w-full h-full px-2 text-gray-700 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-0 mr-7"
            placeholder="Search"
          />
          <span
            className="text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer hover:scale-110"
            onClick={() => dispatch(setSearchTerm(""))}
          >
            <GoXCircle />
          </span>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Request
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Budget
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          {isLoading ? (
            <tbody>
              <tr>
                <td colSpan={6}>
                  <div className="flex justify-center items-center h-96">
                    <Spinner />
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="bg-white divide-y divide-gray-200">
              {paymentRequests.map((request) => (
                <>
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 uppercase">
                      {request.requestBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div
                        className={`w-fit h-fit px-2 whitespace-nowrap rounded-lg uppercase 
                        ${
                          request.status === "draft" && "border border-gray-400"
                        } 
                        ${
                          request.status === "pending" &&
                          "bg-amber-500 text-white"
                        } ${
                          request.status === "approved" &&
                          "bg-teal-600 text-white"
                        } 
                      ${
                        request.status === "rejected" && "bg-red-500 text-white"
                      }  ${
                          request.status === "reviewed" &&
                          "bg-buttonColor text-white"
                        }`}
                      >
                        {request.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {moneyFormat(request.amountInFigure, "NGN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">
                      {dateformat(request.createdAt!)}
                    </td>

                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-4">
                        <span
                          className="hover:cursor-pointer"
                          onClick={() => toggleViewItems(request.id!)}
                        >
                          {visibleItems[request.id!] ? (
                            <HiMiniEyeSlash className="w-5 h-5" />
                          ) : (
                            <HiMiniEye className="w-5 h-5" />
                          )}
                        </span>

                        {(request.status === "draft" ||
                          request.status === "rejected") &&
                          request?.requestedBy?.id! ===
                            localStorageUserX.id && (
                            <div className="flex space-x-4">
                              <button
                                className="hover:cursor-pointer"
                                onClick={() => handleEdit(request)}
                              >
                                <Edit className="h-5 w-5" />
                              </button>

                              <button
                                className="text-red-600 hover:text-red-900 hover:cursor-pointer"
                                onClick={() => handleDelete(request.id!)}
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                      </div>
                    </td>
                  </tr>

                  {visibleItems[request.id!] && (
                    <tr
                      key={`${request.id}-details`}
                      className="w-full h-10 scale-[95%]"
                      style={{ letterSpacing: "1px" }}
                    >
                      <td colSpan={5}>
                        {/* <div className="border border-gray-300 px-6 py-4 rounded-lg shadow-sm bg-[#F8F8F8]">
                      
                        <div className="flex flex-col gap-4">
                          <div className="text-sm text-gray-700">
                            <span className="font-bold uppercase">
                              Grant Code:
                            </span>{" "}
                            {request.grantCode}
                          </div>

                          <div className="text-sm text-gray-700">
                            <h2 className="font-bold uppercase mb-1">
                              Amount In Words:
                            </h2>
                            <p>{request.amountInWords}</p>
                          </div>

                          <div className="text-sm text-gray-700">
                            <h2 className="font-bold uppercase mb-1">
                              Requested By:
                            </h2>
                            <p>{`${request.requestedBy?.first_name} ${request.requestedBy?.last_name}`}</p>
                          </div>

                          <div className="text-sm text-gray-700">
                            <h2 className="font-bold uppercase mb-1">
                              Special Instruction:
                            </h2>
                            <p>{request.specialInstruction}</p>
                          </div>

                          <div className="text-sm text-gray-700">
                            <h2 className="font-bold uppercase mb-1">
                              Account Details:
                            </h2>
                            <ul className="list-disc pl-5">
                              <li>
                                <strong>Account Name:</strong>{" "}
                                {request.accountName}
                              </li>
                              <li>
                                <strong>Account Number:</strong>{" "}
                                {request.accountNumber}
                              </li>
                              <li>
                                <strong>Bank Name:</strong> {request.bankName}
                              </li>
                            </ul>
                          </div>

                          <div className="text-sm text-gray-700">
                            <span className="font-bold uppercase">Budget:</span>{" "}
                            {moneyFormat(Number(request.amountInFigure), "NGN")}
                          </div>
                        </div>

                        
                        {request?.reviewedBy && request.status !== "draft" && (
                          <div className="border-t pt-4 mt-4">
                            <div className="text-sm text-gray-700">
                              <p>
                                <strong>Reviewed By:</strong>{" "}
                                {`${request?.reviewedBy?.first_name} ${request?.reviewedBy?.last_name}`}
                              </p>
                              <p>
                                <strong>Reviewed At:</strong>{" "}
                                {dateformat(request.reviewedAt!)}
                              </p>
                              {request.approvedBy && (
                                <>
                                  <p>
                                    <strong>Approval:</strong>{" "}
                                    {`${request?.approvedBy?.first_name} ${request?.approvedBy?.last_name}`}
                                  </p>
                                  <p>
                                    <strong>Approved At:</strong>{" "}
                                    {dateformat(request.approvedAt!)}
                                  </p>
                                </>
                              )}
                            </div>

                            <div className="text-sm text-gray-700 mt-4">
                              <h2 className="font-bold uppercase mb-2">
                                Comments:
                              </h2>
                              {request?.comments?.map((comment, index) => (
                                <div
                                  key={index}
                                  className="border px-4 py-2 rounded-lg shadow-lg bg-white mb-2"
                                >
                                  <p className="font-bold">{`${comment.user.role}: ${comment.user.first_name} ${comment.user.last_name}`}</p>
                                  <p>{comment.text}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-center mt-6">
                          <button
                            onClick={() => handleAction(request)}
                            className="px-4 py-2 rounded-md shadow-md bg-buttonColor hover:bg-buttonColorHover text-white text-sm"
                          >
                            {request.status !== "draft" ? (
                              <span className="flex items-center gap-2">
                                <SlMagnifier />
                                Inspect
                              </span>
                            ) : (
                              "Draft Action"
                            )}
                          </button>
                        </div>
                      </div> */}

                        <RequestDetails
                          request={request}
                          handleAction={handleAction}
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {/* Pagination */}
      {(paymentRequests.length >= limit || totalPages > 1) && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default AllPaymentRequests;
