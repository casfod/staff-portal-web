// hooks/useRFQPDF.ts
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import { RFQType } from "../interfaces";

interface UseRFQPDFReturn {
  pdfRef: React.RefObject<HTMLDivElement>;
  isGenerating: boolean;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  generatePDF: () => Promise<File | null>;
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
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      const pdfBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, "application/pdf");
      });

      const pdfFile = new File([pdfBlob], `${rfqData.RFQCode || "RFQ"}.pdf`, {
        type: "application/pdf",
      });

      toast.success("PDF generated successfully");
      return pdfFile;
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF");
      return null;
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
    previewPDF,
  };
};
