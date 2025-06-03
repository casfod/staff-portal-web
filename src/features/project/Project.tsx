import { List } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RootState } from "../../store/store";
import { useSelector } from "react-redux";
import { moneyFormat } from "../../utils/moneyFormat";
import { dateformat } from "../../utils/dateFormat";
import TextHeader from "../../ui/TextHeader";
import Button from "../../ui/Button";
import { ProjectDetails } from "./ProjectDetails";
import { truncateText } from "../../utils/truncateText";
import { usePdfDownload } from "../../hooks/usePdfDownload";
import ActionIcons from "../../ui/ActionIcons";

const Project = () => {
  const navigate = useNavigate();
  const param = useParams();
  const project = useSelector((state: RootState) => state.project?.project);

  // Redirect if no project or params are available
  useEffect(() => {
    if (!project || !param) {
      navigate("/projects");
    }
  }, [project, param, navigate]);

  //PDF logic
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const { downloadMultiPagePdf } = usePdfDownload({
    filename: `Project-${project?.id}`,
    format: "a4",
    orientation: "portrait",
  });
  const handleDownloadPDF = () => {
    downloadMultiPagePdf(pdfContentRef);
  };

  // Handle the case where project is null
  if (!project) {
    return <div>No project data available.</div>;
  }

  const tableHeadData = ["Project Code", "Budget", "Date", "Actions"];

  const requestCreatedAt = project.createdAt ?? "";

  const tableRowData = [
    // { id: "project_title", content: request.project_title },
    { id: "project_code", content: truncateText(project.project_code, 40) },
    {
      id: "project_budget",
      content: moneyFormat(Number(project.project_budget), "USD"),
    },
    { id: "date", content: dateformat(requestCreatedAt) },
    {
      id: "action",
      content: <ActionIcons onDownloadPDF={handleDownloadPDF} />,
    },
  ];

  return (
    <div className="flex flex-col space-y-3 pb-80">
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
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
      <div ref={pdfContentRef}>
        <div className="w-full bg-inherit shadow-sm rounded-lg  border pb-[200px] overflow-x-scroll">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 ">
              <tr>
                {tableHeadData.map((title, index) => (
                  <th
                    key={index}
                    className="px-3 py-2.5 md:px-6 md:py-3 text-left  font-medium   uppercase text-xs 2xl:text-text-sm tracking-wider"
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              <tr key={project?.id}>
                {tableRowData.map((data) => (
                  <td
                    key={data.id}
                    className="min-w-[150px] px-3 py-2.5 md:px-6 md:py-3 text-left font-medium   uppercase text-sm 2xl:text-text-base tracking-wider"
                  >
                    {data.content}
                  </td>
                ))}
              </tr>

              <tr>
                <td colSpan={4}>
                  <div className="border border-gray-300 px-3 py-2.5 md:px-6 md:py-3 rounded-md h-auto relative">
                    <ProjectDetails request={project} />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Project;
