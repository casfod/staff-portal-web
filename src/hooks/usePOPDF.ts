// hooks/usePOPDF.ts
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { generatePdf } from "../utils/generatePdf";
import { PurchaseOrderType } from "../interfaces";

interface UsePOPDFReturn {
  pdfRef: React.RefObject<HTMLDivElement>;
  isGenerating: boolean;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  generatePDF: () => Promise<File | null>;
  previewPDF: () => void;
  downloadPDF: () => Promise<void>;
}

export const usePOPDF = (poData: PurchaseOrderType | null): UsePOPDFReturn => {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const generatePDF = async (): Promise<File | null> => {
    if (!poData || !poData.POCode) {
      toast.error("Purchase Order data is incomplete");
      return null;
    }

    if (!pdfRef.current) {
      toast.error("PDF template not found");
      return null;
    }

    setIsGenerating(true);

    try {
      const filename = `${poData.POCode || "PurchaseOrder"}.pdf`;
      const pdf = await generatePdfViaCanvas(pdfRef.current, filename, poData);
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
    poData: PurchaseOrderType
  ): Promise<File | null> => {
    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;

    console.log(poData);

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
    if (!poData || !pdfRef.current) {
      toast.error("No Purchase Order data available");
      return;
    }

    try {
      const filename = `${poData.POCode || "PurchaseOrder"}.pdf`;
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
          text: `Purchase Order - ${poData.POCode || ""}`,
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
    if (!poData) {
      toast.error("No Purchase Order data available");
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
