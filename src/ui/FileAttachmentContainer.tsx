import { FileType } from "../interfaces";
import { FileAttachment } from "./FileAttachment";

const FileAttachmentContainer = ({ files }: { files: FileType[] }) => {
  return (
    <>
      <h2 className="text-center   font-semibold tracking-wide my-4 break-words">
        FILE ATTACHMENTS
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {files.map((file, index) => (
          <FileAttachment key={index} file={file} />
        ))}
      </div>
    </>
  );
};

export default FileAttachmentContainer;
