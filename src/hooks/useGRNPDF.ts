// hooks/useGRNPDF.ts
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { generatePdf } from "../utils/generatePdf";
import { GoodsReceivedType } from "../interfaces";

interface UseGRNPDFReturn {
  pdfRef: React.RefObject<HTMLDivElement>;
  isGenerating: boolean;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  generatePDF: () => Promise<File | null>;
  previewPDF: () => void;
  downloadPDF: () => Promise<void>;
}

export const useGRNPDF = (
  grnData: GoodsReceivedType | null
): UseGRNPDFReturn => {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const generatePDF = async (): Promise<File | null> => {
    if (!grnData || !grnData.GRDCode) {
      toast.error("Goods Received data is incomplete");
      return null;
    }

    if (!pdfRef.current) {
      toast.error("PDF template not found");
      return null;
    }

    setIsGenerating(true);

    try {
      const filename = `${grnData.GRDCode || "GRN"}.pdf`;
      const pdf = await generatePdfViaCanvas(pdfRef.current, filename, grnData);
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
    grnData: GoodsReceivedType
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
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pdfWidth - margin * 2;

    const imgWidth = contentWidth;
    const availableContentHeight = pdfHeight - margin * 2;
    const pageContentHeightPx =
      (availableContentHeight * canvas.width) / imgWidth;
    const totalPages = Math.ceil(canvas.height / pageContentHeightPx);

    // Process each page
    for (let i = 0; i < totalPages; i++) {
      if (i > 0) {
        pdf.addPage();
      }

      const startY = i * pageContentHeightPx;
      const remainingHeight = canvas.height - startY;
      const pageImgHeightPx = Math.min(pageContentHeightPx, remainingHeight);
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
        "FAST",
        0
      );
    }

    const pdfBlob = pdf.output("blob");
    return new File([pdfBlob], filename, { type: "application/pdf" });
  };

  const downloadPDF = async (): Promise<void> => {
    if (!grnData || !pdfRef.current) {
      toast.error("No Goods Received data available");
      return;
    }

    try {
      const filename = `${grnData.GRDCode || "GRN"}.pdf`;
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
          text: `Goods Received Note - ${grnData.GRDCode || ""}`,
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
    if (!grnData) {
      toast.error("No Goods Received data available");
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
