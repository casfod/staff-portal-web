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
  letterRendering?: boolean; // Made optional with ?
};
const defaultOptions: PdfOptions = {
  filename: "document.pdf",
  format: "a4",
  orientation: "portrait",
  scale: 1.5,
  margin: 5,
  quality: 0.88,
  backgroundColor: "#FFFFFF",
  letterRendering: true, // Default value added
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
    // Clone the element with improved isolation
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    clone.style.width = `${element.offsetWidth}px`;
    clone.style.visibility = "visible"; // Ensure visibility
    document.body.appendChild(clone);

    // Generate canvas with enhanced settings
    const canvas = await html2canvas(clone, {
      scale: scale! * (quality || 1),
      useCORS: true,
      logging: true, // Enable for debugging
      backgroundColor,
      removeContainer: true,
      ignoreElements: (el) =>
        ["BUTTON", "A", "INPUT", "VIDEO", "IFRAME"].includes(el.tagName),
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      allowTaint: true, // For external images
      // letterRendering: true, // Better text quality
    });

    document.body.removeChild(clone);

    // Initialize PDF with improved settings
    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format,
      compress: true, // Reduce file size
    });

    // Calculate dimensions with safety checks
    const pageWidth = Math.max(
      10,
      pdf.internal.pageSize.getWidth() - margin! * 2
    );
    const pageHeight = Math.max(
      10,
      pdf.internal.pageSize.getHeight() - margin! * 2
    );
    const imgRatio = canvas.width / Math.max(1, canvas.height);

    let imgWidth = pageWidth;
    let imgHeight = pageWidth / imgRatio;

    // Adjust if image is taller than page
    if (imgHeight > pageHeight) {
      imgHeight = pageHeight;
      imgWidth = pageHeight * imgRatio;
    }

    // Position at top-left with margins
    const x = margin!;
    const y = margin!;

    // Add image with quality options
    pdf.addImage(
      canvas.toDataURL("image/jpeg", quality), // Use specified quality
      "JPEG",
      x,
      y,
      imgWidth,
      imgHeight,
      undefined,
      "MEDIUM" // Compression level
    );

    // Metadata for better PDF handling
    pdf.setProperties({
      title: filename?.replace(".pdf", ""),
      creator: "PDF Generator",
      subject: "Exported content",
    });

    // Save PDF with improved filename handling
    pdf.save(filename?.endsWith(".pdf") ? filename : `${filename}.pdf`);
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

    // Page dimensions (subtract margins)
    const pageWidth = pdf.internal.pageSize.getWidth() - margin! * 2;
    const pageHeight = pdf.internal.pageSize.getHeight() - margin! * 2;

    // Calculate image dimensions to maintain aspect ratio
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const totalPages = Math.ceil(imgHeight / pageHeight);

    // Add pages with content
    for (let i = 0; i < totalPages; i++) {
      if (i > 0) pdf.addPage();

      // Calculate vertical position for this page
      const yOffset = -i * pageHeight;

      // Add image to current page
      pdf.addImage(
        canvas.toDataURL("image/jpeg", 1.0),
        "JPEG",
        margin!, // x position (left margin)
        margin!, // y position (top margin)
        imgWidth,
        imgHeight,
        undefined,
        "FAST",
        yOffset // Vertical offset for this page's content
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
