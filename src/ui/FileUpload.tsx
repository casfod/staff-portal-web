import React, { useState, DragEvent } from "react";

interface FileUploadProps {
  onFilesSelected?: (files: File[]) => void; // Optional callback
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  selectedFiles: File[]; // Controlled from parent
  setSelectedFiles: (files: File[]) => void; // Handler from parent
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  accept = ".jpg,.png,.pdf,.doc,.docx,.xlsx",
  multiple = true,
  maxFiles = 10,
  maxSizeMB = 5,
  selectedFiles,
  setSelectedFiles,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Validate files (optional, can be removed if not needed)
  const validateFiles = (files: File[]) => {
    if (!multiple && files.length > 1) {
      setError("Only one file is allowed.");
      return false;
    }
    if (files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed.`);
      return false;
    }
    for (const file of files) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File ${file.name} exceeds ${maxSizeMB}MB limit.`);
        return false;
      }
    }
    setError(null);
    return true;
  };

  // Your simplified handler (controlled by parent)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (validateFiles(newFiles)) {
      // Merge files if `multiple=true`, else replace
      const updatedFiles = multiple
        ? [...selectedFiles, ...newFiles]
        : newFiles;
      setSelectedFiles(updatedFiles);
      if (onFilesSelected) onFilesSelected(updatedFiles);
    }
  };

  // Drag-and-drop handlers
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
              index ===
              self.findIndex(
                (f) => f.name === file.name && f.size === file.size
              )
          )
        : newFiles;
      setSelectedFiles(mergedFiles);
      if (onFilesSelected) onFilesSelected(mergedFiles);
    }
  };

  // Remove a file
  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    if (onFilesSelected) onFilesSelected(newFiles);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center justify-center space-y-2"
        >
          <UploadIcon />
          <p className="text-sm text-gray-600">
            <span className="font-medium text-blue-600 hover:text-blue-500">
              Click to upload
            </span>{" "}
            or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            {multiple
              ? `Supports ${accept} (Max ${maxFiles} files)`
              : `Supports ${accept} (Single file)`}
          </p>
        </label>
      </div>

      {/* Error Message */}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* File Previews */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
          <ul className="space-y-2">
            {selectedFiles.map((file, index) => (
              <FileItem
                key={index}
                file={file}
                onRemove={() => removeFile(index)}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Subcomponents for cleaner code
const UploadIcon = () => (
  <svg
    className="w-10 h-10 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
);

const FileItem = ({ file, onRemove }: { file: File; onRemove: () => void }) => (
  <li className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
    <span className="text-sm text-gray-600 truncate max-w-xs">
      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
    </span>
    <button onClick={onRemove} className="text-red-500 hover:text-red-700">
      <TrashIcon />
    </button>
  </li>
);

const TrashIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);
