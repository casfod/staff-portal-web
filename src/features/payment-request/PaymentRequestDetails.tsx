// import { SlMagnifier } from "react-icons/sl";
// import { dateformat } from "../../utils/dateFormat";
import { moneyFormat } from "../../utils/moneyFormat";
import { PaymentRequestType } from "../../interfaces";
import { useParams } from "react-router-dom";

interface RequestDetailsProps {
  request: PaymentRequestType;
  handleAction?: (request: PaymentRequestType) => void;
}

const PaymentRequestDetails = ({ request }: RequestDetailsProps) => {
  const param = useParams();

  const isInspect = param.requestId!;

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
        } text-gray-700`}
      >
        {/* Left Column */}
        <div className="space-y-3">
          <p>
            <span className="font-extrabold uppercase">Grant Code:</span>{" "}
            {request.grantCode}
          </p>

          {[
            { label: "Amount In Words", value: request.amountInWords },

            { label: "Purpose Of Expense", value: request.purposeOfExpense },
            { label: "Special Instruction", value: request.specialInstruction },
            {
              label: "Requested By",
              value: `${request.requestedBy?.first_name} ${request.requestedBy?.last_name}`,
            },
          ].map(({ label, value }) => (
            <div key={label} className="whitespace-pre-line">
              <h2 className="font-extrabold uppercase mb-1">{label}:</h2>
              <p>{value}</p>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="w-fit h-fit border border-gray-300 space-y-3 shadow-md p-5 rounded-lg">
          {[
            { label: "Account Name", value: request.accountName },
            { label: "Account Number", value: request.accountNumber },
            { label: "Bank Name", value: request.bankName },
          ].map(({ label, value }) => (
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

      {/* Review Section */}
      {request?.reviewedBy && request.status !== "draft" && (
        <div className="flex justify-center w-full mt-3">
          <div
            className="flex flex-col w-full text-gray-700 text-sm mb-2"
            style={{ letterSpacing: "1px" }}
          >
            <div className="w-fit flex flex-col gap-2">
              {/* {[
                {
                  label: "Reviewed By",
                  value: `${request?.reviewedBy?.first_name} ${request?.reviewedBy?.last_name}`,
                },
                {
                  label: "Reviewed At",
                  value: dateformat(request.reviewedAt!),
                },
                request.approvedBy && {
                  label: "Approval",
                  value: `${request?.approvedBy?.first_name} ${request?.approvedBy?.last_name}`,
                },
                request.approvedAt && {
                  label: "Approved At",
                  value: dateformat(request.approvedAt!),
                },
              ]
                .filter(Boolean)
                .map(({ label, value }) => (
                  <p key={label} className="uppercase">
                    <span className="font-bold mr-1">{label}:</span> {value}
                  </p>
                ))} */}

              {/* Comments Section */}
              {/* {request?.comments?.length! > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="font-bold uppercase">Comments:</span>
                  <div className="flex flex-col gap-2">
                    {request?.comments!.map((comment, index) => (
                      <div
                        key={index}
                        className="border-2 px-4 py-2 rounded-lg shadow-lg bg-white"
                      >
                        <p className="text-base font-extrabold">
                          {`${comment.user.role}: ${comment.user.first_name} ${comment.user.last_name}`}
                        </p>
                        <p className="text-sm">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )} */}
            </div>

            {/* Inspect Button */}
            {/* {handleAction && request.status !== "draft" && (
              <button
                onClick={() => handleAction(request)}
                className="self-center inline-flex items-center w-fit px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-buttonColor hover:bg-buttonColorHover mt-3"
              >
                <span className="inline-flex items-center gap-1">
                  <SlMagnifier />
                  <span>Inspect</span>
                </span>
              </button>
            )} */}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentRequestDetails;
