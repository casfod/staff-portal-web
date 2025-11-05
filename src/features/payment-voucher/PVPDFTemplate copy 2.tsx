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
    fontSize: "10px",
    lineHeight: "1.1",
  };

  return (
    <div
      ref={pdfRef}
      className="pdf-container bg-white p-3"
      style={containerStyle}
    >
      {/* Header with Logo */}
      <div className="flex justify-between items-start mb-4 pb-3 bg-gradient-to-r from-blue-50 to-gray-50 rounded-lg p-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 bg-white p-1 rounded">
            <img src={logo} alt="logo" className="w-40 h-12" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-800 text-base text-center leading-tight">
              CASFOD Payment Voucher
            </h3>
          </div>
        </div>
        <div className="text-right flex-shrink-0 min-w-0 ml-3 bg-white p-2 rounded shadow-sm">
          <div className="whitespace-nowrap">
            <h3 className="text-sm font-bold text-blue-600 truncate">
              {pvData.pvNumber}
            </h3>
          </div>
          <div className="whitespace-nowrap">
            <p className="text-xs text-gray-500">
              Date: {formatToDDMMYYYY(pvData.createdAt!)}
            </p>
          </div>
          <div className="whitespace-nowrap">
            <p className="text-xs font-semibold mt-0.5 text-gray-700">
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
          <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
            <div className="space-y-1">
              <strong className="text-gray-700 text-xs block">Paying Station:</strong>
              <div className="text-xs bg-white p-1.5 rounded shadow-sm">
                {pvData.payingStation}
              </div>
            </div>
            <div className="space-y-1">
              <strong className="text-gray-700 text-xs block">Grant Code:</strong>
              <div className="text-xs bg-white p-1.5 rounded shadow-sm">
                {pvData.grantCode}
              </div>
            </div>
            <div className="space-y-1">
              <strong className="text-gray-700 text-xs block">Chart of Account:</strong>
              <div className="text-xs bg-white p-1.5 rounded shadow-sm">
                {pvData.organisationalChartOfAccount}
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
            <div className="space-y-1">
              <strong className="text-gray-700 text-xs block">Project:</strong>
              <div className="text-xs bg-white p-1.5 rounded shadow-sm">
                {pvData.project}
              </div>
            </div>
            <div className="space-y-1">
              <strong className="text-gray-700 text-xs block">Chart of Account Code:</strong>
              <div className="text-xs bg-white p-1.5 rounded shadow-sm">
                {pvData.chartOfAccountCode}
              </div>
            </div>
            <div className="space-y-1">
              <strong className="text-gray-700 text-xs block">Category:</strong>
              <div className="text-xs bg-white p-1.5 rounded shadow-sm">
                {pvData.chartOfAccountCategories}
              </div>
            </div>
          </div>
        </div>

        {/* Pay To and Being Sections */}
        <div className="mb-3">
          <div className="mb-2">
            <strong className="text-gray-700 text-xs block mb-1">Pay To:</strong>
            <div className="bg-white p-2 rounded-lg shadow-sm min-h-[30px] text-xs">
              {pvData.payTo}
            </div>
          </div>
          <div>
            <strong className="text-gray-700 text-xs block mb-1">Being:</strong>
            <div className="bg-white p-2 rounded-lg shadow-sm min-h-[30px] text-xs">
              {pvData.being}
            </div>
          </div>
        </div>
      </div>

      {/* Amount Details Table */}
      <div className="mb-4">
        <div className="bg-gray-100 p-2 rounded-t-lg">
          <strong className="text-gray-700 text-xs">Financial Breakdown</strong>
        </div>
        <div className="space-y-1 bg-white rounded-b-lg p-2 shadow-sm">
          <div className="flex justify-between items-center py-1">
            <span className="text-xs">Gross Amount</span>
            <span className="text-xs font-medium">{moneyFormat(pvData.grossAmount, "NGN")}</span>
          </div>
          
          {pvData.vat && (
            <div className="flex justify-between items-center py-1 bg-gray-50 rounded px-2">
              <span className="text-xs">VAT</span>
              <span className="text-xs">{moneyFormat(pvData.vat || 0, "NGN")}</span>
            </div>
          )}
          
          {pvData.wht && (
            <div className="flex justify-between items-center py-1 bg-gray-50 rounded px-2">
              <span className="text-xs">Withholding Tax (WHT)</span>
              <span className="text-xs">{moneyFormat(pvData.wht || 0, "NGN")}</span>
            </div>
          )}
          
          {pvData.devLevy && (
            <div className="flex justify-between items-center py-1 bg-gray-50 rounded px-2">
              <span className="text-xs">Development Levy</span>
              <span className="text-xs">{moneyFormat(pvData.devLevy || 0, "NGN")}</span>
            </div>
          )}
          
          {pvData.otherDeductions && (
            <div className="flex justify-between items-center py-1 bg-gray-50 rounded px-2">
              <span className="text-xs">Other Deductions</span>
              <span className="text-xs">{moneyFormat(pvData.otherDeductions || 0, "NGN")}</span>
            </div>
          )}
          
          {totalDeductions > 0 && (
            <div className="flex justify-between items-center py-1 bg-gray-100 rounded px-2 font-bold">
              <span className="text-xs">Total Deductions</span>
              <span className="text-xs">{moneyFormat(totalDeductions, "NGN")}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center py-2 bg-green-50 rounded px-2 font-bold text-green-800 mt-2">
            <span className="text-xs">NET AMOUNT PAYABLE</span>
            <span className="text-xs">{moneyFormat(pvData.netAmount, "NGN")}</span>
          </div>
        </div>
      </div>

      {/* Amount in Words */}
      <div className="mb-4 p-3 bg-yellow-50 rounded-lg shadow-sm">
        <strong className="text-gray-700 text-xs block mb-1">Amount in Words:</strong>
        <p className="italic text-xs">{pvData.amountInWords}</p>
      </div>

      {/* Notes */}
      {pvData.note && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg shadow-sm">
          <strong className="text-gray-700 text-xs block mb-1">Notes:</strong>
          <p className="text-xs">{pvData.note}</p>
        </div>
      )}

      {/* Approval Sections with Positions */}
      <div className="mt-5 pt-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Prepared By */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="font-semibold mb-2 text-gray-700 text-xs text-center bg-white py-1 rounded">
              PREPARED BY
            </p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-600 mb-1">Name</p>
                <div className="h-6 bg-white rounded shadow-sm text-center font-medium text-xs flex items-center justify-center">
                  {getDisplayName(pvData.createdBy)}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Position</p>
                <div className="h-6 bg-white rounded shadow-sm text-center text-xs flex items-center justify-center">
                  {getPosition(pvData.createdBy)}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-1">Signature</p>
                <div className="h-8 bg-white rounded shadow-sm"></div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  (Preparer's Signature)
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Date</p>
                <div className="h-6 bg-white rounded shadow-sm text-center text-xs flex items-center justify-center">
                  {formatToDDMMYYYY(pvData.createdAt!)}
                </div>
              </div>
            </div>
          </div>

          {/* Reviewed By */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="font-semibold mb-2 text-gray-700 text-xs text-center bg-white py-1 rounded">
              REVIEWED BY
            </p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-600 mb-1">Name</p>
                <div className="h-6 bg-white rounded shadow-sm text-center font-medium text-xs flex items-center justify-center">
                  {getDisplayName(pvData.reviewedBy)}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Position</p>
                <div className="h-6 bg-white rounded shadow-sm text-center text-xs flex items-center justify-center">
                  {getPosition(pvData.reviewedBy)}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-1">Signature</p>
                <div className="h-8 bg-white rounded shadow-sm"></div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  (Reviewer's Signature)
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Date</p>
                <div className="h-6 bg-white rounded shadow-sm"></div>
              </div>
            </div>
          </div>

          {/* Approved By */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="font-semibold mb-2 text-gray-700 text-xs text-center bg-white py-1 rounded">
              APPROVED BY
            </p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-600 mb-1">Name</p>
                <div className="h-6 bg-white rounded shadow-sm text-center font-medium text-xs flex items-center justify-center">
                  {getDisplayName(pvData.approvedBy)}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Position</p>
                <div className="h-6 bg-white rounded shadow-sm text-center text-xs flex items-center justify-center">
                  {getPosition(pvData.approvedBy)}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-1">Signature</p>
                <div className="h-8 bg-white rounded shadow-sm"></div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  (Approver's Signature)
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Date</p>
                <div className="h-6 bg-white rounded shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-3 text-center bg-gradient-to-r from-blue-50 to-gray-50 rounded-lg p-2">
        <p className="text-xs text-gray-700">
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