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
    <div className="flex flex-col space-y-3 pb-16">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-700 tracking-wide">
          Travel Requests
        </h1>
        <button
          onClick={() => navigate("/travel-requests/create-travel-request")}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-buttonColor hover:bg-buttonColorHover"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </button>
      </div>

      <div className="relative flex items-center w-full max-w-[298px] h-9 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus-within:border-gray-400 transition">
        <BiSearch className="w-5 h-5 text-gray-400 ml-2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => dispatch(setSearchTerm(e.target.value))}
          className="w-full h-full px-2 text-gray-700 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-0 mr-7"
          placeholder="Search"
        />
        {searchTerm && (
          <button
            onClick={() => dispatch(setSearchTerm(""))}
            className="text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 hover:scale-110"
          >
            <GoXCircle />
          </button>
        )}
      </div>

      {/* ///////////////////////////// */}
      {/*Travel REQUEST TABLE*/}
      {/* ///////////////////////////// */}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
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
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
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
