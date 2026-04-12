import { ReportType } from "../../interfaces";
import { useParams } from "react-router-dom";
import FileAttachmentContainer from "../../ui/FileAttachmentContainer";
import DetailContainer from "../../ui/DetailContainer";
import CopiedTo from "../../ui/CopiedTo";
import SystemInfo from "../../ui/SystemInfo";

interface ReportDetailsProps {
  report: ReportType;
}

export const ReportDetails = ({ report }: ReportDetailsProps) => {
  const { requestId } = useParams();

  const rowData = [
    {
      id: "activityType",
      label: "Activity Type :",
      content: report.activityType,
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
              <span className="break-words">{data.content}</span>
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
      {report.copiedTo?.length! > 0 && <CopiedTo to={report.copiedTo!} />}
    </DetailContainer>
  );
};
