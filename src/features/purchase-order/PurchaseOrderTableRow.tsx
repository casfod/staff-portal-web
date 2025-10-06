import { PurchaseOrderType } from "../../interfaces";
import { localStorageUser } from "../../utils/localStorageUser";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import TableRowMain from "../../ui/TableRowMain";
import ActionIcons from "../../ui/ActionIcons";
import TableData from "../../ui/TableData";
import { PurchaseOrderDetails } from "./PurchaseOrderDetails";
import { truncateText } from "../../utils/truncateText";
import { dateformat } from "../../utils/dateFormat";

const PurchaseOrderTableRow = ({
  purchaseOrder,
  visibleItems,
  toggleViewItems,
  handleEdit,
  handleDelete,
  handleAction,
}: {
  purchaseOrder: PurchaseOrderType;
  visibleItems: { [key: string]: boolean };
  toggleViewItems: (id: string) => void;
  handleEdit: (purchaseOrder: PurchaseOrderType) => void;
  handleDelete?: (id: string) => void;
  handleAction: (purchaseOrder: PurchaseOrderType) => void;
}) => {
  const currentUser = localStorageUser();

  const isEditable =
    (currentUser.role === "SUPER-ADMIN" ||
      currentUser.procurementRole.canUpdate) &&
    purchaseOrder.status === "pending";

  const isDeletable =
    (currentUser.role === "SUPER-ADMIN" ||
      currentUser.procurementRole.canDelete) &&
    purchaseOrder.status === "pending";

  const purchaseOrderId = purchaseOrder.id ?? "";
  const isVisible = !!visibleItems[purchaseOrderId];

  const vendorName =
    purchaseOrder.copiedTo &&
    Array.isArray(purchaseOrder.copiedTo) &&
    purchaseOrder.copiedTo.length > 0
      ? typeof purchaseOrder.copiedTo[0] === "object"
        ? (purchaseOrder.copiedTo[0] as any).businessName
        : "Vendor"
      : "No Vendor";

  const rowData = [
    {
      id: "vendor",
      content: truncateText(vendorName, 20),
    },
    {
      id: "status",
      content: (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            purchaseOrder.status === "approved"
              ? "bg-green-100 text-green-800"
              : purchaseOrder.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {purchaseOrder.status.toUpperCase()}
        </span>
      ),
    },
    // {
    //   id: "RFQTitle",
    //   content: truncateText(purchaseOrder.RFQTitle, 40),
    // },
    // {
    //   id: "RFQCode",
    //   content: purchaseOrder.RFQCode,
    // },

    {
      id: "totalAmount",
      content: `₦${purchaseOrder.totalAmount.toLocaleString()}`,
    },

    {
      id: "createdAt",
      content: dateformat(purchaseOrder?.createdAt!),
    },
    {
      id: "actions",
      content: (
        <ActionIcons
          isEditable={isEditable}
          isDeletable={isDeletable}
          requestId={purchaseOrderId}
          visibleItems={visibleItems}
          onToggleView={toggleViewItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
          request={purchaseOrder}
        />
      ),
    },
  ];

  return (
    <>
      <TableRowMain
        key={purchaseOrderId}
        requestId={purchaseOrderId}
        toggleViewItems={toggleViewItems}
      >
        {rowData.map(({ id, content }) => (
          <TableData key={`${purchaseOrderId}-${id}`}>{content}</TableData>
        ))}
      </TableRowMain>

      {isVisible && (
        <tr
          key={`${purchaseOrderId}-details`}
          className="max-w-full rounded-lg"
        >
          <td
            colSpan={6}
            className="w-full h-10 bg-[#F8F8F8] border border-gray-300 px-6 py-4 rounded-lg shadow-sm"
          >
            <PurchaseOrderDetails purchaseOrder={purchaseOrder} />
            <RequestCommentsAndActions
              request={purchaseOrder}
              handleAction={handleAction}
            />
          </td>
        </tr>
      )}
    </>
  );
};

export default PurchaseOrderTableRow;
