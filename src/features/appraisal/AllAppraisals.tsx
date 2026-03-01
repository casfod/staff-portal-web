// src/features/appraisal/AllAppraisals.tsx
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BiSearch } from "react-icons/bi";
import { GoXCircle } from "react-icons/go";
import { useDebounce } from "use-debounce";

import {
  useAppraisals,
  useDeleteAppraisal,
  useAppraisalStats,
} from "./Hooks/useAppraisal";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import { RootState } from "../../store/store";
import { setSearchTerm, setPage } from "../../store/genericQuerySlice";
import { Pagination } from "../../ui/Pagination";
import { AppraisalType } from "../../interfaces";
import { setAppraisal } from "../../store/appraisalSlice";
import Spinner from "../../ui/Spinner";
import TextHeader from "../../ui/TextHeader";
import Button from "../../ui/Button";
import AppraisalTableRow from "./AppraisalTableRow";
import useDeleteRequest from "../../hooks/useDeleteRequest";
// import { StatsCard } from "../../ui/StatsCard";

export function AllAppraisals() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { searchTerm, sort, page, limit } = useSelector(
    (state: RootState) => state.genericQuerySlice
  );
  const [debouncedSearchTerm] = useDebounce(searchTerm, 600);

  // Fetch stats
  const { data: statsData, isLoading: isLoadingStats } = useAppraisalStats();

  const { data, isLoading, isError, refetch } = useAppraisals({
    search: debouncedSearchTerm,
    sort,
    page,
    limit,
  });

  const { deleteAppraisal } = useDeleteAppraisal(
    debouncedSearchTerm,
    sort,
    page,
    limit
  );

  const [visibleItems, setVisibleItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    refetch();
  }, []);

  const appraisals = useMemo(() => data?.data?.appraisals ?? [], [data]);
  const totalPages = useMemo(() => data?.data?.totalPages ?? 1, [data]);

  // Stats calculation
  const stats = useMemo(() => {
    const overall = statsData?.data?.overall || {
      total: 0,
      completed: 0,
      pending: 0,
      draft: 0,
    };
    return overall;
  }, [statsData]);

  const toggleViewItems = (id: string) => {
    setVisibleItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const handleAction = (appraisal: AppraisalType) => {
    dispatch(setAppraisal(appraisal));
    navigate(`/human-resources/appraisals/${appraisal.id}`);
  };

  const handleEdit = (appraisal: AppraisalType) => {
    dispatch(setAppraisal(appraisal));
    navigate(`/human-resources/appraisals/edit/${appraisal.id}`);
  };

  const handleDelete = useDeleteRequest(deleteAppraisal, {
    entityName: "Appraisal",
  });

  if (isError) {
    return <NetworkErrorUI />;
  }

  const tableHeadData = [
    { label: "Staff Name", showOnMobile: true, minWidth: "120px" },
    {
      label: "Appraisal Code",
      showOnMobile: false,
      showOnTablet: true,
      minWidth: "120px",
    },
    {
      label: "Period",
      showOnMobile: false,
      showOnTablet: true,
      minWidth: "120px",
    },
    { label: "Status", showOnMobile: true, minWidth: "100px" },
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
        <div className="flex justify-between items-center">
          <TextHeader>Staff Appraisals</TextHeader>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate("/human-resources/appraisals/create")}
            >
              <Plus className="h-4 w-4 mr-1 md:mr-2" />
              Create Appraisal
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {/* {!isLoadingStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4">
            <StatsCard
              title="Total Appraisals"
              value={stats.total}
              color="blue"
            />
            <StatsCard
              title="Completed"
              value={stats.completed}
              color="green"
            />
            <StatsCard title="Pending" value={stats.pending} color="yellow" />
            <StatsCard title="Drafts" value={stats.draft} color="gray" />
          </div>
        )} */}

        {/* Search Bar */}
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
              placeholder="Search Appraisals..."
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

      {/* Appraisals Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border overflow-x-scroll">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {tableHeadData.map((header, index) => (
                <th
                  key={index}
                  className={`
                    px-3 py-2.5 md:px-4 md:py-3 
                    text-left font-medium uppercase 
                    tracking-wider text-xs md:text-sm
                    ${!header.showOnMobile ? "hidden md:table-cell" : ""}
                    ${
                      header.showOnTablet
                        ? "hidden sm:table-cell md:table-cell"
                        : ""
                    }
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
                <td colSpan={tableHeadData.length} className="py-8">
                  <div className="flex justify-center items-center">
                    <Spinner />
                  </div>
                </td>
              </tr>
            ) : appraisals.length === 0 ? (
              <tr>
                <td
                  colSpan={tableHeadData.length}
                  className="py-8 text-center text-gray-500"
                >
                  No appraisals found
                </td>
              </tr>
            ) : (
              appraisals.map((appraisal) => (
                <AppraisalTableRow
                  key={appraisal.id}
                  request={appraisal}
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
      {(appraisals.length >= limit || totalPages > 1) && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
