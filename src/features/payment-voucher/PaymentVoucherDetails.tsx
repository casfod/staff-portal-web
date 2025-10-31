// components/payment-vouchers/PaymentVoucherDetails.tsx
import { moneyFormat } from "../../utils/moneyFormat";
import { PaymentVoucherType } from "../../interfaces";
import { useParams } from "react-router-dom";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import FileAttachmentContainer from "../../ui/FileAttachmentContainer";
import DetailContainer from "../../ui/DetailContainer";
import CopiedTo from "../../ui/CopiedTo";

interface VoucherDetailsProps {
  voucher: PaymentVoucherType;
}

export const PaymentVoucherDetails = ({ voucher }: VoucherDetailsProps) => {
  const { voucherId } = useParams();

  const financialData = [
    {
      id: "grossAmount",
      label: "Gross Amount:",
      content: moneyFormat(voucher.grossAmount, "NGN"),
    },
    {
      id: "vat",
      label: "VAT:",
      content: moneyFormat(voucher.vat, "NGN"),
    },
    {
      id: "wht",
      label: "WHT:",
      content: moneyFormat(voucher.wht, "NGN"),
    },
    {
      id: "devLevy",
      label: "Development Levy:",
      content: moneyFormat(voucher.devLevy, "NGN"),
    },
    {
      id: "otherDeductions",
      label: "Other Deductions:",
      content: moneyFormat(voucher.otherDeductions, "NGN"),
    },
    {
      id: "netAmount",
      label: "Net Amount:",
      content: moneyFormat(voucher.netAmount, "NGN"),
    },
  ];

  const generalData = [
    {
      id: "departmentalCode",
      label: "Departmental Code:",
      content: voucher.departmentalCode,
    },
    {
      id: "payingStation",
      label: "Paying Station:",
      content: voucher.payingStation,
    },
    {
      id: "payTo",
      label: "Pay To:",
      content: voucher.payTo,
    },
    {
      id: "being",
      label: "Being:",
      content: voucher.being,
    },
    {
      id: "amountInWords",
      label: "Amount In Words:",
      content: voucher.amountInWords,
    },
    {
      id: "grantCode",
      label: "Grant Code:",
      content: voucher.grantCode,
    },
    {
      id: "chartOfAccountCategories",
      label: "Chart of Account Categories:",
      content: voucher.chartOfAccountCategories,
    },
    {
      id: "chartOfAccount",
      label: "Chart of Account:",
      content: voucher.chartOfAccount,
    },
    {
      id: "chartOfAccountCode",
      label: "Chart of Account Code:",
      content: voucher.chartOfAccountCode,
    },
    {
      id: "projBudgetLine",
      label: "Project Budget Line:",
      content: voucher.projBudgetLine,
    },
    {
      id: "mandateReference",
      label: "Mandate Reference:",
      content: voucher.mandateReference,
    },
    {
      id: "note",
      label: "Note:",
      content: voucher.note,
    },
  ];

  return (
    <DetailContainer>
      {/* Payment Voucher Details Section */}
      <div
        className={`flex flex-col gap-2 md:gap-3 w-full ${
          !voucherId ? "text-sm" : "text-sm md:text-base"
        } mb-3 break-words`}
      >
        <h2 className="text-center text-base md:text-lg font-semibold tracking-widest my-4 break-words">
          PAYMENT VOUCHER DETAILS
        </h2>

        {/* General Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {generalData.map((data) => (
            <p key={data.id}>
              <span className="text-sm font-bold mr-1 uppercase">
                {data.label}
              </span>
              {data.content}
            </p>
          ))}
        </div>

        {/* Financial Information */}
        <h3 className="text-center text-base font-semibold tracking-widest my-4 break-words">
          FINANCIAL DETAILS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {financialData.map((data) => (
            <p
              key={data.id}
              className={
                data.id === "netAmount" ? "font-bold text-green-600" : ""
              }
            >
              <span className="text-sm font-bold mr-1 uppercase">
                {data.label}
              </span>
              {data.content}
            </p>
          ))}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <p>
            <span className="text-sm font-bold mr-1 uppercase">
              Created At:
            </span>
            {formatToDDMMYYYY(voucher.createdAt!)}
          </p>
          <p>
            <span className="text-sm font-bold mr-1 uppercase">
              Updated At:
            </span>
            {formatToDDMMYYYY(voucher.updatedAt!)}
          </p>
        </div>
      </div>

      {/* File Attachments Section */}
      {voucher.files && voucher.files.length > 0 && (
        <FileAttachmentContainer files={voucher.files} />
      )}

      {/* Copied To */}
      {voucher.copiedTo?.length! > 0 && <CopiedTo to={voucher.copiedTo!} />}
    </DetailContainer>
  );
};
