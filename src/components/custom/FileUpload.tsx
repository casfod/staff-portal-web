// src/components/custom/FileUpload.tsx
import React, { useState, DragEvent, useCallback, useEffect } from 'react';
import { Upload, X, File, Image, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useFileUpload } from '../../hooks/useFile';
import { IFile } from '../../interfaces';

interface FileUploadProps {
  onFilesSelected?: (files: File[]) => void;
  onUploadComplete?: (files: IFile[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  selectedFiles?: File[];
  setSelectedFiles?: (files: File[]) => void;
  // Auto-upload props
  autoUpload?: boolean;
  associatedModel?: string;
  associatedId?: string;
  folder?: string;
  // Upload button
  showUploadButton?: boolean;
  uploadButtonText?: string;
  // State
  isUploading?: boolean;
  uploadError?: string | null;
  disabled?: boolean; // ✅ NEW
}

const getFileIcon = (file: File) => {
  const type = file.type;
  if (type.startsWith('image/')) return <Image className="h-4 w-4 text-blue-500" />;
  if (type === 'application/pdf') return <FileText className="h-4 w-4 text-red-500" />;
  if (type.includes('spreadsheet') || type.includes('excel'))
    return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
  if (type.includes('document') || type.includes('word'))
    return <FileText className="h-4 w-4 text-blue-600" />;
  return <File className="h-4 w-4 text-gray-500" />;
};

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  onUploadComplete,
  accept = '.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xlsx,.xls',
  multiple = true,
  maxFiles = 10,
  maxSizeMB = 10,
  selectedFiles: externalSelectedFiles,
  setSelectedFiles: externalSetSelectedFiles,
  autoUpload = false,
  associatedModel,
  associatedId,
  folder,
  showUploadButton = true,
  uploadButtonText = 'Upload Files',
  isUploading: externalIsUploading,
  uploadError: externalUploadError,
  disabled = false,
}) => {
  // Use internal state if external not provided (backward compatibility)
  const [internalSelectedFiles, setInternalSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Determine if using internal or external state
  const selectedFiles = externalSelectedFiles ?? internalSelectedFiles;
  const setSelectedFiles = externalSetSelectedFiles ?? setInternalSelectedFiles;

  // Use the file upload hook for auto-upload
  const {
    uploadFiles,
    isUploading: hookIsUploading,
    error: hookError,
  } = useFileUpload({
    associatedModel,
    associatedId,
    folder,
    onSuccess: files => {
      onUploadComplete?.(files);
      if (autoUpload) {
        setSelectedFiles([]);
      }
    },
  });

  const [isDragging, setIsDragging] = useState(false);
  const isUploading = externalIsUploading ?? hookIsUploading;
  const uploadErrorMessage = externalUploadError ?? hookError?.response?.data?.message;

  // Validate files
  const validateFiles = useCallback(
    (files: File[]) => {
      if (!multiple && files.length > 1) {
        setError('Only one file is allowed.');
        return false;
      }
      if (files.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed.`);
        return false;
      }
      for (const file of files) {
        if (file.size > maxSizeMB * 1024 * 1024) {
          setError(`File "${file.name}" exceeds ${maxSizeMB}MB limit.`);
          return false;
        }
      }
      setError(null);
      return true;
    },
    [multiple, maxFiles, maxSizeMB]
  );

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (validateFiles(newFiles)) {
      const updatedFiles = multiple ? [...selectedFiles, ...newFiles] : newFiles;
      setSelectedFiles(updatedFiles);
      onFilesSelected?.(updatedFiles);

      // Auto-upload if enabled
      if (autoUpload && updatedFiles.length > 0) {
        uploadFiles(updatedFiles);
      }
    }
    e.target.value = ''; // Reset input
  };

  // Handle drag and drop
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const newFiles = Array.from(e.dataTransfer.files || []);
    if (validateFiles(newFiles)) {
      const mergedFiles = multiple
        ? [...selectedFiles, ...newFiles].filter(
            (file, index, self) =>
              index === self.findIndex(f => f.name === file.name && f.size === file.size)
          )
        : newFiles;
      setSelectedFiles(mergedFiles);
      onFilesSelected?.(mergedFiles);

      // Auto-upload if enabled
      if (autoUpload && mergedFiles.length > 0) {
        uploadFiles(mergedFiles);
      }
    }
  };

  // Handle manual upload
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('No files selected');
      return;
    }
    const result = await uploadFiles(selectedFiles);
    if (result) {
      setSelectedFiles([]);
    }
  };

  // Remove a file from selection
  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    onFilesSelected?.(newFiles);
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (uploadErrorMessage) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadErrorMessage]);

  if (disabled) {
    return (
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center opacity-60">
        <p className="text-sm text-gray-500">File uploads are disabled for this document</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200',
          isDragging
            ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500 ring-offset-2'
            : 'border-gray-300 hover:border-gray-400',
          isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && document.getElementById('file-upload')?.click()}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className={cn('p-3 rounded-full', isDragging ? 'bg-brand-100' : 'bg-gray-100')}>
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            ) : (
              <Upload className={cn('h-8 w-8', isDragging ? 'text-brand-600' : 'text-gray-400')} />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              {isUploading ? (
                'Uploading...'
              ) : (
                <>
                  <span className="text-brand-600 hover:text-brand-700">Click to upload</span> or
                  drag and drop
                </>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {multiple
                ? `Supports ${accept} (Max ${maxFiles} files)`
                : `Supports ${accept} (Single file)`}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Max file size: {maxSizeMB}MB</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {(error || uploadErrorMessage) && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          <span className="font-medium">Error:</span>
          <span>{error || uploadErrorMessage}</span>
        </div>
      )}

      {/* File Previews */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Selected Files ({selectedFiles.length})
            </h4>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {formatFileSize(selectedFiles.reduce((acc, f) => acc + f.size, 0))}
              </Badge>
              {!isUploading && !autoUpload && showUploadButton && (
                <Button size="sm" onClick={handleUpload} disabled={isUploading}>
                  {uploadButtonText}
                </Button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                {getFileIcon(file)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                {!isUploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
