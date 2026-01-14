import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import {
  useAllPaymentRequests,
  useDeletePaymentRequest,
} from "./Hooks/usePaymentRequests";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import { BiSearch } from "react-icons/bi";
import { GoXCircle } from "react-icons/go";
import { Pagination } from "../../ui/Pagination";

import Spinner from "../../ui/Spinner";

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
import useDeleteRequest from "../../hooks/useDeleteRequest";

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

  const handleDelete = useDeleteRequest(deletePaymentRequest, {
    entityName: "Payment Request",
  });

  if (isError) {
    return <NetworkErrorUI />;
  }

  // Update tableHeadData to match Purchase Request structure
  const tableHeadData = [
    { label: "Request", showOnMobile: true, minWidth: "120px" },
    { label: "Status", showOnMobile: true, minWidth: "100px" },
    { label: "Budget", showOnMobile: true, minWidth: "100px" },
    {
      label: "Date",
      showOnMobile: false,
      showOnTablet: true,
      minWidth: "100px",
    },
    { label: "Actions", showOnMobile: true, minWidth: "100px" },
  ];

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        {/* Header with title and button */}
        <div className="flex justify-between items-center">
          <TextHeader>Payment Requests</TextHeader>

          <Button
            onClick={() => navigate("/payment-requests/create-payment-request")}
          >
            <Plus className="h-4 w-4 mr-1 md:mr-2" />
            Add
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
              className="w-full h-full px-2   placeholder-gray-400 rounded-lg focus:outline-none focus:ring-0 mr-7"
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
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border overflow-x-scroll">
        <table className="min-w-full divide-y divide-gray-200 ">
          <thead className="bg-gray-50 hidden sm:table-header-group">
            <tr>
              {tableHeadData.map((header, index) => (
                <th
                  key={index}
                  className={`
                    px-3 py-2.5 md:px-4 md:py-3 
                    text-left font-medium uppercase 
                    tracking-wider
                    ${!header.showOnMobile ? "hidden md:table-cell" : ""}
                    ${
                      header.showOnTablet
                        ? "hidden sm:table-cell md:table-cell"
                        : ""
                    }
                    text-xs md:text-sm
                    whitespace-nowrap
                  `}
                  style={{ minWidth: header.minWidth }}
                >
                  {header.label}
                </th>
              ))}
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
                  tableHeadData={tableHeadData}
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
