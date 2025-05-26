import { PurChaseRequestType } from "../../interfaces";
import { localStorageUser } from "../../utils/localStorageUser";
import StatusBadge from "../../ui/StatusBadge";
import { dateformat } from "../../utils/dateFormat";
import { moneyFormat } from "../../utils/moneyFormat";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import { PurchaseRequestDetails } from "./PurchaseRequestDetails";
import ActionIcons from "../../ui/ActionIcons";
import TableRowMain from "../../ui/TableRowMain";
import TableData from "../../ui/TableData";

const PurchaseRequestTableRow = ({
  request,
  visibleItems,
  toggleViewItems,
  handleEdit,
  handleDelete,
  handleAction,
}: {
  request: PurChaseRequestType;
  visibleItems: { [key: string]: boolean };
  toggleViewItems: (id: string) => void;
  handleEdit: (request: PurChaseRequestType) => void;
  handleDelete: (id: string) => void;
  handleAction: (request: PurChaseRequestType) => void;
}) => {
  const currentUser = localStorageUser();

  const requestId = request.id ?? "";
  const requestStatus = request.status ?? "pending";
  const requestCreatedAt = request.createdAt ?? "";
  const requestedById = request.createdBy?.id;

  const isVisible = !!visibleItems[requestId];

  const isEditable =
    (requestStatus === "draft" || requestStatus === "rejected") &&
    requestedById === currentUser?.id;

  const totalAmount =
    request.itemGroups?.reduce((sum, item) => sum + item.total, 0) ?? 0;

  const rowData = [
    { id: "requestedBy", content: request.requestedBy },
    { id: "status", content: <StatusBadge status={request.status!} /> },
    // { id: "department", content: request.department },
    { id: "amount", content: moneyFormat(totalAmount, "NGN") },
    { id: "date", content: dateformat(requestCreatedAt) },
    {
      id: "actions",
      content: (
        <ActionIcons
          isEditable={isEditable}
          requestId={requestId}
          visibleItems={visibleItems}
          onToggleView={toggleViewItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
          request={request}
        />
      ),
    },
  ];

  return (
    <>
      <TableRowMain
        key={requestId}
        requestId={requestId}
        toggleViewItems={toggleViewItems}
      >
        {rowData.map(({ id, content }) => (
          <TableData key={`${requestId}-${id}`}>{content}</TableData>
        ))}
      </TableRowMain>

      {isVisible && (
        <tr key={`${requestId}-details`} className="max-w-full rounded-lg">
          <td
            colSpan={6}
            className={`w-full h-10 bg-[#F8F8F8] border border-gray-300 px-6 py-4 rounded-lg shadow-sm`}
          >
            <PurchaseRequestDetails request={request} />
            <RequestCommentsAndActions
              request={request}
              handleAction={handleAction}
            />
          </td>
        </tr>
      )}
    </>
  );
};

export default PurchaseRequestTableRow;
