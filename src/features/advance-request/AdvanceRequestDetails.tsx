import { useParams } from 'react-router-dom';
import { IAdvanceRequest, IItemGroup } from '../../interfaces';
import { formatToDDMMYYYY } from '@/utils/formatToDDMMYYYY';
import RequestItemsTable from '@/components/custom/RequestItemsTable';
import FileAttachmentContainer from '@/components/custom/FileAttachmentContainer';
import CopiedTo from '@/components/custom/CopiedTo';
import DetailContainer from '@/components/custom/DetailContainer';
import { localStorageUser } from '@/utils/localStorageUser';
interface RequestDetailsProps {
  request: IAdvanceRequest;
}

// Improved Mobile-friendly alternative table view

export const AdvanceRequestDetails = ({ request }: RequestDetailsProps) => {
  const { requestId } = useParams();
  const currentUser = localStorageUser();

  // Determine if user can manage files (creator or admin)
  const canManageFiles =
    currentUser?.role === 'SUPER-ADMIN' || request.createdBy?.id === currentUser?.id;
  const rowData = [
    {
      id: 'accountCode',
      label: 'Account Code :',
      content: request.accountCode,
    },
    {
      id: 'department',
      label: 'Department :',
      content: request.department,
    },
    {
      id: 'expenseChargedTo',
      label: 'Charged To :',
      content: request.expenseChargedTo,
    },
    {
      id: 'address',
      label: 'Address :',
      content: request.address,
    },
    {
      id: 'city',
      label: 'City :',
      content: request.city,
    },
    {
      id: 'finalDeliveryPoint',
      label: 'Delivery Point :',
      content: request.finalDeliveryPoint,
    },
    {
      id: 'periodOfActivity',
      label: 'Period Of Activity :',
      content: `${formatToDDMMYYYY(
        request.periodOfActivity.from
      )} - ${formatToDDMMYYYY(request.periodOfActivity.to)}`,
    },
    {
      id: 'activityDescription',
      label: 'Activity Description :',
      content: request.activityDescription,
    },
  ];

  const accCardData = [
    { label: 'Account Name', value: request.accountName },
    { label: 'Account Number', value: request.accountNumber },
    { label: 'Bank Name', value: request.bankName },
  ];

  return (
    <DetailContainer>
      {/* Request Details Section */}
      {request?.arNumber && (
        <h1 className="text-center sm:text-lg font-extrabold pb-3 md:p-6">{request?.arNumber}</h1>
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
              className="w-full md:w-fit border-b-2 md:border-b-0 text-xs sm:text-sm  flex flex-col md:flex-row gap-1 pb-2 md:pb-0"
            >
              <span className="font-bold uppercase whitespace-nowrap text-gray-700 mb-1 md:mb-0">
                {data.label}
              </span>
              <span className="break-words">{data.content}</span>
            </div>
          ))}
        </div>

        <div className="w-full h-fit border border-gray-200 space-y-4 shadow-sm p-4 md:p-5 rounded-lg bg-gray-50">
          <h2 className="text-sm sm:text-base font-bold text-gray-800">RECIPIENTS INFORMATION</h2>

          {accCardData.map(({ label, value }) => (
            <div key={label} className="whitespace-pre-line">
              <h2 className="text-xs sm:text-sm font-bold uppercase mb-1 text-gray-600">
                {label}:
              </h2>
              <p className="text-xs sm:text-sm text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-center text-base md:text-lg font-semibold tracking-widest mb-4">ITEMS</h2>

      {/* Show mobile table on small screens, desktop table on larger screens */}
      <RequestItemsTable items={request.itemGroups as IItemGroup[]} type="advance" />

      {/* File Attachments Section */}
      <FileAttachmentContainer
        modelName="AdvanceRequest"
        id={request.id}
        status={request.status}
        canManage={canManageFiles}
      />

      {/* Copied To */}
      {request.copiedTo?.length > 0 && <CopiedTo to={request.copiedTo!} />}
    </DetailContainer>
  );
};
