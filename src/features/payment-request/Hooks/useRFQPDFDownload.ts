// hooks/useRFQPDF.ts - UPDATED VERSION
import { useState, useRef } from "react";
import toast from "react-hot-toast";

import html2canvas from "html2canvas";
import { RFQType } from "../../../interfaces";
import { generatePdf } from "../../../utils/generatePdf";

interface UseRFQPDFReturn {
  pdfRef: React.RefObject<HTMLDivElement>;
  isGenerating: boolean;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  generatePDF: () => Promise<File | null>;
  generateAndDownloadPDF: () => Promise<void>; // NEW: Separate function for download
  previewPDF: () => void;
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

      // Generate canvas and create file WITHOUT auto-download
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], filename, {
              type: "application/pdf",
            });
            resolve(file);
          } else {
            resolve(null);
          }
        }, "application/pdf");
      });
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // NEW: Separate function that triggers download
  const generateAndDownloadPDF = async (): Promise<void> => {
    if (!rfqData || !rfqData.RFQTitle) {
      toast.error("RFQ data is incomplete");
      return;
    }

    if (!pdfRef.current) {
      toast.error("PDF template not found");
      return;
    }

    setIsGenerating(true);

    try {
      const filename = `${rfqData.RFQCode || "RFQ"}.pdf`;

      // Use generatePdf utility which handles the download
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
          text: `Request for Quotation - ${rfqData.RFQCode || ""}`,
          fontSize: 16,
          fontStyle: "bold",
          color: "#000000",
          marginBottom: 10,
        },
      });

      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
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
    generateAndDownloadPDF, // Return the new function
    previewPDF,
  };
};
