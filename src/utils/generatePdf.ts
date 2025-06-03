// generatePdf.ts
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export type PdfOptions = {
  filename?: string;
  format?: "a4" | "a3" | "letter" | "legal";
  orientation?: "portrait" | "landscape";
  scale?: number;
  margin?: number;
  quality?: number;
  backgroundColor?: string;
  letterRendering?: boolean;
  enableLinks?: boolean;
  pagebreak?: {
    mode?: "css";
    avoid?: string[];
  };
  multiPage?: boolean; // New flag to toggle multi-page behavior
};

const defaultOptions: PdfOptions = {
  filename: "document.pdf",
  format: "a4",
  orientation: "portrait",
  scale: 2,
  margin: 10,
  quality: 0.95,
  backgroundColor: "#FFFFFF",
  letterRendering: true,
  enableLinks: true,
  pagebreak: {
    mode: "css",
    avoid: [".pdf-avoid-break"],
  },
  multiPage: false,
};

const getPdfDimensions = (format: string, orientation: string) => {
  const pageSizes: Record<string, [number, number]> = {
    a4: [210, 297],
    a3: [297, 420],
    letter: [215.9, 279.4],
    legal: [215.9, 355.6],
  };

  let [width, height] = pageSizes[format] || pageSizes.a4;
  return orientation === "landscape"
    ? { width: height, height: width }
    : { width, height };
};

export const generatePdf = async (
  element: HTMLElement,
  options: Partial<PdfOptions> = {}
): Promise<void> => {
  const {
    filename,
    format,
    orientation,
    scale,
    margin,
    quality,
    backgroundColor,
    // letterRendering,
    enableLinks,
    pagebreak,
    multiPage,
    compression = "FAST",
  } = { ...defaultOptions, ...options };

  try {
    // Prepare the element
    const originalClasses = element.className;
    element.classList.add("pdf-container");

    // Generate canvas with enhanced settings
    const canvas = await html2canvas(element, {
      scale: scale! * quality!,
      useCORS: true,
      allowTaint: true,
      // letterRendering,
      backgroundColor,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        // Handle links
        if (enableLinks) {
          clonedDoc.querySelectorAll("a").forEach((link) => {
            link.style.color = "inherit";
            link.style.textDecoration = "underline";
          });
        }
        // Handle page breaks
        pagebreak?.avoid?.forEach((selector) => {
          clonedDoc.querySelectorAll(selector).forEach((el) => {
            (el as HTMLElement).style.pageBreakInside = "avoid";
          });
        });
      },
    });

    // Restore original element
    element.className = originalClasses;

    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format,
      compress: true,
    });

    const { width: pdfWidth, height: pdfHeight } = getPdfDimensions(
      format!,
      orientation!
    );
    const contentWidth = pdfWidth - margin! * 2;
    const contentHeight = pdfHeight - margin! * 2;

    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (multiPage && imgHeight > contentHeight) {
      // Multi-page logic
      let remainingHeight = imgHeight;
      let position = margin;

      while (remainingHeight > 0) {
        const viewportHeight = Math.min(contentHeight, remainingHeight);
        pdf.addImage(
          canvas.toDataURL("image/jpeg", quality),
          "JPEG",
          margin!,
          position!,
          imgWidth,
          viewportHeight,
          undefined,
          compression,
          undefined
        );

        remainingHeight -= contentHeight;
        position! -= contentHeight;

        if (remainingHeight > 0) {
          pdf.addPage();
        }
      }
    } else {
      // Single-page logic (scaled to fit)
      const scaleFactor = Math.min(
        contentWidth / imgWidth,
        contentHeight / imgHeight
      );

      pdf.addImage(
        canvas.toDataURL("image/jpeg", quality),
        "JPEG",
        margin!,
        margin!,
        imgWidth * scaleFactor,
        imgHeight * scaleFactor,
        undefined,
        compression,
        undefined
      );
    }

    pdf.save(filename);
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  }
};
