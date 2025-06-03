import { useState, useCallback, RefObject } from "react";
import {
  generatePdf,
  generateMultiPagePdf,
  PdfOptions,
} from "../utils/generatePdf";

// Define the status type since it wasn't included in the util
export type PdfDownloadStatus = "idle" | "generating" | "success" | "error";

/**
 * Custom hook for downloading React components as PDFs
 * @param defaultOptions Default PDF generation options
 */
export const usePdfDownload = (defaultOptions?: PdfOptions) => {
  const [status, setStatus] = useState<PdfDownloadStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  /**
   * Internal handler to run PDF logic
   */
  const handleDownload = useCallback(
    async (
      elementRef: RefObject<HTMLElement>,
      options: PdfOptions | undefined,
      generator: typeof generatePdf | typeof generateMultiPagePdf
    ) => {
      if (!elementRef.current) {
        setError("Component reference is not available");
        setStatus("error");
        return;
      }

      try {
        setStatus("generating");
        setError(null);

        const mergedOptions = { ...defaultOptions, ...options };
        await generator(elementRef.current, mergedOptions);

        setStatus("success");
        setTimeout(() => setStatus("idle"), 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate PDF");
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    },
    [defaultOptions]
  );

  /**
   * Download a single-page PDF using a ref
   */
  const downloadPdf = useCallback(
    async (elementRef: RefObject<HTMLElement>, options?: PdfOptions) => {
      await handleDownload(elementRef, options, generatePdf);
    },
    [handleDownload]
  );

  /**
   * Download a multi-page PDF using a ref
   */
  const downloadMultiPagePdf = useCallback(
    async (elementRef: RefObject<HTMLElement>, options?: PdfOptions) => {
      await handleDownload(elementRef, options, generateMultiPagePdf);
    },
    [handleDownload]
  );

  return {
    downloadPdf,
    downloadMultiPagePdf,
    status,
    error,
    isGenerating: status === "generating",
    isSuccess: status === "success",
    isError: status === "error",
  };
};
