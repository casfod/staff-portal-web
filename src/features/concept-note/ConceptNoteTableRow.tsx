import { ConceptNote } from "../../interfaces";
import { localStorageUser } from "../../utils/localStorageUser";
import StatusBadge from "../../ui/StatusBadge";
import { dateformat } from "../../utils/dateFormat";
import { HiMiniEye, HiMiniEyeSlash } from "react-icons/hi2";
import { Edit, Trash2 } from "lucide-react";

import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import { ConceptNoteDetails } from "./ConceptNoteDetails";

const ConceptNoteTableRow = ({
  request,
  visibleItems,
  toggleViewItems,
  handleEdit,
  handleDelete,
  handleAction,
}: {
  request: ConceptNote;
  visibleItems: { [key: string]: boolean };
  toggleViewItems: (id: string) => void;
  handleEdit: (request: ConceptNote) => void;
  handleDelete: (id: string) => void;
  handleAction: (request: ConceptNote) => void;
}) => {
  const localStorageUserX = localStorageUser();

  const requestId = request.id ?? "";
  const requestStatus = request.status ?? "pending";
  const requestCreatedAt = request.createdAt ?? "";
  const requestedById = request.preparedBy?.id;

  const isVisible = !!visibleItems[requestId];

  const isEditable =
    (requestStatus === "draft" || requestStatus === "rejected") &&
    requestedById === localStorageUserX?.id;

  return (
    <>
      <tr
        key={request.id}
        className="h-[40px] max-h-[40px]"
        onClick={() => requestId && toggleViewItems(requestId)}
      >
        <td className="px-3 py-2 md:px-6 md:py-2.5 whitespace-nowrap  text-xs 2xl:text-sm text-gray-600 uppercase">
          {request.staff_name}
        </td>
        <td className="px-3 py-2 md:px-6 md:py-2.5 whitespace-nowrap  text-xs 2xl:text-sm text-gray-600 uppercase">
          <StatusBadge status={request.status!} />
        </td>
        <td className="px-3 py-2 md:px-6 md:py-2.5 whitespace-nowrap  text-xs 2xl:text-sm text-gray-600 uppercase">
          {request.project_code}
        </td>
        <td className="px-3 py-2 md:px-6 md:py-2.5 whitespace-nowrap  text-xs 2xl:text-sm text-gray-600 uppercase">
          {dateformat(requestCreatedAt)}
        </td>

        <td className="px-3 py-2 md:px-6 md:py-2.5 whitespace-nowrap  text-xs 2xl:text-sm text-gray-600 uppercase">
          <div className="flex space-x-4">
            <span
              className="hover:cursor-pointer"
              onClick={() => toggleViewItems(request.id!)}
            >
              {visibleItems[request.id!] ? (
                <HiMiniEyeSlash className="w-5 h-5" />
              ) : (
                <HiMiniEye className="w-5 h-5" />
              )}
            </span>

            {isEditable && (
              <div className="flex space-x-4">
                <button
                  className="hover:cursor-pointer"
                  onClick={() => handleEdit(request)}
                >
                  <Edit className="h-5 w-5" />
                </button>

                <button
                  className="text-red-600 hover:text-red-900 hover:cursor-pointer"
                  onClick={() => handleDelete(request.id!)}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </td>
      </tr>

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
