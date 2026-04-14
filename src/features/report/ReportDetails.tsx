import { ReportType } from "../../interfaces";
import { useParams } from "react-router-dom";
import FileAttachmentContainer from "../../ui/FileAttachmentContainer";
import DetailContainer from "../../ui/DetailContainer";
import CopiedTo from "../../ui/CopiedTo";
import SystemInfo from "../../ui/SystemInfo";
import { format } from "date-fns";

interface ReportDetailsProps {
  report: ReportType;
}

export const ReportDetails = ({ report }: ReportDetailsProps) => {
  const { requestId } = useParams();

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "dd-MM-yyyy");
    } catch {
      return "Invalid Date";
    }
  };

  const rowData = [
    {
      id: "activityType",
      label: "Activity Type :",
      content:
        report.activityType === "Other" && report.otherActivitySpecification
          ? `${report.activityType} - ${report.otherActivitySpecification}`
          : report.activityType,
    },
    {
      id: "reportType",
      label: "Report Type :",
      content: report.reportType,
    },
    {
      id: "reportTitle",
      label: "Report Title :",
      content: report.reportTitle,
    },
    {
      id: "reportingPeriod",
      label: "Reporting Period :",
      content: `${formatDate(report.reportingPeriod?.from)} to ${formatDate(
        report.reportingPeriod?.to
      )}`,
    },
    {
      id: "project",
      label: "Project :",
      content:
        typeof report.project === "object" && report.project !== null
          ? (report.project as any).project_title || "N/A"
          : "N/A",
    },
  ];

  return (
    <DetailContainer>
      {/* Report Number Header */}
      {report?.reportNumber && (
        <h1 className="text-center text-lg font-extrabold p-4 md:p-6">
          {report.reportNumber}
        </h1>
      )}

      <div
        className={`grid grid-cols-1 gap-4 md:gap-6 ${
          !requestId ? "text-sm" : "text-sm md:text-base"
        } mb-6 border-b border-gray-300 pb-6`}
      >
        <div className="flex flex-col items-start gap-3 md:gap-4 w-full">
          {rowData.map((data) => (
            <div
              key={data.id}
              className="w-full md:w-fit border-b-2 md:border-b-0 flex flex-col md:flex-row gap-1 pb-2 md:pb-0"
            >
              <span className="text-sm font-bold uppercase whitespace-nowrap text-gray-700 mb-1 md:mb-0">
                {data.label}
              </span>
              <span className="break-words">{data.content || "N/A"}</span>
            </div>
          ))}
        </div>
      </div>

      <SystemInfo request={report} />

      {/* File Attachments */}
      {report.files && report.files.length > 0 && (
        <FileAttachmentContainer files={report.files} />
      )}

      {/* Copied To */}
      {report.copiedTo && report.copiedTo.length > 0 && (
        <CopiedTo to={report.copiedTo} />
      )}
    </DetailContainer>
  );
};
