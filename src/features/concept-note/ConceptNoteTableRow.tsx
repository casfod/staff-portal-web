import { ConceptNoteType } from "../../interfaces";
import { localStorageUser } from "../../utils/localStorageUser";
import StatusBadge from "../../ui/StatusBadge";
import { dateformat } from "../../utils/dateFormat";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import { ConceptNoteDetails } from "./ConceptNoteDetails";
import TableRowMain from "../../ui/TableRowMain";
import ActionIcons from "../../ui/ActionIcons";
import TableData from "../../ui/TableData";
// import { truncateText } from "../../utils/truncateText";

const ConceptNoteTableRow = ({
  request,
  visibleItems,
  toggleViewItems,
  handleEdit,
  handleDelete,
  handleAction,
}: {
  request: ConceptNoteType;
  visibleItems: { [key: string]: boolean };
  toggleViewItems: (id: string) => void;
  handleEdit: (request: ConceptNoteType) => void;
  handleDelete: (id: string) => void;
  handleAction: (request: ConceptNoteType) => void;
}) => {
  const currentUser = localStorageUser();

  const requestId = request.id ?? "";
  const requestStatus = request.status ?? "pending";
  const requestCreatedAt = request.createdAt ?? "";
  const requestedById = request.preparedBy?.id;

  const isVisible = !!visibleItems[requestId];

  const isEditable =
    (requestStatus === "draft" || requestStatus === "rejected") &&
    requestedById === currentUser?.id;

  const rowData = [
    { id: "staff_name", content: request.staff_name },
    { id: "status", content: <StatusBadge status={request.status!} /> },
    // { id: "account_Code", content: truncateText(request.account_Code, 25) },
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
            <ConceptNoteDetails request={request} />
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

export default ConceptNoteTableRow;
