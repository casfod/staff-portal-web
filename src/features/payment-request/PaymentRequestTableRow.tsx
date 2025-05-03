import { PaymentRequestType } from "../../interfaces";
import { localStorageUser } from "../../utils/localStorageUser";
import StatusBadge from "../../ui/StatusBadge";
import { dateformat } from "../../utils/dateFormat";
import { HiMiniEye, HiMiniEyeSlash } from "react-icons/hi2";
import { Edit, Trash2 } from "lucide-react";
import { moneyFormat } from "../../utils/moneyFormat";

import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";
import PaymentRequestDetails from "./PaymentRequestDetails";

const PaymentRequestTableRow = ({
  request,
  visibleItems,
  toggleViewItems,
  handleEdit,
  handleDelete,
  handleAction,
}: {
  request: PaymentRequestType;
  visibleItems: { [key: string]: boolean };
  toggleViewItems: (id: string) => void;
  handleEdit: (request: PaymentRequestType) => void;
  handleDelete: (id: string) => void;
  handleAction: (request: PaymentRequestType) => void;
}) => {
  const localStorageUserX = localStorageUser();

  const requestId = request.id ?? "";
  const requestStatus = request.status ?? "pending";
  const requestCreatedAt = request.createdAt ?? "";
  const requestedById = request.requestedBy?.id;

  const isVisible = visibleItems[requestId];
  const isEditable =
    (requestStatus === "draft" || requestStatus === "rejected") &&
    requestedById === localStorageUserX?.id;

  return (
    <>
      <tr
        className="h-[40px] max-h-[40px] hover:cursor-pointer hover:bg-[#f2f2f2]"
        key={requestId}
        onClick={() => toggleViewItems(requestId!)}
      >
        <td className="px-3 py-1.5 md:px-6 md:py-2 whitespace-nowrap  text-xs 2xl:text-sm text-gray-600 uppercase">
          {request.requestBy}
        </td>
        <td className="px-3 py-1.5 md:px-6 md:py-2 whitespace-nowrap  text-xs 2xl:text-sm text-gray-600 uppercase">
          <StatusBadge status={request.status!} />
        </td>
        <td className="px-3 py-1.5 md:px-6 md:py-2 whitespace-nowrap  text-xs 2xl:text-sm text-gray-600 uppercase">
          {moneyFormat(request.amountInFigure, "NGN")}
        </td>
        <td className="px-3 py-1.5 md:px-6 md:py-2 whitespace-nowrap  text-xs 2xl:text-sm text-gray-600 uppercase">
          {dateformat(requestCreatedAt)}
        </td>

        <td className="px-3 py-1.5 md:px-6 md:py-2 whitespace-nowrap  text-xs 2xl:text-sm text-gray-600 uppercase">
          <div className="flex space-x-4">
            <span
              className="hover:cursor-pointer"
              // onClick={() => toggleViewItems(requestId!)}
            >
              {visibleItems[requestId!] ? (
                <HiMiniEyeSlash className="w-5 h-5" />
              ) : (
                <HiMiniEye className="w-5 h-5" />
              )}
            </span>

            {isEditable && (
              <div className="flex space-x-4">
                <button
                  className="hover:cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent event from bubbling up to the row
                    handleEdit(request);
                  }}
                >
                  <Edit className="h-5 w-5" />
                </button>

                <button
                  className="text-red-600 hover:text-red-900 hover:cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(requestId!);
                  }}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </td>
      </tr>

      {isVisible && (
        <tr key={`${requestId}-details`} className="rounded-lg">
          <td
            colSpan={6}
            className={`w-full h-10 bg-[#F8F8F8] border border-gray-300 px-6 py-4 rounded-lg shadow-sm`}
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
