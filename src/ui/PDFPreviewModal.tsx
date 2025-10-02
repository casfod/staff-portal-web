// ui/PDFPreviewModal.tsx
import React from "react";
// import { X, Download } from "lucide-react";
import { X } from "lucide-react";
import Button from "./Button";

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  isGenerating: boolean;
  title: string;
  children: React.ReactNode;
}

const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  // onDownload,
  // isGenerating,
  title,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <div className="flex gap-2">
            {/* <Button
              type="button"
              variant="primary"
              size="small"
              onClick={onDownload}
              disabled={isGenerating}
            >
              <Download className="h-4 w-4 mr-1" />
              {isGenerating ? "Generating..." : "Download PDF"}
            </Button> */}
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white border rounded">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal;
