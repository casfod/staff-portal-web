import { FaFileImage, FaFilePdf, FaFileAlt, FaFileExcel, FaFile } from 'react-icons/fa';
import { IFile } from '../../interfaces';
import { useFileDownload } from '../../hooks/useFileDownload';

interface FileAttachmentProps {
  file: IFile;
  onDelete?: () => void;
  isDeleting?: boolean;
  isDisabled?: boolean; // ✅ NEW
}

export const FileAttachment = ({
  file,
  onDelete,
  isDeleting,
  isDisabled = false,
}: FileAttachmentProps) => {
  const { downloadFile, isDownloading } = useFileDownload();

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <FaFileImage />;
      case 'pdf':
        return <FaFilePdf />;
      case 'document':
        return <FaFileAlt />;
      case 'spreadsheet':
        return <FaFileExcel />;
      default:
        return <FaFile />;
    }
  };

  const handleDownload = async () => {
    const fileId = file.id ?? file._id;
    if (!fileId) {
      console.error('Download failed: file has no id/_id', file);
      return;
    }

    await downloadFile({
      fileId: String(fileId).replace(/['"]/g, '').trim(),
      fileName: file.name,
      fileType: file.fileType,
      mimeType: file.mimeType,
    });
  };

  return (
    <div
      className={`flex flex-col lg:flex-row gap-1 items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 ${isDisabled ? 'opacity-60' : ''}`}
    >
      <span className="text-2xl mr-3">{getFileIcon(file.fileType)}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-wrap truncate">{file.name}</p>
        <p className="text-xs text-gray-500">
          {Math.round(file.size / 1024)} KB • {file.fileType}
        </p>
      </div>

      <div className="flex justify-between sm:justify-start">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="ml-3 px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-md hover:bg-blue-100 disabled:opacity-50"
        >
          {isDownloading ? 'Downloading...' : 'Download'}
        </button>
        {onDelete && (
          <button
            onClick={() => {
              if (window.confirm(`Delete "${file.name}"? This cannot be undone.`)) {
                onDelete();
              }
            }}
            disabled={isDeleting || isDisabled}
            className={`ml-2 px-3 py-1 text-sm rounded-md ${
              isDisabled
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            } disabled:opacity-50`}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  );
};
