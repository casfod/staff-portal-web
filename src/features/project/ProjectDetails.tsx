import { moneyFormat } from "../../utils/moneyFormat";
import { Project } from "../../interfaces";
import { useParams } from "react-router-dom";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import FileAttachmentContainer from "../../ui/FileAttachmentContainer";
import { Dot } from "lucide-react";
import DetailContainer from "../../ui/DetailContainer";

interface RequestDetailsProps {
  request: Project;
}

const tableHeadData = ["Sector", "Percentage"];

const SectorsTable = ({ sectors }: { sectors: Project["sectors"] }) => (
  <table className=" min-w-full divide-y divide-gray-200 rounded-md mb-4">
    <thead>
      <tr>
        {tableHeadData.map((data, index) => (
          <th
            key={index}
            className="px-6 py-2 bg-gray-50 text-left text-sm font-medium   uppercase tracking-wider"
          >
            {data}
          </th>
        ))}
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200 ">
      {sectors!.map((sector, index) => {
        const rowData = [
          { id: "name", content: sector.name },
          { id: "percentage", content: sector.percentage },
        ];

        return (
          <tr key={index!}>
            {rowData.map((data) => (
              <td
                key={data.id}
                className="px-6 py-4 text-sm   break-words max-w-xs"
              >
                {data.content}
              </td>
            ))}
          </tr>
        );
      })}
    </tbody>
  </table>
);

export const ProjectDetails = ({ request }: RequestDetailsProps) => {
  const { projectId } = useParams();

  // Create the data object with all fields
  const projectData = [
    {
      id: "project_code",
      label: "Project Code",
      content: request.project_code,
    },
    {
      id: "project_title",
      label: "Project Name",
      content: request.project_title,
    },
    {
      id: "donor",
      label: "Donor",
      content: request.donor,
      isBlock: true,
    },
    {
      id: "project_objectives",
      label: "Objectives",
      content: request.project_objectives,
      isBlock: true,
    },
    {
      id: "target_beneficiaries",
      label: "Target Beneficiaries",
      content: request.target_beneficiaries.join(", "),
      isBlock: true,
    },
    {
      id: "project_locations",
      label: "Project Locations",
      content: request.project_locations.join(", "),
      isBlock: true,
    },
    {
      id: "Budget",
      label: "Budget",
      content: moneyFormat(Number(request.project_budget), "USD"),
      isBlock: true,
    },
    {
      id: "account_code",
      label: "Account Codes",
      content: request?.account_code.map((account, index) => (
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
      )),
      isBlock: true,
    },

    {
      id: "project_partners",
      label: "Partners",
      content: request.project_partners.join(", "),
      isBlock: true,
    },

    {
      id: "implementation_period",
      label: "Implementation Period",
      content: `${formatToDDMMYYYY(
        request.implementation_period.from
      )} - ${formatToDDMMYYYY(request.implementation_period.to)}`,
      isBlock: true,
    },

    {
      id: "project_summary",
      label: "Project Summary",
      content: request.project_summary,
      isBlock: true,
    },
  ];

  return (
    <DetailContainer>
      {/* Project Details Section */}
      <div
        className={`flex flex-col gap-3 w-full   ${
          !projectId ? "text-sm" : "text-sm md:text-base"
        } mb-3 break-words`}
      >
        {projectData.map((item) => (
          <div
            key={item.id}
            className={item.isBlock ? "whitespace-pre-line" : ""}
          >
            <h2 className="text-sm font-bold uppercase mb-1">{item.label}:</h2>
            <p>{item.content}</p>
          </div>
        ))}
      </div>

      {/* Sectors Section Header */}
      <h2 className="text-center text-base md:text-lg   font-semibold tracking-widest my-4">
        SECTORS
      </h2>

      <SectorsTable sectors={request.sectors} />

      {/* File Attachments Section */}
      {request.files && request.files.length > 0 && (
        <FileAttachmentContainer files={request.files} />
      )}
    </DetailContainer>
  );
};
