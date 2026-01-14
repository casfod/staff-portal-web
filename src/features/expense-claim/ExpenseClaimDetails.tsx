import { ExpenseClaimType, ItemGroupType } from "../../interfaces";
import { useParams } from "react-router-dom";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import { moneyFormat } from "../../utils/moneyFormat";
import DetailContainer from "../../ui/DetailContainer";
import FileAttachmentContainer from "../../ui/FileAttachmentContainer";
import CopiedTo from "../../ui/CopiedTo";
import RequestItemsTable from "../../ui/RequestItemsTable";

interface RequestDetailsProps {
  request: ExpenseClaimType;
}

export const ExpenseClaimDetails = ({ request }: RequestDetailsProps) => {
  const { requestId } = useParams();

  // Calculate total amount
  const totalAmount =
    request.expenses?.reduce((sum, item) => sum + item.total, 0) || 0;

  // Helper function to format content safely
  const formatContent = (content: any): React.ReactNode => {
    if (content instanceof Date) {
      return formatToDDMMYYYY(content);
    }
    if (content === null || content === undefined) {
      return "-";
    }
    return content;
  };

  // Row data similar to PurchaseRequestDetails
  const rowData = [
    {
      id: "staffName",
      label: "Staff Name :",
      content: request.staffName,
    },
    {
      id: "accountCode",
      label: "Account Code :",
      content: request.accountCode,
    },
    // {
    //   id: "department",
    //   label: "Department :",
    //   content: request.department,
    // },
    {
      id: "expenseReason",
      label: "Expense Reason :",
      content: request.expenseReason,
    },
    {
      id: "expenseClaim",
      label: "Expense Period :",
      content: `${request.expenseClaim?.from || ""} - ${
        request.expenseClaim?.to || ""
      }`,
    },
    {
      id: "dayOfDeparture",
      label: "Day Of Departure :",
      content: formatToDDMMYYYY(request.dayOfDeparture!),
    },
    {
      id: "dayOfReturn",
      label: "Day Of Return :",
      content: formatToDDMMYYYY(request.dayOfReturn!),
    },
    {
      id: "expenseChargedTo",
      label: "Expense Charged To :",
      content: request.expenseChargedTo,
    },
    {
      id: "amountInWords",
      label: "Amount In Words :",
      content: request.amountInWords,
    },
    {
      id: "totalAmount",
      label: "Total Amount :",
      content: moneyFormat(totalAmount, "NGN"),
    },
  ];

  // Prepare expenses for ItemsTable
  // const formattedExpenses = request.expenses?.map(expense => ({
  //   id: expense.id!,
  //   description: expense.expense,
  //   quantity: expense.quantity,
  //   unit: expense.unit,
  //   unitPrice: expense.unitCost,
  //   total: expense.total,
  //   // Add any additional fields needed for your ItemsTable
  //   frequency: expense.frequency,
  // })) || [];

  return (
    <DetailContainer>
      {/* Expense Claim Details Header */}
      {request?.ecNumber && (
        <h1 className="text-center text-lg font-extrabold p-4 md:p-6">
          {request?.ecNumber}
        </h1>
      )}

      {/* Details Grid - Matching PurchaseRequestDetails structure */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 ${
          !requestId ? "text-sm" : "text-sm md:text-base"
        } mb-6 border-b border-gray-300 pb-6`}
      >
        <div className="flex flex-col items-start gap-3 md:gap-4 w-full">
          {rowData.slice(0, Math.ceil(rowData.length / 2)).map((data) => (
            <div
              key={data.id}
              className="w-full md:w-fit border-b-2 md:border-b-0 flex md:items-center flex-col md:flex-row gap-1 pb-2 md:pb-0"
            >
              <span className="text-sm font-bold uppercase whitespace-nowrap text-gray-700 mb-1 md:mb-0">
                {data.label}
              </span>
              <span className="break-words">{formatContent(data.content)}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start gap-3 md:gap-4 w-full">
          {rowData.slice(Math.ceil(rowData.length / 2)).map((data) => (
            <div
              key={data.id}
              className="w-full md:w-fit border-b-2 md:border-b-0 flex md:items-center flex-col md:flex-row gap-1 pb-2 md:pb-0"
            >
              <span className="text-sm font-bold uppercase whitespace-nowrap text-gray-700 mb-1 md:mb-0">
                {data.label}
              </span>
              <span className="break-words">{formatContent(data.content)}</span>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-center text-base md:text-lg font-semibold tracking-widest mb-4">
        EXPENSES
      </h2>

      {/* Show mobile table on small screens, desktop table on larger screens */}
      <RequestItemsTable
        items={request.expenses as ItemGroupType[]}
        type="expense"
      />
      {/* File Attachments Section */}
      {request.files && request.files.length > 0 && (
        <FileAttachmentContainer files={request.files} />
      )}

      {/* Copied To */}
      {request.copiedTo?.length! > 0 && <CopiedTo to={request.copiedTo!} />}
    </DetailContainer>
  );
};

export default ExpenseClaimDetails;
