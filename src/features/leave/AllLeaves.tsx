// src/features/leave/AllLeaves.tsx
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useAllLeaves, useDeleteLeave } from "./Hooks/useLeave";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useDebounce } from "use-debounce";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import { Pagination } from "../../ui/Pagination";
import { useNavigate } from "react-router-dom";
import { setPage, setSearchTerm } from "../../store/genericQuerySlice";
import Spinner from "../../ui/Spinner";
import { LeaveType } from "../../interfaces";
import { setLeave } from "../../store/leaveSlice";

import { GoXCircle } from "react-icons/go";
import { BiSearch } from "react-icons/bi";
import TextHeader from "../../ui/TextHeader";
import Button from "../../ui/Button";
import LeaveTableRow from "./LeaveTableRow";
import useDeleteRequest from "../../hooks/useDeleteRequest";

const tableHeadData = [
  { label: "Staff Name", showOnMobile: true, minWidth: "120px" },
  { label: "Leave Type", showOnMobile: true, minWidth: "150px" },
  // { label: "Days", showOnMobile: true, minWidth: "80px" },
  { label: "Status", showOnMobile: true, minWidth: "100px" },
  { label: "Date", showOnMobile: false, showOnTablet: true, minWidth: "100px" },
  { label: "Actions", showOnMobile: true, minWidth: "100px" },
];

const AllLeaves = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [visibleItems, setVisibleItems] = useState<{ [key: string]: boolean }>(
    {}
  );

  const { searchTerm, sort, page, limit } = useSelector(
    (state: RootState) => state.genericQuerySlice
  );

  const [debouncedSearchTerm] = useDebounce(searchTerm, 600);

  const { data, isLoading, isError } = useAllLeaves(
    debouncedSearchTerm,
    sort,
    page,
    limit
  );

  const leaves = useMemo(() => data?.data?.leaves ?? [], [data]);
  const totalPages = useMemo(() => data?.data?.totalPages ?? 1, [data]);

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const toggleViewItems = (requestId: string) => {
    setVisibleItems((prev) => ({
      ...prev,
      [requestId]: !prev[requestId],
    }));
  };

  const handleEdit = (leave: LeaveType) => {
    dispatch(setLeave(leave));
    navigate(`/human-resources/leave/edit/${leave.id}`);
  };

  const handleAction = (leave: LeaveType) => {
    dispatch(setLeave(leave));
    navigate(`/human-resources/leave/${leave.id}`);
  };

  const { deleteLeave } = useDeleteLeave(searchTerm, sort, page, limit);
  const handleDelete = useDeleteRequest(deleteLeave, {
    entityName: "Leave Application",
  });

  if (isError) {
    return <NetworkErrorUI />;
  }

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Leave Applications</TextHeader>

          <Button onClick={() => navigate("/human-resources/leave/create")}>
            <Plus className="h-4 w-4 mr-1 md:mr-2" />
            Apply for Leave
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex items-center w-full max-w-[298px] h-9 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus-within:border-gray-400 transition">
            <span className="p-2 text-gray-400">
              <BiSearch className="w-5 h-5" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
              className="w-full h-full px-2 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-0 mr-7"
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

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border overflow-x-scroll">
        <table className="min-w-full divide-y divide-gray-200">
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

          <tbody className="max-w-full bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8">
                  <div className="flex justify-center items-center">
                    <Spinner />
                  </div>
                </td>
              </tr>
            ) : leaves.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  No leave applications found
                </td>
              </tr>
            ) : (
              leaves.map((request) => (
                <LeaveTableRow
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

      {(leaves.length >= limit || totalPages > 1) && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default AllLeaves;
