// src/features/purchase-request/PurchaseRequestDetails.tsx
import { IItemGroup, IPurchaseRequest } from '../../interfaces';
import { useParams } from 'react-router-dom';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import FileAttachmentContainer from '../../components/custom/FileAttachmentContainer';
import DetailContainer from '../../components/custom/DetailContainer';
import CopiedTo from '../../components/custom/CopiedTo';
import RequestItemsTable from '../../components/custom/RequestItemsTable';
import { localStorageUser } from '../../utils/localStorageUser';

interface RequestDetailsProps {
  request: IPurchaseRequest;
}

export const PurchaseRequestDetails = ({ request }: RequestDetailsProps) => {
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
      id: 'suggestedSupplier',
      label: 'Suggested Supplier :',
      content: request.suggestedSupplier,
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

  return (
    <DetailContainer>
      {/* Purchase Request Details Section */}
      {request?.pcrNumber && (
        <h1 className="text-center text-lg font-extrabold p-4 md:p-6">{request?.pcrNumber}</h1>
      )}

      <div
        className={`w-full ${
          !requestId ? 'text-sm' : 'text-sm md:text-base'
        } mb-6 border-b border-gray-300 pb-6`}
      >
        <div className="flex flex-col items-start gap-3 md:gap-4 w-full">
          {rowData.map(data => (
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

      <h2 className="text-center text-base md:text-lg font-semibold tracking-widest mb-4">ITEMS</h2>

      {/* Show mobile table on small screens, desktop table on larger screens */}
      <RequestItemsTable items={request.itemGroups as IItemGroup[]} type="purchase" />

      {/* ✅ FIXED: Use correct props for FileAttachmentContainer */}
      <FileAttachmentContainer
        modelName="PurchaseRequest"
        id={request.id}
        status={request.status}
        canManage={canManageFiles}
      />

      {/* Copied To */}
      {request.copiedTo?.length > 0 && <CopiedTo to={request.copiedTo!} />}
    </DetailContainer>
  );
};
