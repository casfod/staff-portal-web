import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { useAllPaymentRequests } from "./Hooks/useAllPaymentRequests";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import { BiSearch } from "react-icons/bi";
import { GoXCircle } from "react-icons/go";
import { Pagination } from "../../ui/Pagination";

import Spinner from "../../ui/Spinner";
import Swal from "sweetalert2";
import { useDeletePaymentRequest } from "./Hooks/useDeletePaymentRequest";
import { PaymentRequestType } from "../../interfaces";
import { useDispatch, useSelector } from "react-redux";
import {
  setSearchTerm,
  setPage,
  resetQuery,
} from "../../store/genericQuerySlice";

import { RootState } from "../../store/store";
import { setPaymentRequest } from "../../store/paymentRequestSlice";
import PaymentRequestTableRow from "./PaymentRequestTableRow";
import TextHeader from "../../ui/TextHeader";
import Button from "../../ui/Button";

const AllPaymentRequests = () => {
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

  if (isError) {
    return <NetworkErrorUI />;
  }

  return (
    <div className="flex flex-col space-y-4 pb-16">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 md:pb-4 space-y-4 shadow-sm ">
        {/* Header with title and button */}
        <div className="flex justify-between items-center">
          <TextHeader>Payment Requests</TextHeader>

          <Button
            onClick={() => navigate("/payment-requests/create-payment-request")}
          >
            <Plus className="h-4 w-4 mr-1 md:mr-2" />
            New
          </Button>
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
      </div>

      {/*  Payment Requests Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border ">
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
              <th className="px-6 py-3 text-left  font-medium text-gray-600 uppercase text-xs 2xl:text-text-sm tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6}>
                  <div className="flex justify-center items-center h-96">
                    <Spinner />
                  </div>
                </td>
              </tr>
            ) : (
              paymentRequests.map((request) => (
                <PaymentRequestTableRow
                  key={request.id}
                  request={request}
                  visibleItems={visibleItems}
                  toggleViewItems={toggleViewItems}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  handleAction={handleAction}
                />
              ))
            )}
          </tbody>
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
