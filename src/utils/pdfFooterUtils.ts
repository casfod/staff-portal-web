// utils/pdfFooterUtils.ts
export const addPdfFooter = (
  pdf: any,
  code: string,
  codeLabel: string,
  currentPage: number,
  totalPages: number,
  margin: number
) => {
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  // Set footer style
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 100, 100); // Gray color

  // Left side: Code (RFQ, PO, GRN, PV)
  const codeText = `${codeLabel}: ${code || "N/A"}`;
  pdf.text(codeText, margin, pdfHeight - 5);

  // Right side: Page number
  const pageText = `Page ${currentPage} of ${totalPages}`;
  const textWidth = pdf.getTextWidth(pageText);
  pdf.text(pageText, pdfWidth - margin - textWidth, pdfHeight - 5);

  // Optional: Add a separator line above the footer
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, pdfHeight - 7, pdfWidth - margin, pdfHeight - 7);
};

// Helper to get code label based on document type
export const getCodeLabel = (docType: "rfq" | "po" | "grn" | "pv"): string => {
  switch (docType) {
    case "rfq":
      return "RFQ Code";
    case "po":
      return "PO Code";
    case "grn":
      return "GRN Code";
    case "pv":
      return "PV Number";
    default:
      return "Code";
  }
};
