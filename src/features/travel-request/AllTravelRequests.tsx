import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useDebounce } from "use-debounce";
import { BiSearch } from "react-icons/bi";
import { GoXCircle } from "react-icons/go";

import Swal from "sweetalert2";

import { TravelRequestType } from "../../interfaces";
import { useDispatch, useSelector } from "react-redux";
import {
  setSearchTerm,
  setPage,
  resetQuery,
} from "../../store/genericQuerySlice";
import { RootState } from "../../store/store";
import { setTravelRequest } from "../../store/travelRequestSlice";

import NetworkErrorUI from "../../ui/NetworkErrorUI";
import { Pagination } from "../../ui/Pagination";

import Spinner from "../../ui/Spinner";
import { useAllTravelRequests } from "./Hooks/useAllTravelRequests";
import { useDeleteTravelRequest } from "./Hooks/useDeleteTravelRequest";
import TravelRequestTableRow from "./TravelRequestTableRow";

const AllTravelRequests = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { searchTerm, sort, page, limit } = useSelector(
    (state: RootState) => state.genericQuerySlice
  );

  const [debouncedSearchTerm] = useDebounce(searchTerm, 600);
  const [visibleItems, setVisibleItems] = useState<{ [key: string]: boolean }>(
    {}
  );

  useEffect(() => {
    return () => {
      dispatch(resetQuery());
    };
  }, [dispatch]);

  const { data, isLoading, isError } = useAllTravelRequests(
    debouncedSearchTerm,
    sort,
    page,
    limit
  );

  const { deleteTravelRequest } = useDeleteTravelRequest();

  const travelRequests = useMemo(
    () => data?.data?.travelRequests ?? [],
    [data]
  );
  const totalPages = useMemo(() => data?.data?.totalPages ?? 1, [data]);

  const toggleViewItems = useCallback((requestId: string) => {
    setVisibleItems((prev) => ({
      ...prev,
      [requestId]: !prev[requestId],
    }));
  }, []);

  const handlePageChange = useCallback(
    (newPage: number) => {
      dispatch(setPage(newPage));
    },
    [dispatch]
  );

  const handleAction = useCallback(
    (request: TravelRequestType) => {
      dispatch(setTravelRequest(request));
      navigate(`/travel-requests/request/${request.id}`);
    },
    [dispatch, navigate]
  );

  const handleEdit = useCallback(
    (request: TravelRequestType) => {
      dispatch(setTravelRequest(request));
      navigate(`/travel-requests/edit-request/${request.id}`);
    },
    [dispatch, navigate]
  );

  const handleDelete = useCallback(
    (id: string) => {
      Swal.fire({
        title: "Are you sure?",
        text: "Do you want to delete this Travel Request?",
        showCancelButton: true,
        confirmButtonColor: "#1373B0",
        cancelButtonColor: "#DC3340",
        confirmButtonText: "Yes, delete it!",
        customClass: { popup: "custom-style" },
      }).then((result) => {
        if (result.isConfirmed) {
          deleteTravelRequest(id, {
            onError: (error) => {
              Swal.fire("Error!", error.message, "error");
            },
          });
        }
      });
    },
    [deleteTravelRequest]
  );

  if (isError) {
    return <NetworkErrorUI />;
  }

  return (
    <div className="flex flex-col space-y-4 pb-16">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 md:pb-4 space-y-4 shadow-sm ">
        {/* Header with title and button */}
        <div className="flex justify-between items-center">
          <h1
            className="text-xl 2xl:text-2xl font-semibold text-gray-700"
            style={{ letterSpacing: "2px" }}
          >
            Travel Requests
          </h1>

          <button
            onClick={() => navigate("/travel-requests/create-travel-request")}
            className="inline-flex items-center px-4 py-2 border border-transparent 
text-xs 2xl:text-sm font-medium rounded-md shadow-sm text-white bg-buttonColor hover:bg-buttonColorHover"
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
      </div>

      {/* ///////////////////////////// */}
      {/*Travel REQUEST TABLE*/}
      {/* ///////////////////////////// */}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border ">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left  font-medium text-gray-600 uppercase text-xs 2xl:text-text-sm tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left  font-medium text-gray-600 uppercase text-xs 2xl:text-text-sm tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left  font-medium text-gray-600 uppercase text-xs 2xl:text-text-sm tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left  font-medium text-gray-600 uppercase text-xs 2xl:text-text-sm tracking-wider">
                Requested By
              </th>
              <th className="px-6 py-3 text-left  font-medium text-gray-600 uppercase text-xs 2xl:text-text-sm tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left  font-medium text-gray-600 uppercase text-xs 2xl:text-text-sm tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8">
                  <div className="flex justify-center items-center">
                    <Spinner />
                  </div>
                </td>
              </tr>
            ) : (
              travelRequests.map((request) => (
                <TravelRequestTableRow
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

      {(travelRequests.length >= limit || totalPages > 1) && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default AllTravelRequests;
