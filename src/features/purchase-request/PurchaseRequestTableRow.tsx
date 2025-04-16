import { PurChaseRequestType } from "../../interfaces";
import { localStorageUser } from "../../utils/localStorageUser";
import StatusBadge from "../../ui/StatusBadge";
import { dateformat } from "../../utils/dateFormat";
import { HiMiniEye, HiMiniEyeSlash } from "react-icons/hi2";
import { Edit, Trash2 } from "lucide-react";
import { moneyFormat } from "../../utils/moneyFormat";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import { PurchaseRequestDetails } from "./PurchaseRequestDetails";

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
  const localStorageUserX = localStorageUser();

  const requestId = request.id ?? "";
  const requestStatus = request.status ?? "pending";
  const requestCreatedAt = request.createdAt ?? "";
  const requestedById = request.createdBy?.id;

  const isVisible = !!visibleItems[requestId];

  const isEditable =
    (requestStatus === "draft" || requestStatus === "rejected") &&
    requestedById === localStorageUserX?.id;

  const totalAmount =
    request.itemGroups?.reduce((sum, item) => sum + item.total, 0) ?? 0;

  return (
    <>
      <tr key={request.id} className="h-[40px] max-h-[40px]">
        <td className="px-6 py-2 whitespace-nowrap  text-xs 2xl:text-text-sm font-medium text-gray-700 uppercase">
          {request.department}
        </td>
        <td className="px-6 py-2 whitespace-nowrap  text-xs 2xl:text-text-sm text-gray-500 uppercase">
          {moneyFormat(totalAmount, "NGN")}
        </td>
        <td className="px-6 py-2 whitespace-nowrap  text-xs 2xl:text-text-sm text-gray-500 uppercase">
          <StatusBadge status={requestStatus} />
        </td>
        <td className="px-6 py-2 whitespace-nowrap  text-xs 2xl:text-text-sm text-gray-500 uppercase">
          {request.requestedBy}
        </td>
        <td className="px-6 py-2 whitespace-nowrap  text-xs 2xl:text-text-sm text-gray-500 uppercase">
          {dateformat(requestCreatedAt)}
        </td>
        <td className="px-6 py-2 whitespace-nowrap  text-xs 2xl:text-text-sm text-gray-500">
          <div className="flex space-x-4">
            <span
              className="hover:cursor-pointer"
              onClick={() => requestId && toggleViewItems(requestId)}
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
