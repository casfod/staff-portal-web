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
};

const defaultOptions: PdfOptions = {
  filename: "document.pdf",
  format: "a4",
  orientation: "portrait",
  scale: 2,
  margin: 10,
  quality: 1,
  backgroundColor: "#FFFFFF",
};

/**
 * Generates a high-quality PDF from a DOM element
 * @param element The DOM element to convert
 * @param options PDF generation options
 * @returns Promise that resolves when PDF is generated
 */
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
  } = { ...defaultOptions, ...options };

  try {
    // Clone the element to avoid affecting the original DOM
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    clone.style.width = `${element.offsetWidth}px`;
    document.body.appendChild(clone);

    // Generate canvas with optimized settings
    const canvas = await html2canvas(clone, {
      scale: scale! * (quality || 1),
      useCORS: true,
      logging: false,
      backgroundColor,
      removeContainer: true,
      ignoreElements: (el) => ["BUTTON", "A", "INPUT"].includes(el.tagName),
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    document.body.removeChild(clone);

    // Initialize PDF
    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format,
    });

    // Calculate dimensions
    const pageWidth = pdf.internal.pageSize.getWidth() - margin! * 2;
    const pageHeight = pdf.internal.pageSize.getHeight() - margin! * 2;
    const imgRatio = canvas.width / canvas.height;

    let imgWidth = pageWidth;
    let imgHeight = pageWidth / imgRatio;

    // Adjust if image is taller than page
    if (imgHeight > pageHeight) {
      imgHeight = pageHeight;
      imgWidth = pageHeight * imgRatio;
    }

    // Center the image on the page
    const x = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;
    const y = (pdf.internal.pageSize.getHeight() - imgHeight) / 2;

    // Add image to PDF
    pdf.addImage(
      canvas.toDataURL("image/jpeg", 1.0),
      "JPEG",
      x,
      y,
      imgWidth,
      imgHeight
    );

    // Save PDF
    pdf.save(filename);
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw new Error(
      `Failed to generate PDF: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

/**
 * Generates a multi-page PDF for large content
 * @param element The DOM element to convert
 * @param options PDF generation options
 * @returns Promise that resolves when PDF is generated
 */
export const generateMultiPagePdf = async (
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
  } = { ...defaultOptions, ...options };

  try {
    // Clone the element
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    clone.style.width = `${element.offsetWidth}px`;
    document.body.appendChild(clone);

    // Generate canvas
    const canvas = await html2canvas(clone, {
      scale: scale! * (quality || 1),
      useCORS: true,
      logging: false,
      backgroundColor,
      removeContainer: true,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    document.body.removeChild(clone);

    // Initialize PDF
    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format,
    });

    // Page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth() - margin! * 2;
    const pageHeight = pdf.internal.pageSize.getHeight() - margin! * 2;

    // Image dimensions
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const totalPages = Math.ceil(imgHeight / pageHeight);

    // Add pages with content
    for (let i = 0; i < totalPages; i++) {
      if (i > 0) pdf.addPage();

      const position = -i * pageHeight;
      // const height = Math.min(pageHeight, imgHeight - i * pageHeight);

      pdf.addImage(
        canvas.toDataURL("image/jpeg", 1.0),
        "JPEG",
        margin!,
        margin!,
        imgWidth,
        imgHeight,
        undefined,
        "FAST",
        position
      );
    }

    pdf.save(filename);
  } catch (error) {
    console.error("Multi-page PDF generation failed:", error);
    throw new Error(
      `Failed to generate multi-page PDF: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};
