import { VendorType } from "../../interfaces";
import { localStorageUser } from "../../utils/localStorageUser";
// import { dateformat } from "../../utils/dateFormat";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import TableRowMain from "../../ui/TableRowMain";
import ActionIcons from "../../ui/ActionIcons";
import TableData from "../../ui/TableData";
import { VendorDetails } from "./VendorDetails";
import { truncateText } from "../../utils/truncateText";

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

  const isEditable = currentUser.role === "SUPER-ADMIN";

  const vendorId = vendor.id ?? "";
  // const vendorCreatedAt = vendor.createdAt ?? "";

  const isVisible = !!visibleItems[vendorId];

  const rowData = [
    { id: "businessName", content: truncateText(vendor.businessName, 40) },
    { id: "vendorCode", content: vendor.vendorCode },
    { id: "category", content: vendor.category || "N/A" },
    { id: "contactPerson", content: vendor.contactPerson },
    {
      id: "actions",
      content: (
        <ActionIcons
          isEditable={isEditable}
          requestId={vendorId}
          visibleItems={visibleItems}
          onToggleView={toggleViewItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
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
