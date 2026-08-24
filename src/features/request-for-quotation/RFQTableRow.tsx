// features/RFQ/RFQTableRow.tsx
import { IRFQ, TableHeaderConfig } from '../../interfaces';
import { localStorageUser } from '../../utils/localStorageUser';
import { truncateText } from '../../utils/truncateText';

// Custom Components
import { BaseTableRow } from '../../components/custom/BaseTableRow';
import ActionIcons from '../../components/custom/ActionIcons';
import { RFQDetails } from './RFQDetails';
import RFQCard from './RFQCard';
import StatusBadge from '@/components/custom/StatusBadge';
import RequestCommentsAndActions from '../../components/custom/RequestCommentsAndActions';

interface RFQTableRowProps {
  rfq: IRFQ;
  handleEdit: (rfq: IRFQ) => void;
  handleDelete: (id: string) => void;
  handleAction: (rfq: IRFQ) => void;
  tableHeadData?: TableHeaderConfig[];
}

const RFQTableRow = ({ rfq, handleEdit, handleDelete, handleAction }: RFQTableRowProps) => {
  const currentUser = localStorageUser();

  const rfqId = rfq.id ?? '';
  const rfqStatus = rfq.status ?? '';

  const isEditable =
    (currentUser.role === 'SUPER-ADMIN' || currentUser.procurementRole?.canUpdate) &&
    rfqStatus !== 'sent' &&
    rfqStatus !== 'cancelled';

  const isDeletable =
    (currentUser.role === 'SUPER-ADMIN' || currentUser.procurementRole?.canDelete) &&
    rfqStatus !== 'sent' &&
    rfqStatus !== 'cancelled';

  // Define row data for the table
  const rowData = [
    {
      id: 'rfqTitle',
      content: truncateText(rfq.rfqTitle, 40),
      showOnMobile: true,
    },
    {
      id: 'rfqCode',
      content: rfq.rfqCode,
      showOnMobile: true,
    },
    {
      id: 'status',
      content: <StatusBadge status={rfq.status} />,
      showOnMobile: true,
    },
    {
      id: 'actions',
      content: (
        <ActionIcons
          isEditable={isEditable}
          isDeletable={isDeletable}
          requestId={rfqId}
          onEdit={() => handleEdit(rfq)}
          onDelete={() => handleDelete(rfqId)}
          request={rfq}
          variant="list"
        />
      ),
      showOnMobile: true,
    },
  ];

  // Expanded content when row is expanded
  const expandedContent = (
    <>
      <RFQDetails rfq={rfq} />
      <div className="mt-4 pt-4 border-t border-gray-200">
        <RequestCommentsAndActions request={rfq} handleAction={handleAction} />
      </div>
    </>
  );

  // Mobile card for small screens
  const mobileCard = (
    <RFQCard
      rfq={rfq}
      actionIconsProps={{
        isEditable,
        isDeletable,
        requestId: rfqId,
        onEdit: handleEdit,
        onDelete: handleDelete,
        request: rfq,
        variant: 'list',
      }}
      context="list"
      className="sm:hidden"
    />
  );

  return (
    <BaseTableRow
      id={rfqId}
      rowData={rowData}
      expandedContent={expandedContent}
      mobileCard={mobileCard}
      isExpandable={true}
    />
  );
};

export default RFQTableRow;
