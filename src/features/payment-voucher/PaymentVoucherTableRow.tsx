// features/payment-voucher/PaymentVoucherTableRow.tsx
import { IPaymentVoucher, TableHeaderConfig } from '../../interfaces';
import { localStorageUser } from '../../utils/localStorageUser';
import StatusBadge from '../../components/custom/StatusBadge';
import { formatToDDMMYYYY } from '../../utils/formatToDDMMYYYY';
import { moneyFormat } from '../../utils/moneyFormat';
import RequestCommentsAndActions from '../../components/custom/RequestActions';
import { PaymentVoucherDetails } from './PaymentVoucherDetails';
import ActionIcons from '../../components/custom/ActionIcons';
import { BaseTableRow } from '../../components/custom/BaseTableRow';
import PaymentVoucherCard from './PaymentVoucherCard';

interface PaymentVoucherTableRowProps {
  voucher: IPaymentVoucher;
  handleEdit: (voucher: IPaymentVoucher) => void;
  handleDelete: (id: string) => void;
  handleAction: (voucher: IPaymentVoucher) => void;
  tableHeadData?: TableHeaderConfig[];
}

const PaymentVoucherTableRow = ({
  voucher,
  handleEdit,
  handleDelete,
  handleAction,
}: PaymentVoucherTableRowProps) => {
  const currentUser = localStorageUser();

  const voucherId = voucher.id ?? '';
  const voucherStatus = voucher.status ?? 'pending';
  const createdById = voucher.createdBy?.id;

  const isEditable =
    (voucherStatus === 'draft' || voucherStatus === 'rejected') && createdById === currentUser?.id;

  const isDeletable =
    (voucherStatus === 'draft' || voucherStatus === 'rejected') && createdById === currentUser?.id;

  // Define row data for the table
  const rowData = [
    {
      id: 'pvNumber',
      content: voucher.pvNumber,
      showOnMobile: true,
    },
    {
      id: 'status',
      content: <StatusBadge status={voucher.status!} />,
      showOnMobile: true,
    },
    {
      id: 'payTo',
      content: voucher.payTo,
      showOnMobile: true,
    },
    {
      id: 'amount',
      content: moneyFormat(voucher.netAmount, 'NGN'),
      showOnMobile: true,
    },
    {
      id: 'date',
      content: formatToDDMMYYYY(voucher.createdAt),
      showOnMobile: false,
      showOnTablet: true,
    },
    {
      id: 'actions',
      content: (
        <ActionIcons
          isEditable={isEditable}
          isDeletable={isDeletable}
          requestId={voucherId}
          onEdit={() => handleEdit(voucher)}
          onDelete={() => handleDelete(voucherId)}
          request={voucher}
          variant="list"
        />
      ),
      showOnMobile: true,
    },
  ];

  // Expanded content when row is expanded
  const expandedContent = (
    <>
      <PaymentVoucherDetails voucher={voucher} />
      <div className="mt-4 pt-4 border-t border-gray-200">
        <RequestCommentsAndActions request={voucher} handleAction={handleAction} />
      </div>
    </>
  );

  // Mobile card for small screens
  const mobileCard = (
    <PaymentVoucherCard
      paymentVoucher={voucher}
      actionIconsProps={{
        isEditable,
        isDeletable,
        requestId: voucherId,
        onEdit: () => handleEdit(voucher),
        onDelete: () => handleDelete(voucherId),
        request: voucher,
        variant: 'list',
      }}
      context="list"
      className="sm:hidden"
    />
  );

  return (
    <BaseTableRow
      id={voucherId}
      rowData={rowData}
      expandedContent={expandedContent}
      mobileCard={mobileCard}
      isExpandable={true}
    />
  );
};

export default PaymentVoucherTableRow;
