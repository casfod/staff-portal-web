import {
  FaFileImage,
  FaFilePdf,
  FaFileAlt,
  FaFileExcel,
  FaFile,
} from "react-icons/fa";
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
      <a
        href={file.url}
        download={file.name}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-3 px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-md hover:bg-blue-100"
      >
        Download
      </a>
    </div>
  );
};
