import { IStoreRequest } from '../../interfaces';
import { BaseTableRow } from '../../components/custom/BaseTableRow';
import StatusBadge from '@/components/custom/StatusBadge';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';

interface StoreRequestTableRowProps {
  request: IStoreRequest;
}

const getUserName = (user?: Partial<{ firstName: string; lastName: string }> | string) => {
  if (!user) return 'N/A';
  if (typeof user === 'string') return user;
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || 'N/A';
};

const StoreRequestTableRow = ({ request }: StoreRequestTableRowProps) => {
  const createdBy = getUserName(request.createdBy);
  const recipient = getUserName(request.recipient);
  const warehouseOfficer = getUserName(request.warehouseOfficer);
  const requestDate = request.requestedAt || request.createdAt;

  const rowData = [
    { id: 'name', content: createdBy, showOnMobile: true },
    {
      id: 'type',
      content: <span className="capitalize">{request.requestType || 'N/A'}</span>,
      showOnMobile: true,
    },
    { id: 'code', content: request.srCode || 'N/A', showOnMobile: true },
    { id: 'status', content: <StatusBadge status={request.status} />, showOnMobile: true },
    {
      id: 'date',
      content: formatToDDMMYYYY(requestDate),
      showOnMobile: false,
      showOnTablet: true,
    },
  ];

  const expandedContent = (
    <div className="space-y-5">
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Destination</dt>
          <dd className="mt-1 text-sm text-gray-900">{request.destination || 'N/A'}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Warehouse</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {request.warehouse || 'N/A'}{request.warehouseCode ? ` (${request.warehouseCode})` : ''}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Recipient</dt>
          <dd className="mt-1 text-sm text-gray-900">{recipient}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Warehouse Officer</dt>
          <dd className="mt-1 text-sm text-gray-900">{warehouseOfficer}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Dispatch Date</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {request.dispatchDate ? formatToDDMMYYYY(request.dispatchDate) : 'N/A'}
          </dd>
        </div>
        {request.assignedDriver && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Assigned Driver</dt>
            <dd className="mt-1 text-sm text-gray-900">{request.assignedDriver}</dd>
          </div>
        )}
      </dl>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-900">Requested Items</h3>
        {request.items?.length ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-3 py-2">Item</th>
                  <th className="px-3 py-2">Description</th>
                  <th className="px-3 py-2">Quantity</th>
                  <th className="px-3 py-2">Unit</th>
                  <th className="px-3 py-2">Department</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {request.items.map((item, index) => (
                  <tr key={`${item.itemName}-${index}`}>
                    <td className="px-3 py-2 font-medium text-gray-900">{item.itemName || 'N/A'}</td>
                    <td className="px-3 py-2 text-gray-600">{item.description || '—'}</td>
                    <td className="px-3 py-2 text-gray-600">{item.quantity}</td>
                    <td className="px-3 py-2 text-gray-600">{item.unit || '—'}</td>
                    <td className="px-3 py-2 text-gray-600">{item.department || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No items listed.</p>
        )}
      </div>
    </div>
  );

  const mobileCard = (
    <div className="space-y-2 px-4 py-3 sm:hidden">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-gray-900">{createdBy}</span>
        <StatusBadge status={request.status} />
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
        <span className="capitalize">{request.requestType}</span>
        <span>{request.srCode || 'N/A'}</span>
        <span>{formatToDDMMYYYY(requestDate)}</span>
      </div>
    </div>
  );

  return (
    <BaseTableRow
      id={request.id}
      rowData={rowData}
      expandedContent={expandedContent}
      mobileCard={mobileCard}
      isExpandable
    />
  );
};

export default StoreRequestTableRow;