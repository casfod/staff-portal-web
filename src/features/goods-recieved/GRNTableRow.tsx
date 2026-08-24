import { IGoodsReceived, TableHeaderConfig } from '../../interfaces';
import { localStorageUser } from '../../utils/localStorageUser';
import { BaseTableRow } from '../../components/custom/BaseTableRow';
import ActionIcons from '../../components/custom/ActionIcons';
import { GRNDetails } from './GRNDetails';
import { truncateText } from '../../utils/truncateText';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import GRNCard from './GRNCard';
import StatusBadge from '@/components/custom/StatusBadge';
import RequestCommentsAndActions from '@/components/custom/RequestCommentsAndActions';

interface GRNTableRowProps {
  grn: IGoodsReceived;
  handleEdit: (grn: IGoodsReceived) => void;
  handleDelete: (id: string) => void;
  handleAction: (grn: IGoodsReceived) => void;
  tableHeadData?: TableHeaderConfig[];
}

const GRNTableRow = ({
  grn,
  handleEdit,
  handleDelete,
  handleAction,
}: GRNTableRowProps) => {
  const currentUser = localStorageUser();

  const isEditable =
    (currentUser.role === 'SUPER-ADMIN' || currentUser.procurementRole?.canUpdate) &&
    !grn.isCompleted;

  const isDeletable =
    (currentUser.role === 'SUPER-ADMIN' || currentUser.procurementRole?.canDelete) &&
    !grn.isCompleted;

  const grnId = grn.id ?? '';

  const receivedItems = grn.grnItems.filter(item => item.isFullyReceived).length;
  const totalItems = grn.grnItems.length;

  // Define row data for the table
  const rowData = [
    {
      id: 'grnCode',
      content: truncateText(grn.grdCode, 20),
      showOnMobile: true,
    },
    {
      id: 'status',
      content: <StatusBadge status={grn.isCompleted ? 'completed' : 'in-progress'} />,
      showOnMobile: true,
    },
    {
      id: 'progress',
      content: `${receivedItems}/${totalItems} items`,
      showOnMobile: true,
    },
    {
      id: 'createdAt',
      content: formatToDDMMYYYY(grn.createdAt),
      showOnMobile: false,
      showOnTablet: true,
    },
    {
      id: 'actions',
      content: (
        <ActionIcons
          isEditable={isEditable}
          isDeletable={isDeletable}
          requestId={grnId}
          onEdit={() => handleEdit(grn)}
          onDelete={() => handleDelete(grnId)}
          request={grn}
          variant="list"
        />
      ),
      showOnMobile: true,
    },
  ];

  // Expanded content when row is expanded
  const expandedContent = (
    <>
      <GRNDetails grn={grn} />
      <div className="mt-4 pt-4 border-t border-gray-200">
        <RequestCommentsAndActions request={grn} handleAction={handleAction} />
      </div>
    </>
  );

  // Mobile card for small screens
  const mobileCard = (
    <GRNCard
      grn={grn}
      actionIconsProps={{
        isEditable,
        isDeletable,
        requestId: grnId,
        onEdit: () => handleEdit(grn),
        onDelete: () => handleDelete(grnId),
        request: grn,
        variant: 'list',
      }}
      context="list"
      className="sm:hidden"
    />
  );

  return (
    <BaseTableRow
      id={grnId}
      rowData={rowData}
      expandedContent={expandedContent}
      mobileCard={mobileCard}
      isExpandable={true}
    />
  );
};

export default GRNTableRow;
