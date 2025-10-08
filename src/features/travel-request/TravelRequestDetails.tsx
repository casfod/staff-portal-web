import { useParams } from "react-router-dom";
import { TravelRequestType } from "../../interfaces";
import DetailContainer from "../../ui/DetailContainer";
import FileAttachmentContainer from "../../ui/FileAttachmentContainer";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import { moneyFormat } from "../../utils/moneyFormat";
import CopiedTo from "../../ui/CopiedTo";

interface RequestDetailsProps {
  request: TravelRequestType;
}

const ItemsTableData = [
  "Expense",
  "Quantity",
  "Frequency",
  "Unit Cost",
  "Total",
];

const ExpenseTable = ({
  expenses,
}: {
  expenses: TravelRequestType["expenses"];
}) => (
  <table className="min-w-full divide-y divide-gray-200 rounded-md mb-4 overflow-x-scroll">
    <thead>
      <tr>
        {ItemsTableData.map((data, index) => (
          <th
            key={index}
            className="px-6 py-2 bg-gray-50 text-left text-sm font-medium   uppercase tracking-wider"
          >
            {data}
          </th>
        ))}
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {expenses!.map((item) => {
        const rowData = [
          { id: "expense", content: item.expense },
          { id: "quantity", content: item.quantity },
          { id: "frequency", content: item.frequency },
          { id: "unitCost", content: moneyFormat(item.unitCost, "NGN") },
          { id: "total", content: moneyFormat(item.total, "NGN") },
        ];

        return (
          <tr key={item.id!}>
            {rowData.map((data) => (
              <td
                key={data.id}
                className="px-6 py-4 text-sm   break-words max-w-xs"
              >
                {data.content}
              </td>
            ))}
          </tr>
        );
      })}
    </tbody>
  </table>
);

const TravelRequestDetails = ({ request }: RequestDetailsProps) => {
  const { requestId } = useParams();

  const totalAmount =
    request.expenses?.reduce((sum, item) => sum + item.total, 0) || 0;

  // Helper function to format content safely
  const formatContent = (content: any): React.ReactNode => {
    if (content instanceof Date) {
      return formatToDDMMYYYY(content); // or any other date formatting you prefer
    }
    if (content === null || content === undefined) {
      return "-"; // or any other placeholder you prefer
    }
    return content;
  };

  const rowData = [
    {
      id: "staffName",
      label: "Staff Name :",
      content: request.staffName,
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
      id: "amountInWords",
      label: "Amount In Words :",
      content: request.amountInWords,
    },
  ];

  const rowData2 = [
    {
      id: "accountCode",
      label: "Account Code :",
      content: request.accountCode,
    },
    {
      id: "Travel Reason",
      label: "Travel Reason:",
      content: request.travelReason,
    },
    {
      id: "expenseChargedTo",
      label: "Charged To :",
      content: `${request.travelRequest.from} - ${request.travelRequest.to}`,
    },
    {
      id: "totalAmount",
      label: "Total Amount:",
      content: moneyFormat(totalAmount, "NGN"),
    },
  ];

  return (
    <DetailContainer>
      {/* Travel Request Details Section */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
          !requestId ? "text-sm" : "text-sm md:text-base"
        }   mb-3 border-b border-gray-300 pb-6 break-words`}
      >
        <div className="flex flex-col gap-2 md:gap-3 w-full">
          {rowData.map((data) => (
            <p key={data.id}>
              <span className="text-sm font-bold mr-1 uppercase">
                {data.label}
              </span>
              {formatContent(data.content)}
            </p>
          ))}
        </div>

        <div className="flex flex-col gap-2 md:gap-3 w-full">
          {rowData2.map((data) => (
            <p key={data.id}>
              <span className="text-sm font-bold mr-1 uppercase">
                {data.label}
              </span>
              {formatContent(data.content)}
            </p>
          ))}
        </div>
      </div>

      {/* Expenses Section Header */}
      <h2 className="text-center text-base md:text-lg   font-semibold tracking-widest my-4 break-words">
        EXPENSES
      </h2>

      <ExpenseTable expenses={request.expenses} />

      {/* File Attachments Section */}
      {request.files && request.files.length > 0 && (
        <FileAttachmentContainer files={request.files} />
      )}

      {/* Copied To */}
      {request.copiedTo?.length! > 0 && <CopiedTo to={request.copiedTo!} />}
    </DetailContainer>
  );
};

export default TravelRequestDetails;
