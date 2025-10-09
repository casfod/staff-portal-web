import { GoodsReceivedType } from "../../interfaces";
import { localStorageUser } from "../../utils/localStorageUser";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import TableRowMain from "../../ui/TableRowMain";
import ActionIcons from "../../ui/ActionIcons";
import TableData from "../../ui/TableData";
import { GRNDetails } from "./GRNDetails";
import { truncateText } from "../../utils/truncateText";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";

const GRNTableRow = ({
  grn,
  visibleItems,
  toggleViewItems,
  handleEdit,
  handleDelete,
  handleAction,
}: {
  grn: GoodsReceivedType;
  visibleItems: { [key: string]: boolean };
  toggleViewItems: (id: string) => void;
  handleEdit: (grn: GoodsReceivedType) => void;
  handleDelete?: (id: string) => void;
  handleAction: (grn: GoodsReceivedType) => void;
}) => {
  const currentUser = localStorageUser();

  const isEditable =
    (currentUser.role === "SUPER-ADMIN" ||
      currentUser.procurementRole.canUpdate) &&
    !grn.isCompleted;

  const isDeletable =
    (currentUser.role === "SUPER-ADMIN" ||
      currentUser.procurementRole.canDelete) &&
    !grn.isCompleted;

  const grnId = grn.id ?? "";
  const isVisible = !!visibleItems[grnId];

  // const purchaseOrder =
  //   typeof grn.purchaseOrder === "object" ? grn.purchaseOrder : null;
  // const vendorName = purchaseOrder?.selectedVendor?.businessName || "N/A";

  const receivedItems = grn.GRNitems.filter(
    (item) => item.isFullyReceived
  ).length;
  const totalItems = grn.GRNitems.length;

  const rowData = [
    {
      id: "grnCode",
      content: truncateText(grn.GRDCode, 20),
    },
    // {
    //   id: "purchaseOrder",
    //   content: purchaseOrder?.POCode || "N/A",
    // },
    {
      id: "status",
      content: (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            grn.isCompleted
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {grn.isCompleted ? "COMPLETED" : "IN PROGRESS"}
        </span>
      ),
    },
    {
      id: "progress",
      content: `${receivedItems}/${totalItems} items`,
    },
    {
      id: "createdAt",
      content: formatToDDMMYYYY(grn.createdAt),
    },
    {
      id: "actions",
      content: (
        <ActionIcons
          isEditable={isEditable}
          isDeletable={isDeletable}
          requestId={grnId}
          visibleItems={visibleItems}
          onToggleView={toggleViewItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
          request={grn}
        />
      ),
    },
  ];

  return (
    <>
      <TableRowMain
        key={grnId}
        requestId={grnId}
        toggleViewItems={toggleViewItems}
      >
        {rowData.map(({ id, content }) => (
          <TableData key={`${grnId}-${id}`}>{content}</TableData>
        ))}
      </TableRowMain>

      {isVisible && (
        <tr key={`${grnId}-details`} className="max-w-full rounded-lg">
          <td
            colSpan={6}
            className="w-full h-10 bg-[#F8F8F8] border border-gray-300 px-6 py-4 rounded-lg shadow-sm"
          >
            <GRNDetails grn={grn} />
            <RequestCommentsAndActions
              request={grn}
              handleAction={handleAction}
            />
          </td>
        </tr>
      )}
    </>
  );
};

export default GRNTableRow;
