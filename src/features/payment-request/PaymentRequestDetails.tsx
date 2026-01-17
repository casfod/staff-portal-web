import { moneyFormat } from "../../utils/moneyFormat";
import { PaymentRequestType } from "../../interfaces";
import { useParams } from "react-router-dom";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import FileAttachmentContainer from "../../ui/FileAttachmentContainer";
import DetailContainer from "../../ui/DetailContainer";
import CopiedTo from "../../ui/CopiedTo";
import SystemInfo from "../../ui/SystemInfo";

interface RequestDetailsProps {
  request: PaymentRequestType;
  handleAction?: (request: PaymentRequestType) => void;
}

export const PaymentRequestDetails = ({ request }: RequestDetailsProps) => {
  const { requestId } = useParams();

  const rowData = [
    {
      id: "grantCode",
      label: "Account Code :",
      content: request.grantCode,
    },
    {
      id: "accountName",
      label: "Account Name :",
      content: request.accountName,
    },
    {
      id: "accountNumber",
      label: "Account Number :",
      content: request.accountNumber,
    },
    {
      id: "bankName",
      label: "Bank Name :",
      content: request.bankName,
    },
    {
      id: "amountInWords",
      label: "Amount In Words :",
      content: request.amountInWords,
    },
    {
      id: "amountInFigure",
      label: "Amount :",
      content: moneyFormat(Number(request.amountInFigure), "NGN"),
    },

    {
      id: "dateOfExpense",
      label: "Date Of Expense :",
      content: formatToDDMMYYYY(request?.dateOfExpense!),
    },
    {
      id: "purposeOfExpense",
      label: "Purpose Of Expense :",
      content: request.purposeOfExpense,
    },

    {
      id: "specialInstruction",
      label: "Special Instruction :",
      content: request.specialInstruction,
    },
    // {
    //   id: "requestedBy",
    //   label: "Requested By :",
    //   content: `${request.requestBy?.toUpperCase()} ${request.requestedBy?.last_name?.toUpperCase()}`,
    // },
  ];

  return (
    <DetailContainer>
      {/* Payment Request Details Header */}
      {request?.pmrNumber && (
        <h1 className="text-center text-lg font-extrabold p-4 md:p-6">
          {request?.pmrNumber}
        </h1>
      )}

      {/* Details Grid - Matching PurchaseRequestDetails structure */}
      <div
        className={`w-full ${
          !requestId ? "text-sm" : "text-sm md:text-base"
        } mb-6 border-b border-gray-300 pb-6`}
      >
        <div className="flex flex-col items-start gap-3 md:gap-4 w-full">
          {rowData.slice(0, Math.ceil(rowData.length / 2)).map((data) => (
            <div
              key={data.id}
              className="w-full md:w-fit border-b-2 md:border-b-0 flex flex-col md:flex-row gap-1 pb-2 md:pb-0"
            >
              <span className="text-sm font-bold uppercase whitespace-nowrap text-gray-700 mb-1 md:mb-0">
                {data.label}
              </span>
              <span className="break-words">{data.content}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start gap-3 md:gap-4 w-full">
          {rowData.slice(Math.ceil(rowData.length / 2)).map((data) => (
            <div
              key={data.id}
              className="w-full md:w-fit border-b-2 md:border-b-0 flex  flex-col md:flex-row gap-1 pb-2 md:pb-0"
            >
              <span className="text-sm font-bold uppercase whitespace-nowrap text-gray-700 mb-1 md:mb-0">
                {data.label}
              </span>
              <span className="break-words">{data.content}</span>
            </div>
          ))}
        </div>
      </div>

      <SystemInfo request={request} />

      {/* File Attachments Section */}
      {request.files && request.files.length > 0 && (
        <FileAttachmentContainer files={request.files} />
      )}

      {/* Copied To */}
      {request.copiedTo?.length! > 0 && <CopiedTo to={request.copiedTo!} />}
    </DetailContainer>
  );
};

export default PaymentRequestDetails;
