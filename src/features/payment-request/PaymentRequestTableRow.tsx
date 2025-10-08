import { PaymentRequestType } from "../../interfaces";
import { localStorageUser } from "../../utils/localStorageUser";
import StatusBadge from "../../ui/StatusBadge";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import { moneyFormat } from "../../utils/moneyFormat";

import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import PaymentRequestDetails from "./PaymentRequestDetails";
import TableRowMain from "../../ui/TableRowMain";
import ActionIcons from "../../ui/ActionIcons";
import TableData from "../../ui/TableData";

interface PaymentRequestTableRowProps {
  request: PaymentRequestType;
  visibleItems: Record<string, boolean>;
  toggleViewItems: (id: string) => void;
  handleEdit: (request: PaymentRequestType) => void;
  handleDelete: (id: string) => void;
  handleAction: (request: PaymentRequestType) => void;
}

const PaymentRequestTableRow = ({
  request,
  visibleItems,
  toggleViewItems,
  handleEdit,
  handleDelete,
  handleAction,
}: PaymentRequestTableRowProps) => {
  const currentUser = localStorageUser();

  const requestId = request.id ?? "";
  const requestStatus = request.status ?? "pending";
  const requestCreatedAt = request.createdAt ?? "";
  const requestedById = request.requestedBy?.id;

  const isVisible = visibleItems[requestId];
  const isEditable =
    (requestStatus === "draft" || requestStatus === "rejected") &&
    requestedById === currentUser?.id;

  const rowData = [
    { id: "requestBy", content: request.requestBy },
    { id: "status", content: <StatusBadge status={request.status!} /> },
    { id: "amount", content: moneyFormat(request.amountInFigure, "NGN") },
    { id: "date", content: formatToDDMMYYYY(requestCreatedAt) },
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
            <PaymentRequestDetails request={request} />
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

export default PaymentRequestTableRow;
