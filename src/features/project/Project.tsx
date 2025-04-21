import { Dot, List } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RootState } from "../../store/store";
import { useSelector } from "react-redux";
import { truncateText } from "../../utils/truncateText";
import { moneyFormat } from "../../utils/moneyFormat";
import { dateformat } from "../../utils/dateFormat";
import TextHeader from "../../ui/TextHeader";
import Button from "../../ui/Button";

const Project = () => {
  const navigate = useNavigate();
  const param = useParams();

  const project = useSelector((state: RootState) => state.project?.project);

  console.log(project);

  // Redirect if no project or params are available
  useEffect(() => {
    if (!project || !param) {
      navigate("/projects");
    }
  }, [project, param, navigate]);

  // Handle the case where project is null
  if (!project) {
    return <div>No project data available.</div>;
  }

  return (
    <div className="flex flex-col space-y-4 pb-16">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 md:pb-4 space-y-4 shadow-sm ">
        <div className="flex justify-between items-center">
          <TextHeader>Project</TextHeader>

          <Button
            onClick={() => navigate(-1)} // Use relative path here
          >
            <List className="h-4 w-4 mr-1 md:mr-2" />
            All Projects
          </Button>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border overflow-x-scroll">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-2 text-left  font-medium text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-2 text-left  font-medium text-gray-600 uppercase tracking-wider">
                Project Code
              </th>
              <th className="px-6 py-2 text-left  font-medium text-gray-600 uppercase tracking-wider">
                Budget
              </th>
              <th className="px-6 py-2 text-left  font-medium text-gray-600 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr key={project?.id}>
              <td className="px-6 py-4 whitespace-nowrap  font-medium text-gray-700 uppercase">
                {project?.project_title
                  ? truncateText(project?.project_title, 35, "...")
                  : "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap  text-gray-600 uppercase">
                {project?.project_code}
              </td>
              <td className="px-6 py-4 whitespace-nowrap  text-gray-600 uppercase">
                {project?.project_budget
                  ? moneyFormat(Number(project?.project_budget), "USD")
                  : "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap  text-gray-600 uppercase">
                {project?.createdAt ? dateformat(project?.createdAt) : "N/A"}
              </td>
            </tr>

            <tr
              key={`${project?.id}-details`}
              className="w-full h-10"
              style={{ letterSpacing: "1px" }}
            >
              <td colSpan={5}>
                <div className="border border-gray-300 px-6 py-4 rounded-lg shadow-sm bg-white">
                  {/* Project Details Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex flex-col gap-3">
                      <p className="text-gray-700">
                        <span className="font-extrabold uppercase">
                          Project Code:
                        </span>{" "}
                        {project.project_code}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-extrabold uppercase">
                          Project Name:
                        </span>{" "}
                        {project.project_title}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-extrabold uppercase">Donor:</span>{" "}
                        {project.donor}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-extrabold uppercase">
                          Objectives:
                        </span>{" "}
                        {project.project_objectives}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-extrabold uppercase">
                          Target Beneficiaries:
                        </span>{" "}
                        {project.target_beneficiaries.join(", ")}
                      </p>

                      {/* <div className="text-gray-700">
                                <p className="font-extrabold uppercase">
                                  Locations:
                                </p>{" "}
                                {project.project_locations.map(
                                  (location, index) => (
                                    <ul key={index}>
                                      {" "}
                                      <li className="inline-flex items-center">
                                        {" "}
                                        <span className="mb-auto ">
                                          <Dot />
                                        </span>{" "}
                                        {location}
                                      </li>
                                    </ul>
                                  )
                                )}
                              </div> */}

                      <p className="text-gray-700">
                        <span className="font-extrabold uppercase">
                          Locations:
                        </span>{" "}
                        {project.project_locations.join(", ")}
                      </p>

                      <p className="text-gray-700">
                        <span className="font-extrabold uppercase">
                          Budget:
                        </span>{" "}
                        {moneyFormat(Number(project.project_budget), "USD")}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className=" text-gray-700">
                        <h2 className="font-extrabold uppercase">
                          Account Codes:
                        </h2>{" "}
                        {project?.account_code.map((account, index) => (
                          <ul key={index}>
                            {" "}
                            <li className="inline-flex items-center">
                              {" "}
                              <span className="mb-auto ">
                                <Dot />
                              </span>{" "}
                              {account.name}
                            </li>
                          </ul>
                        ))}
                      </div>

                      <p className="text-gray-700">
                        <span className="font-extrabold uppercase">
                          Partners:
                        </span>{" "}
                        {project.project_partners.join(", ")}
                      </p>

                      <p className="text-gray-700">
                        <span className="font-extrabold uppercase">
                          Implementation Period:
                        </span>{" "}
                        <span>{project.implementation_period.from}</span> -{" "}
                        <span>{project.implementation_period.to}</span>
                      </p>
                    </div>
                  </div>
                  {/* Target Beneficiaries Section */}
                  {/* <div className="mb-6">
                    <h3 className=" font-semibold text-gray-700 uppercase mb-2">
                      Target Beneficiaries
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className=" text-gray-700">
                        <span className="font-semibold">Men:</span>{" "}
                        {project?.target_beneficiaries.men}
                      </div>
                      <div className=" text-gray-700">
                        <span className="font-semibold">Women:</span>{" "}
                        {project?.target_beneficiaries.women}
                      </div>
                      <div className=" text-gray-700">
                        <span className="font-semibold">Boys:</span>{" "}
                        {project?.target_beneficiaries.boys}
                      </div>
                      <div className=" text-gray-700">
                        <span className="font-semibold">Girls:</span>{" "}
                        {project?.target_beneficiaries.girls}
                      </div>
                    </div>
                  </div> */}

                  {/* Sectors Table */}
                  <div className="border w-[50%]  mb-4 rounded-md">
                    <h3 className="text-center font-semibold text-gray-700 uppercase py-2">
                      Sectors
                    </h3>
                    <table className="border min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-[#F8F8F8]">
                        <tr>
                          <th className="px-4 py-2 text-left  font-medium text-gray-600 uppercase tracking-wider">
                            Sector
                          </th>
                          <th className="px-4 py-2 text-left  font-medium text-gray-600 uppercase tracking-wider">
                            Percentage
                          </th>
                        </tr>
                      </thead>
                      <tbody className=" divide-y divide-gray-200">
                        {project?.sectors?.map((sector, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 whitespace-nowrap  text-gray-700">
                              {sector.name}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap  text-gray-700">
                              {sector.percentage}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <p className="text-gray-700">
                      <span className="font-extrabold uppercase">Summary:</span>{" "}
                      {project.project_summary}
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Project;
