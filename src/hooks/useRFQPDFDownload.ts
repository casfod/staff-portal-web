// hooks/useRFQPDFDownload.ts
import { useState, useCallback, RefObject } from "react";
import { generatePdf, PdfOptions } from "../utils/generatePdf";

export const useRFQPDFDownload = () => {
  const [status, setStatus] = useState<
    "idle" | "generating" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const downloadRFQPDF = useCallback(
    async (
      elementRef: RefObject<HTMLElement>,
      rfqCode: string,
      options?: Partial<PdfOptions>
    ) => {
      if (!elementRef.current) {
        setError("Component reference is not available");
        setStatus("error");
        return;
      }

      try {
        setStatus("generating");
        setError(null);

        const pdfOptions: PdfOptions = {
          filename: `${rfqCode}.pdf`,
          format: "a4",
          orientation: "portrait",
          scale: 2,
          margin: 10,
          quality: 1,
          backgroundColor: "#FFFFFF",
          titleOptions: {
            text: `Request for Quotation - ${rfqCode}`,
            fontSize: 16,
            fontStyle: "bold",
            color: "#000000",
            marginBottom: 10,
          },
          ...options,
        };

        await generatePdf(elementRef.current, pdfOptions);
        setStatus("success");
        setTimeout(() => setStatus("idle"), 2000);
      } catch (err) {
        console.error("PDF generation error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to generate RFQ PDF"
        );
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    },
    []
  );

  return {
    downloadRFQPDF,
    status,
    error,
    isGenerating: status === "generating",
    isSuccess: status === "success",
    isError: status === "error",
  };
};
