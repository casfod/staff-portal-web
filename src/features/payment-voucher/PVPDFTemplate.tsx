import React from "react";
import logo from "../../assets/logo.webp";
import { PaymentVoucherType } from "../../interfaces";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";
import { moneyFormat } from "../../utils/moneyFormat";

interface PVPDFTemplateProps {
  pdfRef?: any;
  isGenerating?: boolean;
  pvData: PaymentVoucherType;
  orientation?: "portrait" | "landscape";
}

const PVPDFTemplate: React.FC<PVPDFTemplateProps> = ({
  pvData,
  pdfRef,
  orientation = "landscape",
}) => {
  const getDisplayName = (user: any): string => {
    if (!user) return "N/A";
    if (typeof user === "string") return "N/A";
    return `${user.first_name || ""} ${user.last_name || ""}`.trim() || "N/A";
  };

  const getPosition = (user: any): string => {
    if (!user) return "N/A";
    if (typeof user === "string") return "N/A";
    return user.position || user.role || "N/A";
  };

  // Calculate totals
  const totalDeductions =
    (pvData.vat || 0) +
    (pvData.wht || 0) +
    (pvData.devLevy || 0) +
    (pvData.otherDeductions || 0);

  // Container dimensions based on orientation
  const containerStyle = {
    fontFamily: "Arial, sans-serif",
    width: orientation === "landscape" ? "297mm" : "210mm",
    minHeight: orientation === "landscape" ? "210mm" : "297mm",
    margin: "0 auto",
    fontSize: "12px", // Reduced base font size by ~40% (from typical 16px)
    lineHeight: "1.2",
  };

  return (
    <div
      ref={pdfRef}
      className="pdf-container bg-white p-4" // Reduced padding
      style={containerStyle}
    >
      {/* Header with Logo */}
      <div className="flex justify-between items-start mb-4 border-b border-gray-300 pb-3">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <img src={logo} alt="logo" className="w-48 h-16" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-800 text-lg text-center leading-tight">
              CASFOD Payment Voucher
            </h3>
          </div>
        </div>

        <div className="text-right flex-shrink-0 min-w-0 ml-4">
          <div className="whitespace-nowrap">
            <h3 className="text-base font-bold text-blue-600 truncate">
              {pvData.pvNumber}
            </h3>
          </div>
          <div className="whitespace-nowrap">
            <p className="text-xs text-gray-500">
              Date: {formatToDDMMYYYY(pvData.createdAt!)}
            </p>
          </div>
          <div className="whitespace-nowrap">
            <p className="text-xs font-semibold mt-1 text-gray-700">
              Status:{" "}
              <span className="uppercase text-blue-600">{pvData.status}</span>
            </p>
          </div>
        </div>
      </div>
      {/* Payment Details Section */}
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-4 mb-3">
          {/* Left Column */}
          <div className="space-y-2">
            <div>
              <strong className="text-gray-700 text-xs">
                Departmental Code:
              </strong>{" "}
              {/* Reduced */}
              <div className="border-b border-gray-300 py-0.5 text-xs">
                {pvData.departmentalCode}
              </div>
            </div>
            <div>
              <strong className="text-gray-700 text-xs">Paying Station:</strong>
              <div className="border-b border-gray-300 py-0.5 text-xs">
                {pvData.payingStation}
              </div>
            </div>
            <div>
              <strong className="text-gray-700 text-xs">Grant Code:</strong>
              <div className="border-b border-gray-300 py-0.5 text-xs">
                {pvData.grantCode}
              </div>
            </div>
            <div>
              <strong className="text-gray-700 text-xs">
                Chart of Account:
              </strong>
              <div className="border-b border-gray-300 py-0.5 text-xs">
                {pvData.chartOfAccount}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-2">
            <div>
              <strong className="text-gray-700 text-xs">
                Mandate Reference:
              </strong>
              <div className="border-b border-gray-300 py-0.5 text-xs">
                {pvData.mandateReference}
              </div>
            </div>
            <div>
              <strong className="text-gray-700 text-xs">
                Project Budget Line:
              </strong>
              <div className="border-b border-gray-300 py-0.5 text-xs">
                {pvData.projBudgetLine}
              </div>
            </div>
            <div>
              <strong className="text-gray-700 text-xs">
                Chart of Account Code:
              </strong>
              <div className="border-b border-gray-300 py-0.5 text-xs">
                {pvData.chartOfAccountCode}
              </div>
            </div>
            <div>
              <strong className="text-gray-700 text-xs">Category:</strong>
              <div className="border-b border-gray-300 py-0.5 text-xs">
                {pvData.chartOfAccountCategories}
              </div>
            </div>
          </div>
        </div>

        {/* Pay To and Being Sections */}
        <div className="mb-3">
          <div className="mb-2">
            <strong className="text-gray-700 text-xs block mb-1">
              Pay To:
            </strong>
            <div className="border border-gray-300 p-1.5 rounded min-h-[30px] bg-gray-50 text-xs">
              {pvData.payTo}
            </div>
          </div>
          <div>
            <strong className="text-gray-700 text-xs block mb-1">Being:</strong>
            <div className="border border-gray-300 p-1.5 rounded min-h-[30px] bg-gray-50 text-xs">
              {pvData.being}
            </div>
          </div>
        </div>
      </div>

      {/* Amount Details Table */}
      <div className="mb-4">
        <table className="w-full border-collapse border border-gray-300 text-xs">
          {" "}
          {/* Reduced from sm */}
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-1 text-left font-bold">
                {" "}
                {/* Reduced padding */}
                Description
              </th>
              <th className="border border-gray-300 p-1 text-right font-bold">
                Amount (NGN)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-1">Gross Amount</td>
              <td className="border border-gray-300 p-1 text-right">
                {moneyFormat(pvData.grossAmount, "NGN")}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-1">VAT</td>
              <td className="border border-gray-300 p-1 text-right">
                {moneyFormat(pvData.vat || 0, "NGN")}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-1">
                Withholding Tax (WHT)
              </td>
              <td className="border border-gray-300 p-1 text-right">
                {moneyFormat(pvData.wht || 0, "NGN")}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-1">Development Levy</td>
              <td className="border border-gray-300 p-1 text-right">
                {moneyFormat(pvData.devLevy || 0, "NGN")}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-1">Other Deductions</td>
              <td className="border border-gray-300 p-1 text-right">
                {moneyFormat(pvData.otherDeductions || 0, "NGN")}
              </td>
            </tr>
            <tr className="bg-gray-50 font-bold">
              <td className="border border-gray-300 p-1">Total Deductions</td>
              <td className="border border-gray-300 p-1 text-right">
                {moneyFormat(totalDeductions, "NGN")}
              </td>
            </tr>
            <tr className="bg-green-50 font-bold text-green-800">
              <td className="border border-gray-300 p-1">NET AMOUNT PAYABLE</td>
              <td className="border border-gray-300 p-1 text-right">
                {moneyFormat(pvData.netAmount, "NGN")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Amount in Words */}
      <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
        {" "}
        {/* Reduced padding */}
        <strong className="text-gray-700 block mb-1">Amount in Words:</strong>
        <p className="italic">{pvData.amountInWords}</p>
      </div>

      {/* Notes */}
      {pvData.note && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
          <strong className="text-gray-700 block mb-1">Notes:</strong>
          <p>{pvData.note}</p>
        </div>
      )}

      {/* Approval Sections with Positions */}
      <div className="mt-6 pt-4 border-t border-gray-300">
        {" "}
        {/* Reduced margins */}
        <div className="grid grid-cols-3 gap-4">
          {/* Prepared By */}
          <div>
            <p className="font-semibold mb-2 text-gray-700 text-xs">
              PREPARED BY:
            </p>{" "}
            {/* Reduced margin */}
            <div className="space-y-2">
              {" "}
              {/* Reduced spacing */}
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Name</p>{" "}
                {/* Reduced margin */}
                <div className="h-5 border-b border-gray-400 text-center font-medium text-xs">
                  {" "}
                  {/* Reduced height */}
                  {getDisplayName(pvData.createdBy)}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Position</p>
                <div className="h-5 border-b border-gray-400 text-center text-xs">
                  {getPosition(pvData.createdBy)}
                </div>
              </div>
              <div className="mt-2">
                {" "}
                {/* Reduced margin */}
                <p className="text-xs text-gray-600 mb-0.5">Signature</p>
                <div className="h-8 border-b border-gray-400"></div>{" "}
                {/* Reduced height */}
                <p className="text-xs text-gray-500 mt-0.5 text-center">
                  {" "}
                  {/* Reduced margin */}
                  (Preparer's Signature)
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Date</p>
                <div className="h-5 border-b border-gray-400 text-center text-xs">
                  {formatToDDMMYYYY(pvData.createdAt!)}
                </div>
              </div>
            </div>
          </div>

          {/* Reviewed By */}
          <div>
            <p className="font-semibold mb-2 text-gray-700 text-xs">
              REVIEWED BY:
            </p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Name</p>
                <div className="h-5 border-b border-gray-400 text-center font-medium text-xs">
                  {getDisplayName(pvData.reviewedBy)}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Position</p>
                <div className="h-5 border-b border-gray-400 text-center text-xs">
                  {getPosition(pvData.reviewedBy)}
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-0.5">Signature</p>
                <div className="h-8 border-b border-gray-400"></div>
                <p className="text-xs text-gray-500 mt-0.5 text-center">
                  (Reviewer's Signature)
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Date</p>
                <div className="h-5 border-b border-gray-400"></div>
              </div>
            </div>
          </div>

          {/* Approved By */}
          <div>
            <p className="font-semibold mb-2 text-gray-700 text-xs">
              APPROVED BY:
            </p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Name</p>
                <div className="h-5 border-b border-gray-400 text-center font-medium text-xs">
                  {getDisplayName(pvData.approvedBy)}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Position</p>
                <div className="h-5 border-b border-gray-400 text-center text-xs">
                  {getPosition(pvData.approvedBy)}
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-0.5">Signature</p>
                <div className="h-8 border-b border-gray-400"></div>
                <p className="text-xs text-gray-500 mt-0.5 text-center">
                  (Approver's Signature)
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Date</p>
                <div className="h-5 border-b border-gray-400"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-3 border-t border-gray-300 text-center">
        {" "}
        {/* Reduced margins */}
        <p className="text-xs text-gray-700">
          {" "}
          {/* Reduced from sm */}
          Unique Care and Support Foundation |{" "}
          <span className="font-semibold text-blue-600">
            finance@casfod.org
          </span>
        </p>
      </div>
    </div>
  );
};

export default PVPDFTemplate;
