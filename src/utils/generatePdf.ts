// generatePdf.ts - Updated version with default titleOptions
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export type PdfOptions = {
  title?: string;
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
  multiPage?: boolean;
  titleOptions?: {
    text?: string;
    fontSize?: number;
    fontStyle?: "normal" | "bold" | "italic" | "bolditalic";
    color?: string;
    marginBottom?: number;
  };
  save?: boolean;
};

const defaultOptions: PdfOptions = {
  filename: "document.pdf",
  format: "a4",
  orientation: "portrait",
  scale: 2,
  margin: 10,
  quality: 1,
  backgroundColor: "#FFFFFF",
  letterRendering: true,
  enableLinks: true,
  pagebreak: {
    mode: "css",
    avoid: [".pdf-avoid-break"],
  },
  multiPage: false,
  titleOptions: {
    // Add default titleOptions
    text: "",
    fontSize: 16,
    fontStyle: "bold",
    color: "#000000",
    marginBottom: 5,
  },
  save: true,
};

const getPdfDimensions = (format: string, orientation: string) => {
  const pageSizes: Record<string, [number, number]> = {
    a4: [210, 297],
    a3: [297, 420],
    letter: [215.9, 279.4],
    legal: [215.9, 355.6],
  };

  const [width, height] = pageSizes[format] || pageSizes.a4;
  return orientation === "landscape"
    ? { width: height, height: width }
    : { width, height };
};

export const generatePdf = async (
  element: HTMLElement,
  options: Partial<PdfOptions> = {}
): Promise<void> => {
  const {
    filename = "document.pdf",
    format = "a4",
    orientation = "portrait",
    scale = 2,
    margin = 5, // Reduced from 10 to 5
    quality = 1,
    backgroundColor = "#FFFFFF",
    enableLinks = true,
    pagebreak = { mode: "css", avoid: [".pdf-avoid-break"] },
    multiPage = false,
    compression = "FAST",
    save,
    titleOptions = {
      text: "",
      fontSize: 16,
      fontStyle: "bold",
      color: "#000000",
      marginBottom: 5,
    },
  } = { ...defaultOptions, ...options };

  try {
    // Prepare the element
    const originalClasses = element.className;
    element.classList.add("pdf-container");

    // Generate canvas
    const canvas = await html2canvas(element, {
      scale: scale * quality,
      useCORS: true,
      allowTaint: true,
      backgroundColor,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        if (enableLinks) {
          clonedDoc.querySelectorAll("a").forEach((link) => {
            link.style.color = "inherit";
            link.style.textDecoration = "underline";
          });
        }
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
      format,
      orientation
    );
    const contentWidth = pdfWidth - margin * 2;
    const contentHeight = pdfHeight - margin * 2;

    // Calculate image dimensions (in PDF units)
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add title if provided
    let titleHeight = 0;
    if (titleOptions?.text) {
      const {
        text,
        fontSize = 16,
        fontStyle = "bold",
        color = "#000000",
        marginBottom = 5,
      } = titleOptions;

      pdf.setFontSize(fontSize);
      pdf.setFont("helvetica", fontStyle);
      pdf.setTextColor(color);

      // Calculate title width and position
      const titleWidth = pdf.getTextWidth(text);
      const titleX = margin + (contentWidth - titleWidth) / 2;
      const titleY = margin + fontSize / 2;

      pdf.text(text, titleX, titleY);
      titleHeight = fontSize + marginBottom;
    }

    const adjustedMarginTop = margin + titleHeight;

    if (multiPage) {
      // MULTI-PAGE LOGIC (UPDATED WITH TITLE SUPPORT)
      const availableContentHeight = contentHeight - titleHeight;
      const pageContentHeightPx =
        (availableContentHeight * canvas.width) / imgWidth;
      const totalPages = Math.ceil(canvas.height / pageContentHeightPx);

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage(format, orientation);
          // Add title to subsequent pages if needed
          if (titleOptions?.text) {
            const {
              text,
              fontSize = 16,
              fontStyle = "bold",
              color = "#000000",
              // marginBottom = 5,
            } = titleOptions;

            pdf.setFontSize(fontSize);
            pdf.setFont("helvetica", fontStyle);
            pdf.setTextColor(color);

            const titleWidth = pdf.getTextWidth(text);
            const titleX = margin + (contentWidth - titleWidth) / 2;
            const titleY = margin + fontSize / 2;

            pdf.text(text, titleX, titleY);
          }
        }

        // Calculate the portion of canvas to show
        const startY = i * pageContentHeightPx;
        const remainingHeight = canvas.height - startY;
        const pageImgHeightPx = Math.min(pageContentHeightPx, remainingHeight);

        // Create a temporary canvas for this page's content
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = pageImgHeightPx;

        const ctx = pageCanvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context not available");

        // Draw the portion of the original canvas
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

        // Calculate height in PDF units
        const pageImgHeight = (pageImgHeightPx * imgWidth) / canvas.width;

        pdf.addImage(
          pageCanvas.toDataURL("image/jpeg", quality),
          "JPEG",
          margin,
          adjustedMarginTop,
          imgWidth,
          pageImgHeight,
          undefined,
          compression
        );
      }
    } else {
      // SINGLE-PAGE LOGIC (UPDATED WITH TITLE SUPPORT)
      const availableContentHeight = contentHeight - titleHeight;
      const scaleFactor = Math.min(
        contentWidth / imgWidth,
        availableContentHeight / imgHeight
      );

      pdf.addImage(
        canvas.toDataURL("image/jpeg", quality),
        "JPEG",
        margin,
        adjustedMarginTop,
        imgWidth * scaleFactor,
        imgHeight * scaleFactor,
        undefined,
        compression
      );
    }

    save === true && pdf.save(filename);
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  }
};
