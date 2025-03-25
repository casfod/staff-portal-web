import { Plus } from "lucide-react";
import { useMemo } from "react";
import { useAllConceptNotes } from "./Hooks/useAllConceptNotes";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useDebounce } from "use-debounce";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import { dateformat } from "../../utils/dateFormat";
import { Pagination } from "../../ui/Pagination";
import { useNavigate } from "react-router-dom";
import { setPage } from "../../store/genericQuerySlice";
import Spinner from "../../ui/Spinner";

const AllConceptNotes = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { searchTerm, sort, page, limit } = useSelector(
    (state: RootState) => state.genericQuerySlice
  );

  const [debouncedSearchTerm] = useDebounce(searchTerm, 600); // 500ms debounce

  const { data, isLoading, isError } = useAllConceptNotes(
    debouncedSearchTerm,
    sort,
    page,
    limit
  );

  console.log(data);

  const conceptNotes = useMemo(() => data?.data?.conceptNotes ?? [], [data]);
  const totalPages = useMemo(() => data?.data?.totalPages ?? 1, [data]);

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

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
          Concept Notes
        </h1>
        <button
          onClick={() => navigate("/concept-notes/create-concept-note")} // Use relative path here
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-buttonColor hover:bg-buttonColorHover "
        >
          <Plus className="h-4 w-4 mr-2" />
          New Concept Note
        </button>
      </div>
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prepared By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
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
              {conceptNotes.map((note) => (
                <tr key={note?.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                    {note.project_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {note.status}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {note.staff_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dateformat(note?.createdAt!)}
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {/* Pagination */}
      {(conceptNotes.length >= limit || totalPages > 1) && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default AllConceptNotes;
