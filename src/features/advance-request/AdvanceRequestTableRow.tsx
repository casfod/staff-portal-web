import { AdvanceRequestType } from "../../interfaces";
import { localStorageUser } from "../../utils/localStorageUser";
import StatusBadge from "../../ui/StatusBadge";
import { dateformat } from "../../utils/dateFormat";
import { HiMiniEye, HiMiniEyeSlash } from "react-icons/hi2";
import { Edit, Trash2 } from "lucide-react";
import { moneyFormat } from "../../utils/moneyFormat";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import { AdvanceRequestDetails } from "./AdvanceRequestDetails";

const AdvanceRequestTableRow = ({
  request,
  visibleItems,
  toggleViewItems,
  handleEdit,
  handleDelete,
  handleAction,
}: {
  request: AdvanceRequestType;
  visibleItems: { [key: string]: boolean };
  toggleViewItems: (id: string) => void;
  handleEdit: (request: AdvanceRequestType) => void;
  handleDelete: (id: string) => void;
  handleAction: (request: AdvanceRequestType) => void;
}) => {
  const localStorageUserX = localStorageUser();
  const isVisible = visibleItems[request.id!];

  return (
    <>
      <tr key={request.id} className="h-[40px] max-h-[40px]">
        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-700 uppercase">
          {request.department}
        </td>
        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
          {moneyFormat(
            request?.itemGroups!.reduce((sum, item) => sum + item.total, 0),
            "NGN"
          )}
        </td>
        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 uppercase">
          <StatusBadge status={request.status!} />
        </td>
        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 uppercase">
          {request.requestedBy}
        </td>
        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 uppercase">
          {dateformat(request.createdAt!)}
        </td>
        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
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

            {(request.status === "draft" || request.status === "rejected") &&
              request?.createdBy?.id! === localStorageUserX.id && (
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
        <tr key={`${request.id}-details`} className="rounded-lg">
          <td
            colSpan={6}
            className={`w-full h-10 bg-[#F8F8F8] border border-gray-300 px-6 py-4 rounded-lg shadow-sm`}
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
