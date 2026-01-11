// import { SlMagnifier } from "react-icons/sl";
// import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import { moneyFormat } from "../../utils/moneyFormat";
import { PaymentRequestType } from "../../interfaces";
import { useParams } from "react-router-dom";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import FileAttachmentContainer from "../../ui/FileAttachmentContainer";
import DetailContainer from "../../ui/DetailContainer";
import CopiedTo from "../../ui/CopiedTo";

interface RequestDetailsProps {
  request: PaymentRequestType;
  handleAction?: (request: PaymentRequestType) => void;
}

const PaymentRequestDetails = ({ request }: RequestDetailsProps) => {
  const { requestId } = useParams();

  const data1 = [
    { label: "Account Code", value: request.grantCode },
    { label: "Amount In Words", value: request.amountInWords },

    { label: "Purpose Of Expense", value: request.purposeOfExpense },
    {
      label: "Date Of Expense",
      value: formatToDDMMYYYY(request?.dateOfExpense!),
    },
    { label: "Special Instruction", value: request.specialInstruction },
    {
      label: "Request",
      value: `${request.requestedBy?.first_name?.toUpperCase()} ${request.requestedBy?.last_name?.toUpperCase()}`,
    },
  ];

  const data2 = [
    { label: "Account Name", value: request.accountName },
    { label: "Account Number", value: request.accountNumber },
    { label: "Bank Name", value: request.bankName },
  ];

  return (
    <DetailContainer>
      {request?.pmrNumber && (
        <h1 className="text-center text-lg font-extrabold p-6">
          {request?.pmrNumber}
        </h1>
      )}

      {/* Request Details Section */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
          !requestId ? "text-sm" : "text-sm md:text-base"
        }   mb-3 ${
          request?.files!.length > 0 && "border-b border-gray-300"
        } pb-6`}
      >
        {/* Left Column */}
        <div className="flex flex-col gap-2 md:gap-3 w-full">
          {data1.map(({ label, value }) => (
            <div key={label} className="whitespace-pre-line">
              <h2 className="text-sm font-bold uppercase mb-1">{label}:</h2>
              <p>{value}</p>
            </div>
          ))}
        </div>

        {/* Right Column - Recipients Information */}
        <div className="w-fit h-fit border border-gray-300 space-y-3 shadow-md p-5 rounded-lg">
          <h2 className="font-bold">RECIPIENTS INFORMATION</h2>

          {data2.map(({ label, value }) => (
            <div key={label} className="whitespace-pre-line">
              <h2 className="text-sm font-bold uppercase mb-1">{label}:</h2>
              <p>{value}</p>
            </div>
          ))}

          <div className="whitespace-pre-line">
            <h2 className="text-sm font-bold uppercase mb-1">Budget:</h2>
            <p>{moneyFormat(Number(request.amountInFigure), "NGN")}</p>
          </div>
        </div>
      </div>

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
