import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { useAllAdvanceRequests } from "./Hooks/useAllAdvanceRequests";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import { BiSearch } from "react-icons/bi";
import { GoXCircle } from "react-icons/go";
import { Pagination } from "../../ui/Pagination";
import Spinner from "../../ui/Spinner";
import { useDeleteAdvanceRequest } from "./Hooks/useDeleteAdvanceRequest";
import { AdvanceRequestType } from "../../interfaces";
import { useDispatch, useSelector } from "react-redux";
import { setAdvanceRequest } from "../../store/advanceRequestSlice";

import {
  setSearchTerm,
  setPage,
  resetQuery,
} from "../../store/genericQuerySlice";

import { RootState } from "../../store/store";
import AdvanceRequestTableRow from "./AdvanceRequestTableRow";
import TextHeader from "../../ui/TextHeader";
import Button from "../../ui/Button";
import useDeleteRequest from "../../hooks/useDeleteRequest";

const AllAdvanceRequests = () => {
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

  const { data, isLoading, isError } = useAllAdvanceRequests(
    debouncedSearchTerm,
    sort,
    page,
    limit
  );

  const { deleteAdvanceRequest } = useDeleteAdvanceRequest(
    debouncedSearchTerm,
    sort,
    page,
    limit
  );

  // Add null checks for `data` and `data.data`
  const advanceRequests = useMemo(
    () => data?.data?.advanceRequests ?? [],
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
    (request: AdvanceRequestType) => {
      dispatch(setAdvanceRequest(request));
      navigate(`/advance-requests/request/${request.id}`);
    },
    [dispatch, navigate]
  );

  const handleEdit = useCallback(
    (request: AdvanceRequestType) => {
      dispatch(setAdvanceRequest(request));
      navigate(`/advance-requests/edit-request/${request.id}`);
    },
    [dispatch, navigate]
  );

  const handleDelete = useDeleteRequest(deleteAdvanceRequest, {
    entityName: "Advance Request",
  });

  if (isError) {
    return <NetworkErrorUI />;
  }

  const tableHeadData = [
    "Request",
    "Status",
    // "Department",
    "Amount",
    "Date",
    "Actions",
  ];

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        {/* Header with title and button */}
        <div className="flex justify-between items-center">
          <TextHeader>Advance Requests</TextHeader>

          <Button
            onClick={() => navigate("/advance-requests/create-advance-request")} // Use relative path here
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

      {/* ///////////////////////////// */}
      {/*Advance REQUEST TABLE*/}
      {/* ///////////////////////////// */}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border overflow-x-scroll overflow-y-scroll">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {tableHeadData.map((title, index) => (
                <th
                  key={index}
                  className="min-w-[150px] px-3 py-2.5 md:px-6 md:py-3 text-left  font-medium   uppercase text-xs 2xl:text-text-sm tracking-wider"
                >
                  {title}
                </th>
              ))}
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
              advanceRequests.map((request) => (
                <AdvanceRequestTableRow
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
      {(advanceRequests.length >= limit || totalPages > 1) && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default AllAdvanceRequests;
