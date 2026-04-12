import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import { BiSearch } from "react-icons/bi";
import { GoXCircle } from "react-icons/go";
import { Pagination } from "../../ui/Pagination";
import Spinner from "../../ui/Spinner";
import { ReportType } from "../../interfaces";
import { useDispatch, useSelector } from "react-redux";
import { setReport } from "../../store/reportSlice";
import { setSearchTerm, setPage, resetQuery } from "../../store/genericQuerySlice";
import { RootState } from "../../store/store";
import ReportTableRow from "./ReportTableRow";
import TextHeader from "../../ui/TextHeader";
import Button from "../../ui/Button";
import useDeleteRequest from "../../hooks/useDeleteRequest";
import { useAllReports, useDeleteReport } from "./Hooks/useReport";

const AllReports = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { searchTerm, sort, page, limit } = useSelector(
    (state: RootState) => state.genericQuerySlice
  );

  const [debouncedSearchTerm] = useDebounce(searchTerm, 600);
  const [visibleItems, setVisibleItems] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    return () => {
      dispatch(resetQuery());
    };
  }, [dispatch]);

  const { data, isLoading, isError } = useAllReports(
    debouncedSearchTerm,
    sort,
    page,
    limit
  );

  const { deleteReport } = useDeleteReport(debouncedSearchTerm, sort, page, limit);

  const reports = useMemo(() => data?.data?.reports ?? [], [data]);
  const totalPages = useMemo(() => data?.data?.totalPages ?? 1, [data]);

  const toggleViewItems = useCallback((reportId: string) => {
    setVisibleItems((prev) => ({ ...prev, [reportId]: !prev[reportId] }));
  }, []);

  const handlePageChange = useCallback(
    (newPage: number) => { dispatch(setPage(newPage)); },
    [dispatch]
  );

  const handleAction = useCallback(
    (report: ReportType) => {
      dispatch(setReport(report));
      navigate(`/reporting/report/${report.id}`);
    },
    [dispatch, navigate]
  );

  const handleEdit = useCallback(
    (report: ReportType) => {
      dispatch(setReport(report));
      navigate(`/reporting/edit-report/${report.id}`);
    },
    [dispatch, navigate]
  );

  const handleDelete = useDeleteRequest(deleteReport, { entityName: "Report" });

  if (isError) return <NetworkErrorUI />;

  const tableHeadData = [
    { label: "Title", showOnMobile: true, minWidth: "160px" },
    { label: "Type", showOnMobile: false, showOnTablet: true, minWidth: "140px" },
    { label: "Status", showOnMobile: true, minWidth: "100px" },
    { label: "Date", showOnMobile: false, showOnTablet: true, minWidth: "100px" },
    { label: "Actions", showOnMobile: true, minWidth: "100px" },
  ];

  return (
    <div className="flex flex-col space-y-3 pb-20">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex justify-between items-center">
          <TextHeader>Reports</TextHeader>
          <Button
            onClick={() => navigate("/reporting/create-report")}
            className="text-sm md:text-base"
          >
            <Plus className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Add</span>
            <span className="sm:hidden">New</span>
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
              className="w-full h-full px-2 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-0 mr-7 text-sm md:text-base"
              placeholder="Search reports..."
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

      <div className="bg-white shadow-sm rounded-lg overflow-hidden border overflow-x-auto">
        <div className="md:min-w-full">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 hidden sm:table-header-group">
              <tr>
                {tableHeadData.map((header, index) => (
                  <th
                    key={index}
                    className={`
                      px-3 py-2.5 md:px-4 md:py-3
                      text-left font-medium uppercase tracking-wider
                      ${!header.showOnMobile ? "hidden md:table-cell" : ""}
                      ${header.showOnTablet ? "hidden sm:table-cell md:table-cell" : ""}
                      text-xs md:text-sm whitespace-nowrap
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
                  <td colSpan={tableHeadData.length} className="py-8">
                    <div className="flex justify-center items-center">
                      <Spinner />
                    </div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={tableHeadData.length} className="py-8">
                    <div className="flex flex-col justify-center items-center text-gray-500">
                      <div className="text-lg font-semibold mb-2">No reports found</div>
                      <div className="text-sm">
                        {searchTerm ? "Try a different search term" : "Create your first report"}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <ReportTableRow
                    key={report.id}
                    report={report}
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
      </div>

      {(reports.length >= limit || totalPages > 1) && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default AllReports;
