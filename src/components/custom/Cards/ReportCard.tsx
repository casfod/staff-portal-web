// ReportCard.tsx - Card for IReport
import BaseRequestCard, { RequestCardWrapperProps } from '../../../components/custom/BaseRequestCard';
import { IReport } from '../../../interfaces';

interface ReportCardProps extends RequestCardWrapperProps {
  report: IReport;
}

const ReportCard = ({ report, ...rest }: ReportCardProps) => (
  <BaseRequestCard
    displayName={report.reportTitle}
    identifier={report.reportNumber}
    status={report.status}
    date={report.createdAt}
    requestId={report.id}
    {...rest}
  />
);

export default ReportCard;
