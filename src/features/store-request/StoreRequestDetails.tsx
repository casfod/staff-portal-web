import DetailContainer from '../../components/custom/DetailContainer';
import FileAttachmentContainer from '../../components/custom/FileAttachmentContainer';
import CopiedTo from '../../components/custom/CopiedTo';
import { IStoreRequest, IUser } from '../../interfaces';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import { getUserFullName } from '../../utils/getUserFullName';
import { localStorageUser } from '../../utils/localStorageUser';

interface StoreRequestDetailsProps {
  request: IStoreRequest;
}

const StoreRequestDetails = ({ request }: StoreRequestDetailsProps) => {
  const currentUser = localStorageUser();
  const createdById =
    typeof request.createdBy === 'string' ? request.createdBy : request.createdBy?.id;
  const canManageFiles =
    currentUser?.role === 'SUPER-ADMIN' || createdById === currentUser?.id;

  const details = [
    { label: 'Request Code', value: request.srCode || 'N/A' },
    { label: 'Request Type', value: request.requestType || 'N/A' },
    { label: 'Destination', value: request.destination || 'N/A' },
    {
      label: 'Warehouse',
      value: `${request.warehouse || 'N/A'}${request.warehouseCode ? ` (${request.warehouseCode})` : ''}`,
    },
    { label: 'Requested By', value: getUserFullName(request.createdBy) },
    { label: 'Recipient', value: getUserFullName(request.recipient) },
    { label: 'Warehouse Officer', value: getUserFullName(request.warehouseOfficer) },
    { label: 'Assigned Driver', value: request.assignedDriver || 'N/A' },
    {
      label: 'Date of Request',
      value: request.requestedAt ? formatToDDMMYYYY(request.requestedAt) : 'N/A',
    },
    {
      label: 'Date of Dispatch',
      value: request.dispatchDate ? formatToDDMMYYYY(request.dispatchDate) : 'N/A',
    },
  ];

  return (
    <DetailContainer>
      {request.srCode && (
        <h2 className="pb-3 text-center text-lg font-extrabold md:p-6">{request.srCode}</h2>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 border-b border-gray-300 pb-6 md:grid-cols-2 md:gap-6">
        {details.map(detail => (
          <div
            key={detail.label}
            className="flex w-full flex-col gap-1 border-b-2 pb-2 text-xs sm:text-sm md:w-fit md:flex-row md:border-b-0 md:pb-0"
          >
            <span className="mb-1 whitespace-nowrap font-bold uppercase text-gray-700 md:mb-0">
              {detail.label}:
            </span>
            <span className="break-words capitalize">{detail.value}</span>
          </div>
        ))}
      </div>

      <h3 className="mb-4 text-center text-base font-semibold tracking-widest md:text-lg">
        REQUESTED ITEMS
      </h3>
      {request.items?.length ? (
        <div className="mb-6 overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-3 py-2">Item</th>
                <th className="px-3 py-2">Department</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Frequency</th>
                <th className="px-3 py-2">Quantity</th>
                <th className="px-3 py-2">Unit</th>
                <th className="px-3 py-2">Dispatch Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {request.items.map((item, index) => (
                <tr key={`${item.itemName}-${index}`}>
                  <td className="px-3 py-2 font-medium text-gray-900">{item.itemName || 'N/A'}</td>
                  <td className="px-3 py-2 text-gray-600">{item.department || '—'}</td>
                  <td className="px-3 py-2 text-gray-600">{item.description || '—'}</td>
                  <td className="px-3 py-2 text-gray-600">{item.frequency}</td>
                  <td className="px-3 py-2 text-gray-600">{item.quantity}</td>
                  <td className="px-3 py-2 text-gray-600">{item.unit || '—'}</td>
                  <td className="px-3 py-2 text-gray-600">{item.dispatchRemarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mb-6 text-center text-sm text-gray-500">No items found.</p>
      )}

      <FileAttachmentContainer
        modelName="StoreRequests"
        id={request.id}
        status={request.status}
        canManage={canManageFiles}
      />

      {request.copiedTo?.length ? <CopiedTo to={request.copiedTo as IUser[]} /> : null}
    </DetailContainer>
  );
};

export default StoreRequestDetails;