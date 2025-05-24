import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useAllConceptNotes } from "./Hooks/useAllConceptNotes";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useDebounce } from "use-debounce";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import { Pagination } from "../../ui/Pagination";
import { useNavigate } from "react-router-dom";
import { setPage, setSearchTerm } from "../../store/genericQuerySlice";
import Spinner from "../../ui/Spinner";
import { ConceptNoteType } from "../../interfaces";
import { setConceptNote } from "../../store/conceptNoteSlice";
import { useDeleteConceptNote } from "./Hooks/useDeleteConceptNote";
import { GoXCircle } from "react-icons/go";
import { BiSearch } from "react-icons/bi";
import TextHeader from "../../ui/TextHeader";
import Button from "../../ui/Button";
import ConceptNoteTableRow from "./ConceptNoteTableRow";
import useDeleteRequest from "../../hooks/useDeleteRequest";

const tableHeadData = [
  "Prepared By",
  "Status",
  "Account Code",
  "Date",
  "Actions",
];
const AllConceptNotes = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [visibleItems, setVisibleItems] = useState<{ [key: string]: boolean }>(
    {}
  );

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

  const toggleViewItems = (requestId: string) => {
    setVisibleItems((prev) => ({
      ...prev,
      [requestId]: !prev[requestId], // Toggle visibility for the specific request
    }));
  };

  const handleEdit = (conceptNote: ConceptNoteType) => {
    dispatch(setConceptNote(conceptNote));
    navigate(`/concept-notes/edit-concept-note/${conceptNote.id}`);
  };
  const handleAction = (conceptNote: ConceptNoteType) => {
    dispatch(setConceptNote(conceptNote));
    navigate(`/concept-notes/concept-note/${conceptNote.id}`);
  };

  const { deleteConceptNote } = useDeleteConceptNote(
    searchTerm,
    sort,
    page,
    limit
  );

  const handleDelete = useDeleteRequest(deleteConceptNote, {
    entityName: "Concept Note",
  });

  if (isError) {
    return <NetworkErrorUI />;
  }

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        {/* Header with title and button */}
        <div className="flex justify-between items-center">
          <TextHeader>Concept Notes</TextHeader>

          <Button
            onClick={() => navigate("/concept-notes/create-concept-note")} // Use relative path here
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
              className="w-full h-full px-2 text-gray-600 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-0 mr-7"
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

      {/* Concept Notes Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border overflow-x-scroll">
        <table className="min-w-full divide-y divide-gray-200 ">
          <thead className="bg-gray-50">
            <tr>
              {tableHeadData.map((title, index) => (
                <th
                  key={index}
                  className="min-w-[150px] px-3 py-2.5 md:px-6 md:py-3 text-left  font-medium text-gray-600 uppercase text-xs 2xl:text-text-sm tracking-wider"
                >
                  {title}
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
            ) : (
              conceptNotes.map((request) => (
                <ConceptNoteTableRow
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
