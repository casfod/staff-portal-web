// PDFPreviewModal.tsx - Rewritten with Radix UI
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
  isGenerating?: boolean;
  title: string;
  children: React.ReactNode;
  orientation?: 'portrait' | 'landscape';
  showDownloadButton?: boolean;
}

const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  onDownload,
  isGenerating = false,
  title,
  children,
  orientation = 'portrait',
  showDownloadButton = true,
}) => {
  // Set modal dimensions based on orientation
  const modalWidth = orientation === 'landscape' ? 'max-w-6xl' : 'max-w-4xl';

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className={cn('flex flex-col p-0 max-h-[90vh]', modalWidth)}>
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between p-4 pt-8 border-b">
          <DialogTitle className="text-lg font-semibold text-gray-800">{title}</DialogTitle>
          <div className="flex gap-2">
            {showDownloadButton && onDownload && (
              <Button variant="primary" size="sm" onClick={onDownload} disabled={isGenerating}>
                <Download className="h-4 w-4 mr-1" />
                {isGenerating ? 'Generating...' : 'Download PDF'}
              </Button>
            )}
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 w-9 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button> */}
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white border rounded-lg overflow-hidden">{children}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFPreviewModal;
