import { Edit, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { dateformat } from "../../utils/dateFormat";
import { truncateText } from "../../utils/truncateText";
import { useProjects } from "./Hooks/useProjects";
import { HiMiniEye, HiMiniEyeSlash } from "react-icons/hi2";
import { useDispatch, useSelector } from "react-redux";
import NetworkErrorUI from "../../ui/NetworkErrorUI";
import { RootState } from "../../store/store";
import { BiSearch } from "react-icons/bi";
import { setSearchTerm, setPage } from "../../store/genericQuerySlice";
import { GoXCircle } from "react-icons/go";
import { Pagination } from "../../ui/Pagination";
import { useDebounce } from "use-debounce";
import { moneyFormat } from "../../utils/moneyFormat";
import { SlMagnifier } from "react-icons/sl";
import { Project } from "../../interfaces";
import { setProject } from "../../store/projectSlice";
import Spinner from "../../ui/Spinner";
import { localStorageUser } from "../../utils/localStorageUser";

export function AllProjects() {
  const localStorageUserX = localStorageUser();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { searchTerm, sort, page, limit } = useSelector(
    (state: RootState) => state.genericQuerySlice
  );
  const [debouncedSearchTerm] = useDebounce(searchTerm, 600); // 500ms debounce

  const { data, isLoading, isError } = useProjects(
    debouncedSearchTerm,
    sort,
    page,
    limit
  );

  // State for toggling nested tables
  const [visibleItems, setVisibleItems] = useState<Record<string, boolean>>({});

  const projects = useMemo(() => data?.data?.projects ?? [], [data]);
  const totalPages = useMemo(() => data?.data?.totalPages ?? 1, [data]);

  console.log(projects);

  // Toggle nested table visibility
  const toggleViewItems = (id: string) => {
    setVisibleItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const handleAction = (project: Project) => {
    dispatch(setProject(project));
    navigate(`/projects/project/${project.id}`);
  };
  const handleEdit = (project: Project) => {
    dispatch(setProject(project));
    navigate(`/projects/edit-project/${project.id}`);
  };

  if (isError) {
    return <NetworkErrorUI />;
  }

  return (
    <div className="flex flex-col space-y-3">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1
          className="text-2xl font-semibold text-gray-700"
          style={{ fontFamily: "Lato", letterSpacing: "2px" }}
        >
          Projects
        </h1>
        {localStorageUserX.role === "SUPER-ADMIN" && (
          <button
            onClick={() => navigate("/projects/create-project")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-buttonColor hover:bg-buttonColorHover"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </button>
        )}
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
            placeholder="Search by Name, Email or Role"
          />
          <span
            className="text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer hover:scale-110"
            onClick={() => dispatch(setSearchTerm(""))}
          >
            <GoXCircle />
          </span>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Budget
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
              {projects.map((project) => (
                <>
                  <tr key={project.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      {truncateText(project.project_title, 40, "...")}
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">
                      {project.status}
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">
                      {project.project_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {moneyFormat(Number(project.project_budget), "USD")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dateformat(project.createdAt!)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-4">
                        <span
                          className="hover:cursor-pointer"
                          onClick={() => toggleViewItems(project.id!)}
                        >
                          {visibleItems[project.id!] ? (
                            <HiMiniEyeSlash className="w-5 h-5" />
                          ) : (
                            <HiMiniEye className="w-5 h-5" />
                          )}
                        </span>
                        {localStorageUserX.role === "SUPER-ADMIN" && (
                          <button
                            className="hover:cursor-pointer"
                            onClick={() => handleEdit(project)}
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {visibleItems[project.id!] && (
                    <tr
                      key={`${project.id}-details`}
                      className="w-full h-10 scale-[95%]"
                      style={{ letterSpacing: "1px" }}
                    >
                      <td colSpan={5}>
                        <div className="border border-gray-300 px-6 py-4 rounded-lg shadow-sm bg-[#F8F8F8]">
                          {/* Project Details Section */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="flex flex-col gap-2">
                              <p className="text-sm text-gray-700">
                                <span className="font-extrabold uppercase">
                                  Project Code:
                                </span>{" "}
                                {project.project_code}
                              </p>
                              <p className="text-sm text-gray-700">
                                <span className="font-extrabold uppercase">
                                  Project Name:
                                </span>{" "}
                                {project.project_title}
                              </p>
                              <p className="text-sm text-gray-700">
                                <span className="font-extrabold uppercase">
                                  Donor:
                                </span>{" "}
                                {project.donor}
                              </p>
                              <p className="text-sm text-gray-700">
                                <span className="font-extrabold uppercase">
                                  Objectives:
                                </span>{" "}
                                {project.project_objectives}
                              </p>
                              <p className="text-sm text-gray-700">
                                <span className="font-extrabold uppercase">
                                  Target Beneficiaries:
                                </span>{" "}
                                {project.target_beneficiaries.join(", ")}
                              </p>
                              <p className="text-sm text-gray-700">
                                <span className="font-extrabold uppercase">
                                  Budget:
                                </span>{" "}
                                {moneyFormat(
                                  Number(project.project_budget),
                                  "USD"
                                )}
                              </p>
                            </div>

                            <div className="flex flex-col gap-2">
                              <div className=" text-gray-700">
                                <h2 className="font-extrabold uppercase">
                                  Account Codes:
                                </h2>{" "}
                                {project?.account_code.map((account, index) => (
                                  <p key={index}>
                                    <span>{account.name}</span> -{" "}
                                    <span>{account.code}</span>
                                  </p>
                                ))}
                              </div>
                              <p className="text-sm text-gray-700">
                                <span className="font-extrabold uppercase">
                                  Implementation Period:
                                </span>{" "}
                                <span>
                                  {project.implementation_period.from}
                                </span>{" "}
                                -{" "}
                                <span>{project.implementation_period.to}</span>
                              </p>
                              <p className="text-sm text-gray-700">
                                <span className="font-extrabold uppercase">
                                  Locations:
                                </span>{" "}
                                {project.project_locations.join(", ")}
                              </p>

                              <p className="text-sm text-gray-700">
                                <span className="font-extrabold uppercase">
                                  Partners:
                                </span>{" "}
                                {project.project_partners.join(", ")}
                              </p>

                              <p className="text-sm text-gray-700">
                                <span className="font-extrabold uppercase">
                                  Summary:
                                </span>{" "}
                                {project.project_summary}
                              </p>
                            </div>
                          </div>

                          {/* Target Beneficiaries Section */}
                          {/* <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">
                              Target Beneficiaries
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-sm text-gray-700">
                                <span className="font-semibold">Men:</span>{" "}
                                {project.target_beneficiaries.men}
                              </div>
                              <div className="text-sm text-gray-700">
                                <span className="font-semibold">Women:</span>{" "}
                                {project.target_beneficiaries.women}
                              </div>
                              <div className="text-sm text-gray-700">
                                <span className="font-semibold">Boys:</span>{" "}
                                {project.target_beneficiaries.boys}
                              </div>
                              <div className="text-sm text-gray-700">
                                <span className="font-semibold">Girls:</span>{" "}
                                {project.target_beneficiaries.girls}
                              </div>
                            </div>
                          </div> */}

                          {/* Sectors Table */}
                          <div className="border border-gray-300 w-[50%]  mb-4 rounded-md">
                            <h3 className="text-center font-semibold text-gray-700 uppercase py-2">
                              Sectors
                            </h3>
                            <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                    Sector
                                  </th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                    Percentage
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {project.sectors?.map((sector, index) => (
                                  <tr
                                    key={index}
                                    className="hover:bg-gray-50 transition-colors"
                                  >
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                      {sector.name}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                      {sector.percentage}%
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="flex justify-center w-full">
                            <button
                              onClick={() => handleAction(project)} // Use relative path here
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-buttonColor hover:bg-buttonColorHover "
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
      {(projects.length >= limit || totalPages > 1) && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
