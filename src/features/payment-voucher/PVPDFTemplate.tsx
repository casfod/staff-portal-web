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
  // orientation = "landscape",
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

  const totalDeductions =
    (pvData.vat || 0) +
    (pvData.wht || 0) +
    (pvData.devLevy || 0) +
    (pvData.otherDeductions || 0);

  // A4 landscape dimensions
  const containerStyle = {
    fontFamily: "Arial, sans-serif",
    width: "297mm",
    margin: "0 auto",
    // fontSize: "12px",
    lineHeight: "1.15",
    color: "#111827",
    backgroundColor: "#ffffff",
    display: "flex",
    flexDirection: "column" as const,
    // justifyContent: "space-between",
    padding: "5mm",
    boxSizing: "border-box" as const,
  };

  const paymentInfoSections = [
    {
      title: "Payment Details",
      fields: [
        { label: "Paying Station", value: pvData.payingStation },
        { label: "Pay To", value: pvData.payTo },
        { label: "Account Code", value: pvData.accountCode },
        { label: "Chart Of Acc. Code", value: pvData.chartOfAccountCode },
      ],
    },
    {
      title: "Project & Chart Details",
      fields: [
        { label: "Project", value: pvData.project },
        {
          label: "Organisational Chart of Acc.",
          value: pvData.organisationalChartOfAccount,
        },
        { label: "Category", value: pvData.chartOfAccountCategories },
      ],
    },
  ];

  const financialItems = [
    { label: "Gross Amount", value: pvData.grossAmount },
    { label: "VAT", value: pvData.vat, show: pvData.vat > 0 },
    { label: "WHT", value: pvData.wht, show: pvData.wht > 0 },
    {
      label: "Development Levy",
      value: pvData.devLevy,
      show: pvData.devLevy > 0,
    },
    {
      label: "Other Deductions",
      value: pvData.otherDeductions,
      show: pvData.otherDeductions > 0,
    },
    {
      label: "Total Deductions",
      value: totalDeductions,
      show: totalDeductions > 0,
      className: "w-fit font-semibold border-t-2 text-red-900 border-gray-300",
    },
    {
      label: "NET AMOUNT PAYABLE",
      value: pvData.netAmount,
      show: true,
      className: "font-bold text-teal-900 rounded",
    },
  ];

  const approvalSections = [
    {
      title: "Prepared By",
      user: pvData.createdBy,
      date: pvData.createdAt,
      showDate: true,
    },
    {
      title: "Reviewed By",
      user: pvData.reviewedBy,
      date: null,
      showDate: false,
    },
    {
      title: "Approved By",
      user: pvData.approvedBy,
      date: null,
      showDate: false,
    },
  ];

  const additionalSections = [
    { label: "Amount in Words", value: pvData.amountInWords },
    { label: "Description", value: pvData.being },
    { label: "Additional Notes", value: pvData.note, show: !!pvData.note },
  ];

  return (
    <div className="items-center" ref={pdfRef} style={containerStyle}>
      {/* ===== HEADER ===== */}
      <div className="bg-gray-50 w-full border-b py-2 mb-4">
        <div className="w-full flex justify-between items-start">
          <img src={logo} alt="CASFOD Logo" className="w-48 h-auto" />

          <div className="text-right">
            <h2 className="text-sm font-semibold text-blue-800">
              {pvData.pvNumber}
            </h2>
            <p className="text-sm text-gray-600">
              {formatToDDMMYYYY(pvData.pvDate!)}
            </p>
            <span
              className={`inline-block mt-1 px-2 py-0.5 text-[14px] rounded-full ${
                pvData.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : pvData.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : pvData.status === "rejected"
                  ? "bg-red-100 text-red-800"
                  : pvData.status === "paid"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {pvData.status?.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <h1 className="text-center text-base font-semibold text-gray-900 uppercase tracking-wide mb-4">
        CASFOD PAYMENT VOUCHER
      </h1>

      {/* ===== MAIN CONTENT ===== */}
      <div className="w-full grid grid-cols-2 gap-2 pb-4">
        {paymentInfoSections.map((section, i) => (
          <div key={i} className="space-y-1">
            {section.fields.map((field, j) => (
              <div key={j} className="flex gap-1">
                <span
                  className="font-semibold text-[14px] uppercase whitespace-nowrap"
                  style={{ whiteSpace: "nowrap" }}
                >
                  {field.label}:
                </span>
                <span className="text-[14px]">{field.value || "—"}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Additional Sections */}
      <div className="w-full mt-1 space-y-1">
        {additionalSections.map(
          (section, i) =>
            section.show !== false && (
              <div key={i} className="flex gap-1">
                <span
                  className="font-semibold text-[14px] uppercase whitespace-nowrap"
                  style={{ whiteSpace: "nowrap" }}
                >
                  {section.label}:
                </span>
                <p className="text-[14px] leading-snug flex-1 break-words">
                  {section.value || "—"}
                </p>
              </div>
            )
        )}
      </div>

      {/* ===== FINANCIAL SUMMARY ===== */}
      <div className="w-full mt-2 border-t  border-gray-300 pt-4 mb-4">
        <h3 className="text-center font-semibold text-gray-900 mb-4 uppercase whitespace-nowrap">
          Financial Summary
        </h3>
        <div className="space-y-1">
          {financialItems.map(
            (item, i) =>
              item.show !== false && (
                <div key={i} className="grid grid-cols-2 gap-8 text-[14px]">
                  <span
                    className="text-right font-bold whitespace-nowrap"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {item.label}
                  </span>
                  <span className={item.className}>
                    {moneyFormat(item.value, "NGN")}
                  </span>
                </div>
              )
          )}
        </div>
      </div>

      {/* ===== APPROVAL SECTION ===== */}
      <div className="w-full mt-3 grid grid-cols-3 gap-2 text-center">
        {approvalSections.map((sec, i) => (
          <div key={i} className="w-full space-y-2.5">
            <p
              className="text-[14px] font-semibold uppercase whitespace-nowrap"
              style={{ whiteSpace: "nowrap" }}
            >
              {sec.title}
            </p>
            <p className="text-[14px] font-semibold">
              {getDisplayName(sec.user)}
            </p>
            <p className="text-[11px] text-gray-600">{getPosition(sec.user)}</p>
            <div className="w-full h-6 border-t border-gray-300 pt-2"></div>
            <p className="text-[11px] text-gray-500">Signature</p>
          </div>
        ))}
      </div>

      {/* ===== FOOTER ===== */}
      <div className="w-full text-center text-[12px] text-gray-500 mt-3 border-t border-gray-300 pt-4">
        <p>Unique Care and Support Foundation • finance@casfod.org</p>
        <p className="text-[11px] text-gray-400">
          Generated on {new Date().toLocaleDateString()} at{" "}
          {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default PVPDFTemplate;
