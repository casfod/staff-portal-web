// hooks/useRFQPDF.ts - FIXED VERSION
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { generatePdf } from "../utils/generatePdf";
import { RFQType } from "../interfaces";

interface UseRFQPDFReturn {
  pdfRef: React.RefObject<HTMLDivElement>;
  isGenerating: boolean;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  generatePDF: () => Promise<File | null>;
  previewPDF: () => void;
  downloadPDF: () => Promise<void>;
}

export const useRFQPDF = (rfqData: RFQType | null): UseRFQPDFReturn => {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const generatePDF = async (): Promise<File | null> => {
    if (!rfqData || !rfqData.RFQTitle) {
      toast.error("RFQ data is incomplete");
      return null;
    }

    if (!pdfRef.current) {
      toast.error("PDF template not found");
      return null;
    }

    setIsGenerating(true);

    try {
      const filename = `${rfqData.RFQCode || "RFQ"}.pdf`;
      const pdf = await generatePdfViaCanvas(pdfRef.current, filename, rfqData);
      return pdf;
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Fixed multi-page PDF generation with correct addImage usage
  const generatePdfViaCanvas = async (
    element: HTMLElement,
    filename: string,
    rfqData: RFQType
  ): Promise<File | null> => {
    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;

    // Generate canvas from element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    // const imgData = canvas.toDataURL("image/jpeg", 1.0);

    // Create PDF with multi-page support
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pdfWidth - margin * 2;

    // Calculate image dimensions
    const imgWidth = contentWidth;
    // const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // MULTI-PAGE LOGIC
    const availableContentHeight = pdfHeight - margin * 2;
    const pageContentHeightPx =
      (availableContentHeight * canvas.width) / imgWidth;
    const totalPages = Math.ceil(canvas.height / pageContentHeightPx);

    // Add title to first page
    const titleHeight = rfqData.RFQCode ? 15 : 0;
    if (rfqData.RFQCode) {
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor("#000000");

      // const titleText = `Request for Quotation - ${rfqData.RFQCode}`;
      const titleText = ``;
      const titleWidth = pdf.getTextWidth(titleText);
      const titleX = margin + (contentWidth - titleWidth) / 2;
      const titleY = margin + 8;

      pdf.text(titleText, titleX, titleY);
    }

    // Process each page
    for (let i = 0; i < totalPages; i++) {
      if (i > 0) {
        pdf.addPage();

        // Add title to subsequent pages
        if (rfqData.RFQCode) {
          pdf.setFontSize(16);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor("#000000");

          const titleText = ``;
          // const titleText = `Request for Quotation - ${rfqData.RFQCode}`;
          const titleWidth = pdf.getTextWidth(titleText);
          const titleX = margin + (contentWidth - titleWidth) / 2;
          const titleY = margin + 8;

          pdf.text(titleText, titleX, titleY);
        }
      }

      const startY = i * pageContentHeightPx;
      const remainingHeight = canvas.height - startY;
      const pageImgHeightPx = Math.min(pageContentHeightPx, remainingHeight);
      const pageImgHeight = (pageImgHeightPx * imgWidth) / canvas.width;

      // Create a temporary canvas for this page's content
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = pageImgHeightPx;

      const ctx = pageCanvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not available");

      // Draw the portion of the original canvas
      ctx.drawImage(
        canvas,
        0,
        startY,
        canvas.width,
        pageImgHeightPx,
        0,
        0,
        canvas.width,
        pageImgHeightPx
      );

      const pageImgData = pageCanvas.toDataURL("image/jpeg", 1.0);

      // CORRECT addImage usage - maximum 9 arguments
      pdf.addImage(
        pageImgData, // imageData
        "JPEG", // format
        margin, // x
        margin + titleHeight, // y
        imgWidth, // width
        pageImgHeight, // height
        undefined, // alias (optional)
        "FAST", // compression
        0 // rotation (optional)
      );
    }

    // Get PDF as blob and convert to File
    const pdfBlob = pdf.output("blob");
    return new File([pdfBlob], filename, { type: "application/pdf" });
  };

  // Direct download using generatePdf utility
  const downloadPDF = async (): Promise<void> => {
    if (!rfqData || !pdfRef.current) {
      toast.error("No RFQ data available");
      return;
    }

    try {
      const filename = `${rfqData.RFQCode || "RFQ"}.pdf`;
      await generatePdf(pdfRef.current, {
        filename,
        format: "a4",
        orientation: "portrait",
        scale: 2,
        margin: 10,
        multiPage: true,
        quality: 1,
        backgroundColor: "#FFFFFF",
        titleOptions: {
          // text: `Request for Quotation - ${rfqData.RFQCode || ""}`,
          fontSize: 16,
          fontStyle: "bold",
          color: "#000000",
          marginBottom: 10,
        },
        save: true,
      });
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("PDF download failed:", error);
      toast.error("Failed to download PDF");
    }
  };

  const previewPDF = () => {
    if (!rfqData) {
      toast.error("No RFQ data available");
      return;
    }
    setShowPreview(true);
  };

  return {
    pdfRef,
    isGenerating,
    showPreview,
    setShowPreview,
    generatePDF,
    previewPDF,
    downloadPDF,
  };
};
