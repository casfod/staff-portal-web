import BaseRequestCard, { RequestCardWrapperProps } from '../../components/custom/BaseRequestCard';
import { getUserFullName } from '../../utils/getUserFullName';
import { IReport } from '../../interfaces';

interface ReportCardProps extends RequestCardWrapperProps {
  report: IReport;
}

const ReportCard = ({ report, requestId, ...rest }: ReportCardProps) => (
  <BaseRequestCard
    displayName={getUserFullName(report.createdBy)}
    identifier={report.reportNumber}
    status={report.status}
    date={report.createdAt}
    requestId={requestId ?? report.id}
    {...rest}
  />
);

export default ReportCard;
