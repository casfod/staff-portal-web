// features/Vendor/VendorTableRow.tsx
import { IVendor, TableHeaderConfig } from '../../interfaces';
import { localStorageUser } from '../../utils/localStorageUser';
// import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import { truncateText } from '../../utils/truncateText';

// Custom Components
import { BaseTableRow } from '../../components/custom/BaseTableRow';
import ActionIcons from '../../components/custom/ActionIcons';
import { VendorDetails } from './VendorDetails';
import VendorCard from './VendorCard';
import StatusBadge from '@/components/custom/StatusBadge';
import RequestCommentsAndActions from '../../components/custom/RequestActions';

interface VendorTableRowProps {
  vendor: IVendor;
  handleEdit: (vendor: IVendor) => void;
  handleDelete: (id: string) => void;
  handleAction: (vendor: IVendor) => void;
  tableHeadData?: TableHeaderConfig[];
}

const VendorTableRow = ({
  vendor,
  handleEdit,
  handleDelete,
  handleAction,
}: VendorTableRowProps) => {
  const currentUser = localStorageUser();

  const vendorId = vendor.id ?? '';
  const vendorStatus = vendor.status ?? '';
  const createdById = vendor.createdBy?.id;

  const isEditable =
    ['draft', 'rejected', 'archived'].includes(vendorStatus) && createdById === currentUser?.id;

  const isDeletable =
    (currentUser.role === 'SUPER-ADMIN' || currentUser.procurementRole?.canDelete) &&
    vendorStatus !== 'approved';

  // const fullDate = formatToDDMMYYYY(vendor.createdAt);

  // Define row data for the table
  const rowData = [
    {
      id: 'businessName',
      content: truncateText(vendor.businessName, 40),
      showOnMobile: true,
    },
    {
      id: 'status',
      content: <StatusBadge status={vendor.status} />,
      showOnMobile: true,
    },
    {
      id: 'vendorCode',
      content: vendor.vendorCode,
      showOnMobile: true,
    },
    {
      id: 'contactPerson',
      content: vendor.contactPerson,
      showOnMobile: false,
      showOnTablet: true,
    },
    {
      id: 'actions',
      content: (
        <ActionIcons
          isEditable={isEditable}
          isDeletable={isDeletable}
          requestId={vendorId}
          onEdit={() => handleEdit(vendor)}
          onDelete={() => handleDelete(vendorId)}
          request={vendor}
          variant="list"
        />
      ),
      showOnMobile: true,
    },
  ];

  // Expanded content when row is expanded
  const expandedContent = (
    <>
      <VendorDetails vendor={vendor} />
      <div className="mt-4 pt-4 border-t border-gray-200">
        <RequestCommentsAndActions request={vendor} handleAction={handleAction} />
      </div>
    </>
  );

  // Mobile card for small screens
  const mobileCard = (
    <VendorCard
      vendor={vendor}
      actionIconsProps={{
        isEditable,
        isDeletable,
        requestId: vendorId,
        onEdit: handleEdit,
        onDelete: handleDelete,
        request: vendor,
        variant: 'list',
      }}
      context="list"
      className="sm:hidden"
    />
  );

  return (
    <BaseTableRow
      id={vendorId}
      rowData={rowData}
      expandedContent={expandedContent}
      mobileCard={mobileCard}
      isExpandable={true}
    />
  );
};

export default VendorTableRow;
