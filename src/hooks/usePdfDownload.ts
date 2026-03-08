// usePdfDownload.ts - Unified hook: download, preview, or generate a File
import { useState, useCallback, RefObject } from "react";
import { generatePdf, PdfOptions } from "../utils/generatePdf";
import toast from "react-hot-toast";

export type PdfDownloadStatus = "idle" | "generating" | "success" | "error";

export type UsePdfDownloadOptions = PdfOptions & {
  /**
   * Optional separate ref pointing to an off-screen PDF template element.
   * When provided, `generateFile()` renders that element instead of the
   * main content ref — enabling the "dedicated template" pattern used by
   * PaymentVoucher, GRN, and RFQ without requiring a separate hook.
   */
  templateRef?: RefObject<HTMLElement>;
};

/**
 * Unified PDF hook.
 *
 * Backward-compatible: every existing call site that uses only
 * `downloadPdf(ref)` continues to work without any changes.
 *
 * New capabilities:
 *  - `generateFile(ref?)` — returns a `File` (for uploading), uses
 *    `templateRef` automatically when available.
 *  - `previewPdf(setOpen)` — just opens a preview modal; no generation needed
 *    because the template is already rendered off-screen.
 *  - Pass `footerCode: { label, value }` in options for the standard
 *    "Code: xxx  |  Page N of M" footer without wiring up footerOptions manually.
 */
export const usePdfDownload = (defaultOptions?: UsePdfDownloadOptions) => {
  const [status, setStatus] = useState<PdfDownloadStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // ── Internal runner ────────────────────────────────────────────────────────
  const run = useCallback(
    async <T extends void | File>(
      elementRef: RefObject<HTMLElement>,
      options: PdfOptions,
      returnFile: boolean
    ): Promise<T> => {
      if (!elementRef.current) {
        const msg = "Component reference is not available";
        setError(msg);
        setStatus("error");
        throw new Error(msg);
      }

      try {
        setStatus("generating");
        setError(null);

        const mergedOptions: PdfOptions = { ...defaultOptions, ...options };

        let result: void | File;
        if (returnFile) {
          result = await generatePdf(elementRef.current, {
            ...mergedOptions,
            returnFile: true,
          });
        } else {
          await generatePdf(elementRef.current, {
            ...mergedOptions,
            returnFile: false,
          });
          result = undefined;
        }

        setStatus("success");
        setTimeout(() => setStatus("idle"), 2000);
        return result as T;
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to generate PDF";
        setError(msg);
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
        throw err;
      }
    },
    [defaultOptions]
  );

  // ── downloadPdf ────────────────────────────────────────────────────────────
  /**
   * Generate and immediately download the PDF.
   * Identical signature to the original hook — zero changes needed at call sites.
   */
  const downloadPdf = useCallback(
    async (elementRef: RefObject<HTMLElement>, options?: PdfOptions) => {
      await run<void>(elementRef, { save: true, ...options }, false);
    },
    [run]
  );

  // ── generateFile ───────────────────────────────────────────────────────────
  /**
   * Generate the PDF and return it as a `File` object (for uploading).
   *
   * Priority for the source element:
   *   1. `ref` argument (explicit override)
   *   2. `defaultOptions.templateRef` (off-screen dedicated template)
   *   3. throws if neither is available
   *
   * Example — PaymentVoucher:
   *   const { generateFile } = usePdfDownload({ ..., templateRef: pdfRef, footerCode: { label: "PV Number", value: pvNumber } });
   *   const file = await generateFile(); // uses pdfRef automatically
   *   await uploadFile(file);
   */
  const generateFile = useCallback(
    async (
      ref?: RefObject<HTMLElement>,
      options?: PdfOptions
    ): Promise<File> => {
      const targetRef = ref ?? defaultOptions?.templateRef;
      if (!targetRef) {
        throw new Error(
          "generateFile requires either a ref argument or templateRef in options"
        );
      }
      return run<File>(
        targetRef,
        { save: false, returnFile: true, ...options } as PdfOptions,
        true
      );
    },
    [run, defaultOptions?.templateRef]
  );

  // ── previewPdf ─────────────────────────────────────────────────────────────
  /**
   * Open a preview modal. Since the template is already rendered off-screen,
   * no generation is needed at this point — just flip the boolean.
   *
   *  const [showPreview, setShowPreview] = useState(false);
   *  <button onClick={() => previewPdf(setShowPreview)}>Preview</button>
   *  <PDFPreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} ... />
   */
  const previewPdf = useCallback(
    (setOpen: (v: boolean) => void, data?: unknown) => {
      if (data === null || data === undefined) {
        // Caller passed data explicitly and it's empty — guard
        toast.error("No data available for preview");
        return;
      }
      setOpen(true);
    },
    []
  );

  return {
    // ── Existing API (unchanged) ───────────────────────────────────────────
    downloadPdf,
    status,
    error,
    isGenerating: status === "generating",
    isSuccess: status === "success",
    isError: status === "error",

    // ── New API ───────────────────────────────────────────────────────────
    generateFile,
    previewPdf,
  };
};
