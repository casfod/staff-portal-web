// import { SlMagnifier } from "react-icons/sl";
// import { dateformat } from "../../utils/dateFormat";
import { moneyFormat } from "../../utils/moneyFormat";
import { PaymentRequestType } from "../../interfaces";
import { useParams } from "react-router-dom";
import { dateformat } from "../../utils/dateFormat";
import FileAttachmentContainer from "../../ui/FileAttachmentContainer";

interface RequestDetailsProps {
  request: PaymentRequestType;
  handleAction?: (request: PaymentRequestType) => void;
}

const PaymentRequestDetails = ({ request }: RequestDetailsProps) => {
  const param = useParams();

  const isInspect = param.requestId!;

  const data1 = [
    { label: "Amount In Words", value: request.amountInWords },

    { label: "Purpose Of Expense", value: request.purposeOfExpense },
    {
      label: "Date Of Expense",
      value: dateformat(request?.dateOfExpense),
    },
    { label: "Special Instruction", value: request.specialInstruction },
    {
      label: "Request",
      value: `${request.requestedBy?.first_name} ${request.requestedBy?.last_name}`,
    },
  ];

  const data2 = [
    { label: "Account Name", value: request.accountName },
    { label: "Account Number", value: request.accountNumber },
    { label: "Bank Name", value: request.bankName },
  ];

  return (
    <div
      className={`border border-gray-300 px-6 py-4 rounded-lg shadow-sm ${
        !isInspect && "bg-[#F8F8F8]"
      }`}
    >
      {/* Request Details Section */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
          !isInspect && "text-sm"
        } text-gray-600`}
      >
        {/* Left Column */}
        <div className="space-y-3">
          <p>
            <span className="font-extrabold uppercase">Grant Code:</span>{" "}
            {request.grantCode}
          </p>

          {data1.map(({ label, value }) => (
            <div key={label} className="whitespace-pre-line">
              <h2 className="font-extrabold uppercase mb-1">{label}:</h2>
              <p>{value}</p>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="w-fit h-fit border border-gray-300 space-y-3 shadow-md p-5 rounded-lg">
          {data2.map(({ label, value }) => (
            <div key={label} className="whitespace-pre-line ">
              <h2 className="font-extrabold uppercase mb-1">{label}:</h2>
              <p>{value}</p>
            </div>
          ))}

          <p>
            <span className="font-extrabold uppercase">Budget:</span>{" "}
            {moneyFormat(Number(request.amountInFigure), "NGN")}
          </p>
        </div>
      </div>

      {/* File Attachments Section */}
      {request.files && request.files.length > 0 && (
        <FileAttachmentContainer files={request.files} />
      )}
    </div>
  );
};

export default PaymentRequestDetails;
