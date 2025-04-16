import { Edit, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useAllConceptNotes } from "./Hooks/useAllConceptNotes";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useDebounce } from "use-debounce";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import { dateformat } from "../../utils/dateFormat";
import { Pagination } from "../../ui/Pagination";
import { useNavigate } from "react-router-dom";
import { setPage, setSearchTerm } from "../../store/genericQuerySlice";
import Spinner from "../../ui/Spinner";
import { localStorageUser } from "../../utils/localStorageUser";
import { HiMiniEye, HiMiniEyeSlash } from "react-icons/hi2";
import Swal from "sweetalert2";
import { ConceptNote } from "../../interfaces";
import { setConceptNote } from "../../store/conceptNoteSlice";
import { moneyFormat } from "../../utils/moneyFormat";
import { SlMagnifier } from "react-icons/sl";
import { useDeleteConceptNote } from "./Hooks/useDeleteConceptNote";
import StatusBadge from "../../ui/StatusBadge";
import { GoXCircle } from "react-icons/go";
import { BiSearch } from "react-icons/bi";

const AllConceptNotes = () => {
  const localStorageUserX = localStorageUser();

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

  const handleEdit = (conceptNote: ConceptNote) => {
    dispatch(setConceptNote(conceptNote));
    navigate(`/concept-notes/edit-concept-note/${conceptNote.id}`);
  };
  const handleAction = (conceptNote: ConceptNote) => {
    dispatch(setConceptNote(conceptNote));
    navigate(`/concept-notes/concept-note/${conceptNote.id}`);
  };

  const { deleteConceptNote } = useDeleteConceptNote(
    searchTerm,
    sort,
    page,
    limit
  );

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this Concept Note?",
      showCancelButton: true,
      confirmButtonColor: "#1373B0",
      cancelButtonColor: "#DC3340",
      confirmButtonText: "Yes, delete it!",
      customClass: { popup: "custom-style" },
    }).then((result) => {
      if (result.isConfirmed) {
        deleteConceptNote(id, {
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
          <h1
            className="text-xl 2xl:text-2xl font-semibold text-gray-700"
            style={{ letterSpacing: "2px" }}
          >
            Concept Notes
          </h1>

          <button
            onClick={() => navigate("/concept-notes/create-concept-note")} // Use relative path here
            className="inline-flex items-center px-4 py-2 border border-transparent 
text-xs 2xl:text-sm font-medium rounded-md shadow-sm text-white bg-buttonColor hover:bg-buttonColorHover "
          >
            <Plus className="h-4 w-4 mr-2" />
            New Concept Note
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

      {/* Concept Notes Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border ">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left  font-medium text-gray-500 uppercase text-xs 2xl:text-text-sm tracking-wider">
                Project Code
              </th>
              <th className="px-6 py-3 text-left  font-medium text-gray-500 uppercase text-xs 2xl:text-text-sm tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left  font-medium text-gray-500 uppercase text-xs 2xl:text-text-sm tracking-wider">
                Prepared By
              </th>
              <th className="px-6 py-3 text-left  font-medium text-gray-500 uppercase text-xs 2xl:text-text-sm tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left  font-medium text-gray-500 uppercase text-xs 2xl:text-text-sm tracking-wider">
                Actions
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
                <>
                  <tr key={note?.id}>
                    <td className="px-6 py-2 whitespace-nowrap  text-xs 2xl:text-text-sm font-medium text-gray-700">
                      {note.project_code}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap  text-xs 2xl:text-text-sm text-gray-500 uppercase">
                      <StatusBadge status={note.status!} />
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap  text-xs 2xl:text-text-sm text-gray-500 uppercase">
                      {note.staff_name}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap  text-xs 2xl:text-text-sm text-gray-500 uppercase">
                      {note?.createdAt ? dateformat(note.createdAt) : "N/A"}
                    </td>

                    <td className="px-6 py-2 whitespace-nowrap  text-xs 2xl:text-text-sm text-gray-500 uppercase">
                      <div className="flex space-x-4">
                        <span
                          className="hover:cursor-pointer"
                          onClick={() => toggleViewItems(note.id!)}
                        >
                          {visibleItems[note.id!] ? (
                            <HiMiniEyeSlash className="w-5 h-5" />
                          ) : (
                            <HiMiniEye className="w-5 h-5" />
                          )}
                        </span>

                        {(note?.status === "draft" ||
                          note.status === "rejected") &&
                          note?.preparedBy?.id === localStorageUserX.id && (
                            <div className="flex space-x-4">
                              <button
                                className="hover:cursor-pointer"
                                onClick={() => handleEdit(note)}
                              >
                                <Edit className="h-5 w-5" />
                              </button>

                              <button
                                className="text-red-600 hover:text-red-900 hover:cursor-pointer"
                                onClick={() => handleDelete(note.id!)}
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                      </div>
                    </td>
                  </tr>

                  {visibleItems[note.id!] && (
                    <tr
                      key={`${note.id}-details`}
                      className="w-full h-10 scale-[95%]"
                      style={{ letterSpacing: "1px" }}
                    >
                      <td colSpan={5}>
                        <div className="border border-gray-300 px-6 py-4 rounded-lg shadow-sm bg-[#F8F8F8]">
                          {/* note Details Section */}

                          <div className="flex flex-col gap-3">
                            <p className="text-sm text-gray-700">
                              <span className="font-extrabold uppercase">
                                Project Code:
                              </span>{" "}
                              {note.project_code}
                            </p>
                            <div className="text-sm text-gray-700">
                              <h2 className="font-extrabold uppercase mb-1">
                                Activity Title:
                              </h2>{" "}
                              <p>{note.activity_title}</p>
                            </div>

                            <div className="text-sm text-gray-700 whitespace-pre-line">
                              <h2 className="font-extrabold uppercase mb-1">
                                Objectives Purpose:
                              </h2>{" "}
                              <p> {note.objectives_purpose}</p>
                            </div>
                            <div className="text-sm text-gray-700 whitespace-pre-line">
                              <h2 className="font-extrabold uppercase mb-1">
                                Background Context:
                              </h2>{" "}
                              <p>{note.background_context}</p>
                            </div>

                            <div className="text-sm text-gray-700 whitespace-pre-line">
                              <h2 className="font-extrabold uppercase mb-1">
                                Benefits Of Project:
                              </h2>{" "}
                              <p>{note.benefits_of_project}</p>
                            </div>

                            <div className="text-sm text-gray-700 whitespace-pre-line">
                              <h2 className="font-extrabold uppercase mb-1">
                                Strategic Plan:
                              </h2>{" "}
                              <p>{note.strategic_plan}</p>
                            </div>
                            <div className="text-sm text-gray-700 whitespace-pre-line">
                              <h2 className="font-extrabold uppercase mb-1">
                                Activity Location:
                              </h2>{" "}
                              <p>{note.activity_location}</p>
                            </div>

                            <div className="text-sm text-gray-700 whitespace-pre-line">
                              <h2 className="font-extrabold uppercase mb-1">
                                Detailed Activity Description:
                              </h2>{" "}
                              <p>{note.detailed_activity_description}</p>
                            </div>
                            <div className="text-sm text-gray-700 whitespace-pre-line">
                              <h2 className="font-extrabold uppercase mb-1">
                                Means of verification:
                              </h2>{" "}
                              <p>{note.means_of_verification}</p>
                            </div>

                            <p className="text-sm text-gray-700">
                              <span className="font-extrabold uppercase">
                                Budget:
                              </span>{" "}
                              {moneyFormat(Number(note.activity_budget), "NGN")}
                            </p>
                          </div>

                          <div className="w-fit  mt-4">
                            <p className="text-sm text-gray-700">
                              <span className="font-bold mr-1 uppercase">
                                Prepared By :
                              </span>
                              {`${note?.preparedBy?.first_name} ${note?.preparedBy?.last_name}`}
                            </p>

                            <p className="text-sm text-gray-700">
                              <span className="font-bold mr-1 uppercase">
                                Role :
                              </span>
                              {note?.preparedBy.role}
                            </p>
                          </div>

                          {note?.approvedBy && (
                            <div className=" w-fit  mt-4">
                              <p className="text-sm text-gray-700">
                                <span className="font-bold mr-1 uppercase">
                                  Approved By :
                                </span>
                                {`${note?.approvedBy?.first_name} ${note?.approvedBy?.last_name}`}
                              </p>

                              <p className="text-sm text-gray-700">
                                <span className="font-bold mr-1 uppercase">
                                  Role :
                                </span>
                                {note?.approvedBy.role}
                              </p>

                              <div className="flex flex-col gap-2 text-gray-600 mt-3">
                                <span className="font-bold mr-1  uppercase">
                                  Comments :
                                </span>

                                <div className="flex flex-col gap-2 ">
                                  {note?.comments?.map((comment) => (
                                    <div className="border-2 px-4 py-2 rounded-lg shadow-lg bg-white">
                                      <p className="text-base font-extrabold">
                                        {`${comment.user.role}: ${comment.user.first_name} ${comment.user.last_name}`}
                                      </p>
                                      <p className="text-sm">{`${comment.text}`}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex justify-center w-full">
                            <button
                              onClick={() => handleAction(note)} // Use relative path here
                              className="inline-flex items-center px-4 py-2 border border-transparent 
text-xs 2xl:text-sm font-medium rounded-md shadow-sm text-white bg-buttonColor hover:bg-buttonColorHover "
                            >
                              <span className="inline-flex items-center gap-1">
                                <SlMagnifier />
                                <span>Inspect</span>
                              </span>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
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
