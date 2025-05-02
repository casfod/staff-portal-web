import { useState, useEffect } from "react";
import { uploadFile, getFileList, deleteFile } from "../services/apiFileUpload";

interface FileItem {
  _id: string;
  name: string;
  url: string;
  createdAt: string;
}

export default function UploadFiles() {
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null); // Clear any previous errors when new file is selected
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setIsLoading(true);
    try {
      const uploadedFile = await uploadFile(file);
      setFiles((prev) => [uploadedFile, ...prev]);
      setFile(null);
    } catch (err) {
      setError("Failed to upload file. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const fileList = await getFileList();
      setFiles(fileList);
    } catch (err) {
      setError("Failed to fetch files. Please try again.");
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteFile(id);
      setFiles((prev) => prev.filter((file) => file._id !== id));
    } catch (err) {
      setError("Failed to delete file. Please try again.");
      console.error("Delete error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Upload File</h1>
      <div className="flex items-center mb-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="border p-2 rounded"
          disabled={isLoading}
        />
        <button
          onClick={handleUpload}
          disabled={isLoading || !file}
          className="bg-blue-500 text-white px-4 py-2 rounded ml-2 disabled:bg-blue-300"
        >
          {isLoading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <h2 className="text-xl font-semibold mt-8 mb-4">Uploaded Files</h2>
      {isLoading && files.length === 0 ? (
        <p>Loading files...</p>
      ) : files.length === 0 ? (
        <p>No files uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <div key={file._id} className="border p-2 rounded shadow-sm">
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                <img
                  src={file.url}
                  alt={file.name}
                  className="h-40 w-full object-contain mx-auto bg-gray-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/150?text=File+Preview";
                  }}
                />
              </a>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm truncate" title={file.name}>
                  {file.name}
                </p>
                <button
                  onClick={() => handleDelete(file._id)}
                  disabled={isLoading}
                  className="bg-red-500 text-white px-2 py-1 rounded text-sm disabled:bg-red-300"
                >
                  Delete
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(file.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
