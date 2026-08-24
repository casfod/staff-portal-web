// src/features/leave/LeaveDetails.tsx
import { ILeave } from '../../interfaces';
import { useParams } from 'react-router-dom';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import FileAttachmentContainer from '../../components/custom/FileAttachmentContainer';
import DetailContainer from '../../components/custom/DetailContainer';
interface LeaveDetailsProps {
  request: ILeave;
}

export const LeaveDetails = ({ request }: LeaveDetailsProps) => {
  const { requestId } = useParams();

  const ILeaveInfo = {
    maxDays: 0,
    description: '',
    isCalendarDays: false,
  };

  const leaveDetails = [
    {
      id: 'ILeave',
      label: 'Leave Type',
      content: `${request.leaveType} (Max: ${ILeaveInfo.maxDays} days)`,
    },
    {
      id: 'period',
      label: 'Leave Period',
      content: `${formatToDDMMYYYY(request.startDate)} - ${formatToDDMMYYYY(request.endDate)}`,
    },
    {
      id: 'totalDays',
      label: 'Total Days Applied',
      content: `${request.totalDaysApplied} days`,
    },
    {
      id: 'balance',
      label: 'Balance at Application',
      content: `${request.leaveBalanceAtApplication} days`,
    },
    ...(request.amountAccruedLeave
      ? [
          {
            id: 'accrued',
            label: 'Accrued Leave',
            content: `${request.amountAccruedLeave} days`,
          },
        ]
      : []),
    {
      id: 'reason',
      label: 'Reason for Leave',
      content: request.reasonForLeave || 'Not specified',
      isBlock: true,
    },
    {
      id: 'contact',
      label: 'Contact During Leave',
      content: request.contactDuringLeave || 'Not specified',
    },
  ];

  return (
    <DetailContainer>
      {request?.leaveNumber && (
        <h1 className="text-center text-lg font-extrabold p-3">{request?.leaveNumber}</h1>
      )}

      <div
        className={`flex flex-col gap-3 w-full ${
          !requestId ? 'text-sm' : 'text-sm md:text-base'
        } mb-3 break-words`}
      >
        {leaveDetails.map(item => (
          <div key={item.id} className={item.isBlock ? 'whitespace-pre-line' : ''}>
            <h2 className="text-sm font-extrabold uppercase mb-1">{item.label}:</h2>
            <p>{item.content}</p>
          </div>
        ))}

        {request.leaveCover && (
          <div>
            <h2 className="text-sm font-extrabold uppercase mb-1">Leave Cover:</h2>
            {request.leaveCover.nameOfCover && (
              <p>Name of Cover: {request.leaveCover.nameOfCover}</p>
            )}
            {request.leaveCover.signature && <p>Signature: {request.leaveCover.signature}</p>}
          </div>
        )}
      </div>

      {/* Approval Chain Section */}
      {/* <div className="w-fit mt-4 border-t border-gray-300 pt-4 space-y-2">
        <p className={`${!requestId ? "text-sm" : "text-sm md:text-base"}`}>
          <span className="font-bold mr-1 uppercase">Staff:</span>
          {request?.staff_name}
        </p>

        <p className={`${!requestId ? "text-sm" : "text-sm md:text-base"}`}>
          <span className="font-bold mr-1 uppercase">Role:</span>
          {request?.staff_role}
        </p>

        {request.reviewedBy && (
          <>
            <p className={`${!requestId ? "text-sm" : "text-sm md:text-base"}`}>
              <span className="font-bold mr-1 uppercase">Reviewed By:</span>
              {`${request?.reviewedBy?.firstName} ${request?.reviewedBy?.lastName}`}
            </p>
            <p className={`${!requestId ? "text-sm" : "text-sm md:text-base"}`}>
              <span className="font-bold mr-1 uppercase">Reviewer Role:</span>
              {request?.reviewedBy?.role}
            </p>
          </>
        )}

        {request.approvedBy && (
          <>
            <p className={`${!requestId ? "text-sm" : "text-sm md:text-base"}`}>
              <span className="font-bold mr-1 uppercase">Approved By:</span>
              {`${request?.approvedBy?.firstName} ${request?.approvedBy?.lastName}`}
            </p>
            <p className={`${!requestId ? "text-sm" : "text-sm md:text-base"}`}>
              <span className="font-bold mr-1 uppercase">Approver Role:</span>
              {request?.approvedBy?.role}
            </p>
          </>
        )}
      </div> */}

      {/* <SystemInfo request={request} /> */}
      {/* File Attachments Section */}
      <FileAttachmentContainer
        modelName="Leave"
        id={request.id}
        status={request.status}
        canManage={true}
      />
    </DetailContainer>
  );
};
