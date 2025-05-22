import { Project } from "../../interfaces";
import { localStorageUser } from "../../utils/localStorageUser";

import { dateformat } from "../../utils/dateFormat";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
// import { ConceptNoteDetails } from "./ConceptNoteDetails";
import TableRowMain from "../../ui/TableRowMain";
import ActionIcons from "../../ui/ActionIcons";
import TableData from "../../ui/TableData";
import { moneyFormat } from "../../utils/moneyFormat";
import { ProjectDetails } from "./ProjectDetails";
import { truncateText } from "../../utils/truncateText";

const ProjectTableRow = ({
  request,
  visibleItems,
  toggleViewItems,
  handleEdit,
  handleDelete,
  handleAction,
}: {
  request: Project;
  visibleItems: { [key: string]: boolean };
  toggleViewItems: (id: string) => void;
  handleEdit: (request: Project) => void;
  handleDelete?: (id: string) => void;
  handleAction: (request: Project) => void;
}) => {
  const localStorageUserX = localStorageUser();

  const isEditable = localStorageUserX.role === "SUPER-ADMIN";

  const requestId = request.id ?? "";
  // const requestStatus = request.status ?? "pending";
  const requestCreatedAt = request.createdAt ?? "";
  // const requestedById = request.preparedBy?.id;

  const isVisible = !!visibleItems[requestId];

  const rowData = [
    // { id: "project_title", content: request.project_title },
    { id: "project_code", content: truncateText(request.project_code, 40) },
    {
      id: "project_budget",
      content: moneyFormat(Number(request.project_budget), "USD"),
    },
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
            <ProjectDetails request={request} />
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

export default ProjectTableRow;
