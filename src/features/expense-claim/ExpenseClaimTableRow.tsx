import { ExpenseClaimType } from "../../interfaces";
import { localStorageUser } from "../../utils/localStorageUser";
import StatusBadge from "../../ui/StatusBadge";
import { dateformat } from "../../utils/dateFormat";
import { HiMiniEye, HiMiniEyeSlash } from "react-icons/hi2";
import { Edit, Trash2 } from "lucide-react";
import { moneyFormat } from "../../utils/moneyFormat";
import ExpenseClaimDetails from "./ExpenseClaimDetails";
import RequestCommentsAndActions from "../../ui/RequestCommentsAndActions";

const ExpenseClaimTableRow = ({
  request,
  visibleItems,
  toggleViewItems,
  handleEdit,
  handleDelete,
  handleAction,
}: {
  request: ExpenseClaimType;
  visibleItems: { [key: string]: boolean };
  toggleViewItems: (id: string) => void;
  handleEdit: (request: ExpenseClaimType) => void;
  handleDelete: (id: string) => void;
  handleAction: (request: ExpenseClaimType) => void;
}) => {
  const localStorageUserX = localStorageUser();
  const isVisible = visibleItems[request.id!];

  return (
    <>
      <tr
        key={request.id}
        className="h-[40px] max-h-[40px] hover:cursor-pointer hover:bg-[#f2f2f2]"
        onClick={() => toggleViewItems(request.id!)}
      >
        <td className="px-3 py-1.5 md:px-6 md:py-2 whitespace-nowrap  text-xs 2xl:text-sm text-gray-600 uppercase">
          {request.staffName}
        </td>
        <td className="px-3 py-1.5 md:px-6 md:py-2 whitespace-nowrap  text-xs 2xl:text-sm text-gray-600 uppercase">
          <StatusBadge status={request.status!} />
        </td>
        <td className="px-3 py-1.5 md:px-6 md:py-2 whitespace-nowrap  text-xs 2xl:text-sm text-gray-600 uppercase">
          {moneyFormat(
            request.expenses?.reduce((sum, item) => sum + item.total, 0) || 0,
            "NGN"
          )}
        </td>
        <td className="px-3 py-1.5 md:px-6 md:py-2 whitespace-nowrap  text-xs 2xl:text-sm text-gray-600 uppercase">
          {dateformat(request.createdAt!)}
        </td>
        <td className="px-3 py-1.5 md:px-6 md:py-2 whitespace-nowrap  text-xs 2xl:text-sm text-gray-600 uppercase">
          <div className="flex space-x-4">
            <button className="hover:text-gray-600">
              {isVisible ? (
                <HiMiniEyeSlash className="w-5 h-5" />
              ) : (
                <HiMiniEye className="w-5 h-5" />
              )}
            </button>

            {(request.status === "draft" || request.status === "rejected") &&
              request.createdBy?.id === localStorageUserX.id && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent event from bubbling up to the row
                      handleEdit(request);
                    }}
                    className="hover:text-blue-600"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent event from bubbling up to the row
                      handleDelete(request.id!);
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </>
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
            <ExpenseClaimDetails request={request} />
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

export default ExpenseClaimTableRow;
