// src/components/custom/FileAttachmentContainer.tsx
import { Loader2, Paperclip, X } from 'lucide-react';
import { useState } from 'react';
import { useEntityFiles } from '../../hooks/useFile';
import { FileAttachment } from './FileAttachment';
import { FileUpload } from './FileUpload';
import { useModelConfig } from '../../hooks/useModelConfig';
import { Button } from '../ui/button';

interface FileAttachmentContainerProps {
  modelName: string;
  id: string;
  status?: string;
  canManage?: boolean;
}

const FileAttachmentContainer = ({
  modelName,
  id,
  status = '',
  canManage = false,
}: FileAttachmentContainerProps) => {
  const { files, isLoading, deleteFile } = useEntityFiles(modelName, id);
  const {
    canManageFiles: canManageByConfig,
    getAllowedFileTypes,
    getMaxFileSizeMB,
  } = useModelConfig(modelName);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Determine if file management is allowed
  const canManageFiles = canManage && canManageByConfig(status);

  // Toggle upload area
  const toggleUpload = () => setIsUploadOpen(!isUploadOpen);

  // Handle successful upload - close the upload area
  const handleUploadComplete = () => {
    setIsUploadOpen(false);
  };

  return (
    <div>
      <div className="flex flex-wrap md:flex-row md:items-center gap-2 justify-between my-4">
        <h2 className="font-semibold tracking-wide break-words">FILE ATTACHMENTS</h2>

        {canManageFiles && (
          <Button
            variant={isUploadOpen ? 'destructive' : 'outline'}
            size="sm"
            onClick={toggleUpload}
            className="flex items-center gap-2"
          >
            {isUploadOpen ? (
              <>
                <X className="h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <Paperclip className="h-4 w-4" />
                {files.length > 0 ? 'Add Files' : 'Upload Files'}
              </>
            )}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
        </div>
      ) : (
        <>
          {/* Upload area - conditionally rendered */}
          {isUploadOpen && canManageFiles && (
            <div className="">
              <FileUpload
                autoUpload
                associatedModel={modelName}
                associatedId={id}
                uploadButtonText="Upload files"
                accept={getAllowedFileTypes().join(',')}
                maxSizeMB={getMaxFileSizeMB()}
                onUploadComplete={handleUploadComplete}
              />
            </div>
          )}

          {/* File list */}
          {files.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {files.map(file => (
                  <FileAttachment
                    key={file.id ?? file._id}
                    file={file}
                    onDelete={canManageFiles ? () => deleteFile(file.id ?? file._id) : undefined}
                    isDisabled={!canManageFiles}
                  />
                ))}
              </div>

              {!canManageFiles && canManage && files.length > 0 && (
                <p className="text-center text-sm text-amber-600 py-2">
                  Files cannot be modified when status is "{status}"
                </p>
              )}
            </>
          ) : (
            <p className="text-center text-sm text-gray-500 py-6">
              {canManageFiles
                ? 'Click "Upload Files" to add attachments'
                : 'No attachments have been added to this document.'}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default FileAttachmentContainer;
