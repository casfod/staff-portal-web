// hooks/usePVPDF.ts
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { generatePdf } from "../utils/generatePdf";
import { PaymentVoucherType } from "../interfaces";

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
      // FIX: Sanitize filename by replacing slashes with dashes or underscores
      const sanitizeFilename = (filename: string) => {
        return filename.replace(/\//g, "-"); // Replace all slashes with dashes
      };

      const filename = `PV-${sanitizeFilename(pvData.pvNumber)}.pdf`;

      // Alternative: If you want to keep the original format but make it filesystem-safe
      // const filename = `${pvData.pvNumber.replace(/\//g, '-')}.pdf`;

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
    console.log(pvData);

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

    // Check if content fits on single page - FIXED CALCULATION
    const availableContentHeight = pdfHeight - margin * 2;

    // DEBUG: Log dimensions to understand the issue
    console.log("PDF Dimensions:", {
      pdfWidth,
      pdfHeight,
      availableContentHeight,
      imgHeight,
      canvasHeight: canvas.height,
      canvasWidth: canvas.width,
      needsMultiplePages: imgHeight > availableContentHeight,
    });

    // FIX: Use more accurate calculation with tolerance
    const tolerance = 5; // 5mm tolerance
    const needsMultiplePages = imgHeight > availableContentHeight + tolerance;

    if (!needsMultiplePages) {
      // SINGLE PAGE - content fits on one page
      console.log("Using single page mode");
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
    } else {
      // MULTI-PAGE - content requires multiple pages
      console.log("Using multi-page mode");
      const pageContentHeightPx =
        (availableContentHeight * canvas.width) / imgWidth;
      const totalPages = Math.ceil(canvas.height / pageContentHeightPx);

      console.log("Total pages needed:", totalPages);

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const startY = i * pageContentHeightPx;
        const remainingHeight = canvas.height - startY;
        const pageImgHeightPx = Math.min(pageContentHeightPx, remainingHeight);

        // Only proceed if we have meaningful content
        if (pageImgHeightPx < 10) {
          // Less than 10px is essentially empty
          console.log("Skipping empty page", i);
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
      // FIX: Sanitize filename for download as well
      const sanitizeFilename = (filename: string) => {
        return filename.replace(/\//g, "-");
      };

      const filename = `PV-${sanitizeFilename(pvData.pvNumber)}.pdf`;
      console.log("Downloading PDF with filename:", filename);

      await generatePdf(pdfRef.current, {
        filename, // Use the sanitized filename
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
