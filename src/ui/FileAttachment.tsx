import {
  FaFileImage,
  FaFilePdf,
  FaFileAlt,
  FaFileExcel,
  FaFile,
} from "react-icons/fa";
import { saveAs } from "file-saver";
import { FileType } from "../interfaces";

export const FileAttachment = ({ file }: { file: FileType }) => {
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "image":
        return <FaFileImage />;
      case "pdf":
        return <FaFilePdf />;
      case "document":
        return <FaFileAlt />;
      case "spreadsheet":
        return <FaFileExcel />;
      default:
        return <FaFile />;
    }
  };

  // Map file types to extensions
  const getExtension = (fileType: string, mimeType?: string): string => {
    if (mimeType) {
      // Extract extension from mimeType if available
      const mimeExtensions: Record<string, string> = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/gif": ".gif",
        "application/pdf": ".pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          ".docx",
        "application/msword": ".doc",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
          ".xlsx",
        "application/vnd.ms-excel": ".xls",
      };
      return mimeExtensions[mimeType] || "";
    }

    // Fallback to fileType if mimeType not available
    switch (fileType) {
      case "image":
        return ".jpg";
      case "pdf":
        return ".pdf";
      case "document":
        return ".docx";
      case "spreadsheet":
        return ".xlsx";
      default:
        return "";
    }
  };

  // Ensure filename has proper extension
  const getDownloadName = (
    name: string,
    fileType: string,
    mimeType?: string
  ): string => {
    // If name already has an extension, use as-is
    if (/\.[^/.]+$/.test(name)) {
      return name;
    }

    // Otherwise add appropriate extension
    const extension = getExtension(fileType, mimeType);
    return extension ? `${name}${extension}` : name;
  };

  // Handle download with proper filename
  const handleDownload = async () => {
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();

      // Determine the correct filename
      const filename = getDownloadName(file.name, file.fileType, file.mimeType);

      // Use file-saver to download with proper filename
      saveAs(blob, filename);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback to regular download if file-saver fails
      window.open(file.url, "_blank");
    }
  };

  return (
    <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
      <span className="text-2xl mr-3">{getFileIcon(file.fileType)}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {file.name}
        </p>
        <p className="text-xs text-gray-500">
          {Math.round(file.size / 1024)} KB • {file.fileType}
        </p>
      </div>
      <button
        onClick={handleDownload}
        className="ml-3 px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-md hover:bg-blue-100"
      >
        Download
      </button>
    </div>
  );
};

// const getFileIcon = (fileType: string) => {
//   switch (fileType) {
//     case "image":
//       return <FaFileImage className="text-blue-500" />;
//     case "pdf":
//       return <FaFilePdf className="text-red-500" />;
//     case "document":
//       return <FaFileAlt className="text-green-500" />;
//     case "spreadsheet":
//       return <FaFileExcel className="text-green-600" />;
//     default:
//       return <FaFile className="text-gray-500" />;
//   }
// };
