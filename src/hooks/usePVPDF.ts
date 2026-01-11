// hooks/usePVPDF.ts
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { generatePdf } from "../utils/generatePdf";
import { PaymentVoucherType } from "../interfaces";
import { addPdfFooter } from "../utils/pdfFooterUtils";

interface UsePVPDFReturn {
  pdfRef: React.RefObject<HTMLDivElement>;
  isGenerating: boolean;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  generatePDF: (orientation?: "portrait" | "landscape") => Promise<File | null>;
  previewPDF: (orientation?: "portrait" | "landscape") => void;
  downloadPDF: (orientation?: "portrait" | "landscape") => Promise<void>;
}

export const usePVPDF = (pvData: PaymentVoucherType | null): UsePVPDFReturn => {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const generatePDF = async (
    orientation: "portrait" | "landscape" = "landscape"
  ): Promise<File | null> => {
    if (!pvData || !pvData.pvNumber) {
      toast.error("Payment Voucher data is incomplete");
      return null;
    }

    if (!pdfRef.current) {
      toast.error("PDF template not found");
      return null;
    }

    setIsGenerating(true);

    try {
      const sanitizeFilename = (filename: string) => {
        return filename.replace(/\//g, "-");
      };

      const filename = `PV-${sanitizeFilename(pvData.pvNumber)}.pdf`;

      const pdf = await generatePdfViaCanvas(
        pdfRef.current,
        filename,
        pvData,
        orientation
      );
      return pdf;
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePdfViaCanvas = async (
    element: HTMLElement,
    filename: string,
    pvData: PaymentVoucherType,
    orientation: "portrait" | "landscape" = "landscape"
  ): Promise<File | null> => {
    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const pdf = new jsPDF({
      orientation: orientation,
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pdfWidth - margin * 2;

    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const availableContentHeight = pdfHeight - margin * 2;
    const tolerance = 5;
    const needsMultiplePages = imgHeight > availableContentHeight + tolerance;

    if (!needsMultiplePages) {
      // SINGLE PAGE
      pdf.addImage(
        canvas.toDataURL("image/jpeg", 1.0),
        "JPEG",
        margin,
        margin,
        imgWidth,
        imgHeight,
        undefined,
        "FAST"
      );

      // ADD FOOTER FOR SINGLE PAGE
      addPdfFooter(pdf, pvData.pvNumber, "PV Number", 1, 1, margin);
    } else {
      // MULTI-PAGE
      const pageContentHeightPx =
        (availableContentHeight * canvas.width) / imgWidth;
      const totalPages = Math.ceil(canvas.height / pageContentHeightPx);

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const startY = i * pageContentHeightPx;
        const remainingHeight = canvas.height - startY;
        const pageImgHeightPx = Math.min(pageContentHeightPx, remainingHeight);

        if (pageImgHeightPx < 10) {
          continue;
        }

        const pageImgHeight = (pageImgHeightPx * imgWidth) / canvas.width;

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = pageImgHeightPx;

        const ctx = pageCanvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context not available");

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

        pdf.addImage(
          pageImgData,
          "JPEG",
          margin,
          margin,
          imgWidth,
          pageImgHeight,
          undefined,
          "FAST"
        );

        // ADD FOOTER WITH PV NUMBER AND PAGE NUMBER
        addPdfFooter(
          pdf,
          pvData.pvNumber,
          "PV Number",
          i + 1,
          totalPages,
          margin
        );
      }
    }

    const pdfBlob = pdf.output("blob");
    return new File([pdfBlob], filename, { type: "application/pdf" });
  };

  const downloadPDF = async (
    orientation: "portrait" | "landscape" = "landscape"
  ): Promise<void> => {
    if (!pvData || !pdfRef.current) {
      toast.error("No Payment Voucher data available");
      return;
    }

    try {
      const sanitizeFilename = (filename: string) => {
        return filename.replace(/\//g, "-");
      };

      const filename = `PV-${sanitizeFilename(pvData.pvNumber)}.pdf`;

      await generatePdf(pdfRef.current, {
        filename,
        format: "a4",
        orientation: orientation,
        scale: 2,
        margin: 10,
        multiPage: true,
        quality: 1,
        backgroundColor: "#FFFFFF",
        titleOptions: {
          text: `Payment Voucher - ${pvData.pvNumber || ""}`,
          fontSize: 16,
          fontStyle: "bold",
          color: "#000000",
          marginBottom: 10,
        },
        footerOptions: {
          left: `PV Number: ${pvData.pvNumber || "N/A"}`,
          right: (currentPage: number, totalPages: number) =>
            `Page ${currentPage} of ${totalPages}`,
          fontSize: 9,
          color: "#666666",
          lineColor: "#E0E0E0",
        },
        save: true,
      });
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("PDF download failed:", error);
      toast.error("Failed to download PDF");
    }
  };

  const previewPDF = (orientation: "portrait" | "landscape" = "landscape") => {
    console.log(orientation);

    if (!pvData) {
      toast.error("No Payment Voucher data available");
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
