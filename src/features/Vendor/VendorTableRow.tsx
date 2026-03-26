import { VendorType } from "../../interfaces";
import { localStorageUser } from "../../utils/localStorageUser";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import TableRowMain from "../../ui/TableRowMain";
import ActionIcons from "../../ui/ActionIcons";
import TableData from "../../ui/TableData";
import { VendorDetails } from "./VendorDetails";
import { truncateText } from "../../utils/truncateText";
import StatusBadge from "../../ui/StatusBadge";

const VendorTableRow = ({
  vendor,
  visibleItems,
  toggleViewItems,
  handleEdit,
  handleDelete,
  handleAction,
}: {
  vendor: VendorType;
  visibleItems: { [key: string]: boolean };
  toggleViewItems: (id: string) => void;
  handleEdit: (vendor: VendorType) => void;
  handleDelete?: (id: string) => void;
  handleAction: (vendor: VendorType) => void;
}) => {
  const currentUser = localStorageUser();

  const isEditable =
    (vendor.status === "draft" || vendor.status === "rejected") &&
    vendor.createdBy?.id === currentUser?.id;

  // console.log({ isEditable });

  const isDeletable =
    (currentUser.role === "SUPER-ADMIN" ||
      currentUser.procurementRole?.canDelete) &&
    vendor.status !== "approved";

  const vendorId = vendor.id ?? "";
  const isVisible = !!visibleItems[vendorId];

  const rowData = [
    { id: "businessName", content: truncateText(vendor.businessName, 40) },
    { id: "status", content: <StatusBadge status={vendor.status || "N/A"} /> },
    { id: "vendorCode", content: vendor.vendorCode },
    { id: "contactPerson", content: vendor.contactPerson },
    {
      id: "actions",
      content: (
        <ActionIcons
          isEditable={isEditable}
          isDeletable={isDeletable}
          requestId={vendorId}
          visibleItems={visibleItems}
          onToggleView={toggleViewItems}
          onEdit={() => handleEdit(vendor)}
          onDelete={() => handleDelete?.(vendorId)}
          request={vendor}
        />
      ),
    },
  ];

  return (
    <>
      <TableRowMain
        key={vendorId}
        requestId={vendorId}
        toggleViewItems={toggleViewItems}
      >
        {rowData.map(({ id, content }) => (
          <TableData key={`${vendorId}-${id}`}>{content}</TableData>
        ))}
      </TableRowMain>

      {isVisible && (
        <tr key={`${vendorId}-details`} className="max-w-full rounded-lg">
          <td
            colSpan={5}
            className="w-full h-10 bg-[#F8F8F8] border border-gray-300 px-6 py-4 rounded-lg shadow-sm"
          >
            <VendorDetails vendor={vendor} />
            <RequestCommentsAndActions
              request={vendor}
              handleAction={handleAction}
            />
          </td>
        </tr>
      )}
    </>
  );
};

export default VendorTableRow;
