import { RFQType } from "../../interfaces";
import { localStorageUser } from "../../utils/localStorageUser";
// import { dateformat } from "../../utils/dateFormat";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import TableRowMain from "../../ui/TableRowMain";
import ActionIcons from "../../ui/ActionIcons";
import TableData from "../../ui/TableData";
import { RFQDetails } from "./RFQDetails";
import { truncateText } from "../../utils/truncateText";

const RFQTableRow = ({
  rfq,
  visibleItems,
  toggleViewItems,
  handleEdit,
  handleDelete,
  handleAction,
}: {
  rfq: RFQType;
  visibleItems: { [key: string]: boolean };
  toggleViewItems: (id: string) => void;
  handleEdit: (rfq: RFQType) => void;
  handleDelete?: (id: string) => void;
  handleAction: (rfq: RFQType) => void;
}) => {
  const currentUser = localStorageUser();

  // const isEditable =
  //   currentUser.role === "SUPER-ADMIN" || currentUser.procurementRole.canUpdate;
  // const isDeletable =
  //   currentUser.role === "SUPER-ADMIN" ||
  //   (currentUser.procurementRole.canDelete && rfq.status !== "sent");

  const isEditable =
    (currentUser.role === "SUPER-ADMIN" ||
      currentUser.procurementRole.canUpdate) &&
    rfq.status !== "sent" &&
    rfq.status !== "cancelled";

  const isDeletable =
    (currentUser.role === "SUPER-ADMIN" ||
      currentUser.procurementRole.canDelete) &&
    rfq.status !== "sent" &&
    rfq.status !== "cancelled";

  const rfqId = rfq.id ?? "";
  // const rfqCreatedAt = rfq.createdAt ?? "";

  const isVisible = !!visibleItems[rfqId];

  // Calculate total amount
  // const totalAmount = rfq.itemGroups.reduce((sum, item) => sum + item.total, 0);

  const rowData = [
    {
      id: "RFQTitle",
      content: truncateText(rfq.RFQTitle, 40),
    },
    {
      id: "RFQCode",
      content: rfq.RFQCode,
    },
    {
      id: "status",
      content: (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            rfq.status === "sent"
              ? "bg-green-100 text-green-800"
              : rfq.status === "draft"
              ? "bg-yellow-100 text-yellow-800"
              : rfq.status === "preview"
              ? "bg-blue-100 text-blue-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {rfq.status.toUpperCase()}
        </span>
      ),
    },
    // {
    //   id: "deliveryPeriod",
    //   content: rfq.deliveryPeriod || "N/A",
    // },
    {
      id: "actions",
      content: (
        <ActionIcons
          isEditable={isEditable}
          isDeletable={isDeletable}
          requestId={rfqId}
          visibleItems={visibleItems}
          onToggleView={toggleViewItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
          request={rfq}
        />
      ),
    },
  ];

  return (
    <>
      <TableRowMain
        key={rfqId}
        requestId={rfqId}
        toggleViewItems={toggleViewItems}
      >
        {rowData.map(({ id, content }) => (
          <TableData key={`${rfqId}-${id}`}>{content}</TableData>
        ))}
      </TableRowMain>

      {isVisible && (
        <tr key={`${rfqId}-details`} className="max-w-full rounded-lg">
          <td
            colSpan={5}
            className="w-full h-10 bg-[#F8F8F8] border border-gray-300 px-6 py-4 rounded-lg shadow-sm"
          >
            <RFQDetails rfq={rfq} />
            <RequestCommentsAndActions
              request={rfq}
              handleAction={handleAction}
            />
          </td>
        </tr>
      )}
    </>
  );
};

export default RFQTableRow;
