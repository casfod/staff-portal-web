import { AdvanceRequestType } from "../../interfaces";
import { localStorageUser } from "../../utils/localStorageUser";
import StatusBadge from "../../ui/StatusBadge";
import { dateformat } from "../../utils/dateFormat";
import { moneyFormat } from "../../utils/moneyFormat";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import { AdvanceRequestDetails } from "./AdvanceRequestDetails";
import TableRowMain from "../../ui/TableRowMain";
import ActionIcons from "../../ui/ActionIcons";
import TableData from "../../ui/TableData";

type Props = {
  request: AdvanceRequestType;
  visibleItems: { [key: string]: boolean };
  toggleViewItems: (id: string) => void;
  handleEdit: (request: AdvanceRequestType) => void;
  handleDelete: (id: string) => void;
  handleAction: (request: AdvanceRequestType) => void;
};

const AdvanceRequestTableRow = ({
  request,
  visibleItems,
  toggleViewItems,
  handleEdit,
  handleDelete,
  handleAction,
}: Props) => {
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
    { id: "department", content: request.department },
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
        <tr key={`${requestId}-details`} className="rounded-lg">
          <td
            colSpan={6}
            className="w-full h-10 bg-[#F8F8F8] border border-gray-300 px-6 py-4 rounded-lg shadow-sm"
          >
            <AdvanceRequestDetails request={request} />
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

export default AdvanceRequestTableRow;
