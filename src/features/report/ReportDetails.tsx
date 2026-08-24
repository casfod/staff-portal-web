// features/report/ReportDetails.tsx
import { IReport } from '../../interfaces';
import { useParams } from 'react-router-dom';
import FileAttachmentContainer from '../../components/custom/FileAttachmentContainer';
import DetailContainer from '../../components/custom/DetailContainer';
import CopiedTo from '../../components/custom/CopiedTo';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';

interface ReportDetailsProps {
  report: IReport;
}

export const ReportDetails = ({ report }: ReportDetailsProps) => {
  const { requestId } = useParams();

  const rowData = [
    {
      id: 'activityType',
      label: 'Activity Type :',
      content:
        report.activityType === 'Other' && report.otherActivitySpecification
          ? `${report.activityType} - ${report.otherActivitySpecification}`
          : report.activityType || 'N/A',
    },
    {
      id: 'reportType',
      label: 'Report Type :',
      content: report.reportType || 'N/A',
    },
    {
      id: 'reportTitle',
      label: 'Report Title :',
      content: report.reportTitle || 'N/A',
    },
    {
      id: 'reportingPeriod',
      label: 'Reporting Period :',
      content: report.reportingPeriod
        ? `${formatToDDMMYYYY(report.reportingPeriod.from)} - ${formatToDDMMYYYY(
            report.reportingPeriod.to
          )}`
        : 'N/A',
    },
    {
      id: 'project',
      label: 'Project :',
      content:
        typeof report.project === 'object' && report.project !== null
          ? (report.project.projectTitle || 'N/A')
          : 'N/A',
    },
  ];

  // Determine if user can manage files (creator or admin)
  const canManageFiles = true; // You can add proper permission logic here

  return (
    <DetailContainer>
      {/* Report Number Header */}
      {report?.reportNumber && (
        <h1 className="text-center sm:text-lg font-extrabold pb-3 md:p-6">
          {report.reportNumber}
        </h1>
      )}

      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 ${
          !requestId ? 'text-sm' : 'text-sm md:text-base'
        } mb-6 border-b border-gray-300 pb-6`}
      >
        <div className="flex flex-col items-start gap-3 md:gap-4 w-full">
          {rowData.map(data => (
            <div
              key={data.id}
              className="w-full md:w-fit border-b-2 md:border-b-0 text-xs sm:text-sm flex flex-col md:flex-row gap-1 pb-2 md:pb-0"
            >
              <span className="font-bold uppercase whitespace-nowrap text-gray-700 mb-1 md:mb-0">
                {data.label}
              </span>
              <span className="break-words">{data.content}</span>
            </div>
          ))}
        </div>
      </div>

      {/* File Attachments Section */}
      <FileAttachmentContainer
        modelName="Report"
        id={report.id}
        status={report.status}
        canManage={canManageFiles}
      />

      {/* Copied To */}
      {report.copiedTo && report.copiedTo.length > 0 && <CopiedTo to={report.copiedTo} />}
    </DetailContainer>
  );
};