// components/payment-vouchers/PaymentVoucherTableRow.tsx
import { PaymentVoucherType } from "../../interfaces";
import { localStorageUser } from "../../utils/localStorageUser";
import StatusBadge from "../../ui/StatusBadge";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import { moneyFormat } from "../../utils/moneyFormat";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import { PaymentVoucherDetails } from "./PaymentVoucherDetails";
import ActionIcons from "../../ui/ActionIcons";
import TableRowMain from "../../ui/TableRowMain";
import TableData from "../../ui/TableData";

const PaymentVoucherTableRow = ({
  voucher,
  visibleItems,
  toggleViewItems,
  handleEdit,
  handleDelete,
  handleAction,
}: {
  voucher: PaymentVoucherType;
  visibleItems: { [key: string]: boolean };
  toggleViewItems: (id: string) => void;
  handleEdit: (voucher: PaymentVoucherType) => void;
  handleDelete: (id: string) => void;
  handleAction: (voucher: PaymentVoucherType) => void;
}) => {
  const currentUser = localStorageUser();

  const voucherId = voucher.id ?? "";
  const voucherStatus = voucher.status ?? "pending";
  const voucherCreatedAt = voucher.createdAt ?? "";
  const createdById = voucher.createdBy?.id;

  const isVisible = !!visibleItems[voucherId];

  const isEditable =
    (voucherStatus === "draft" || voucherStatus === "rejected") &&
    createdById === currentUser?.id;

  const rowData = [
    { id: "pvNumber", content: voucher.pvNumber },
    { id: "status", content: <StatusBadge status={voucher.status!} /> },
    { id: "payTo", content: voucher.payTo },
    { id: "amount", content: moneyFormat(voucher.netAmount, "NGN") },
    { id: "date", content: formatToDDMMYYYY(voucherCreatedAt) },
    {
      id: "actions",
      content: (
        <ActionIcons
          isEditable={isEditable}
          requestId={voucherId}
          visibleItems={visibleItems}
          onToggleView={toggleViewItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
          request={voucher}
        />
      ),
    },
  ];

  return (
    <>
      <TableRowMain
        key={voucherId}
        requestId={voucherId}
        toggleViewItems={toggleViewItems}
      >
        {rowData.map(({ id, content }) => (
          <TableData key={`${voucherId}-${id}`}>{content}</TableData>
        ))}
      </TableRowMain>

      {isVisible && (
        <tr key={`${voucherId}-details`} className="max-w-full rounded-lg">
          <td
            colSpan={6}
            className={`w-full h-10 bg-[#F8F8F8] border border-gray-300 px-6 py-4 rounded-lg shadow-sm`}
          >
            <PaymentVoucherDetails voucher={voucher} />
            <RequestCommentsAndActions
              request={voucher}
              handleAction={handleAction}
            />
          </td>
        </tr>
      )}
    </>
  );
};

export default PaymentVoucherTableRow;
