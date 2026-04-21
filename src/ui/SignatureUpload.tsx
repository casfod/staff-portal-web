// frontend/src/ui/SignatureUpload.tsx
import React, { useCallback, useState, useRef } from "react";
import { Upload, X, Wand2, Info } from "lucide-react";
import Button from "./Button";
import ImageEditor from "./ImageEditor";

interface SignatureUploadProps {
  onUploadComplete: (file: File) => void;
  isUploading?: boolean;
  currentSignatureUrl?: string;
}

const SignatureUpload: React.FC<SignatureUploadProps> = ({
  onUploadComplete,
  isUploading = false,
  currentSignatureUrl,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPEG, or WEBP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setOriginalFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShowEditor(true);
  };

  const handleEditorSave = useCallback(
    (url: string) => {
      fetch(url)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "signature_edited.png", {
            type: "image/png",
          });
          setPreviewUrl(url);
          setEditedImageUrl(url);
          setShowEditor(false);
          onUploadComplete(file);
        });
    },
    [onUploadComplete]
  );

  const handleDirectUpload = () => {
    if (originalFile) {
      onUploadComplete(originalFile);
      setShowEditor(false);
    }
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    setEditedImageUrl(null);
    setOriginalFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      {/* Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-semibold text-blue-900">Upload Guidelines</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc pl-4">
              <li>Use a white background with dark ink for best results</li>
              <li>Sign on plain white paper and take a clear photo</li>
              <li>Ensure good lighting with no shadows</li>
              <li>Maximum file size: 5MB (PNG, JPEG, or WEBP)</li>
              <li>
                Use the image editor to remove background and enhance quality
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Dropzone or Preview */}
      {!previewUrl ? (
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors bg-gray-50">
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">
            <span className="font-semibold">Click to upload</span> or drag and
            drop
          </p>
          <p className="text-xs text-gray-400 mt-1">
            PNG, JPEG, or WEBP (max 5MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      ) : (
        <div className="space-y-3">
          <div className="relative inline-block">
            <img
              src={previewUrl}
              alt="Signature preview"
              className="max-h-32 rounded-lg border border-gray-200"
              style={{
                background:
                  "repeating-linear-gradient(45deg,#f0f0f0 0px,#f0f0f0 2px,#ffffff 2px,#ffffff 8px)",
              }}
            />
            <button
              type="button"
              onClick={clearPreview}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          {!editedImageUrl && (
            <div className="flex gap-2">
              <Button
                type="button"
                size="small"
                variant="secondary"
                onClick={clearPreview}
              >
                Choose Different File
              </Button>
              <Button
                type="button"
                size="small"
                variant="secondary"
                onClick={() => setShowEditor(true)}
              >
                <Wand2 className="h-4 w-4 mr-1" />
                Edit Image
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Current signature (read-only reference) */}
      {currentSignatureUrl && !previewUrl && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Current Signature:
          </p>
          <img
            src={currentSignatureUrl}
            alt="Current signature"
            className="max-h-20 border border-gray-200 rounded"
          />
        </div>
      )}

      {/* Image Editor Modal */}
      {showEditor && originalFile && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-blue-600" />
                Edit Signature Image
              </h3>
              <button
                onClick={() => setShowEditor(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <ImageEditor
                imageFile={originalFile}
                onSave={handleEditorSave}
                onCancel={() => setShowEditor(false)}
                onUseOriginal={handleDirectUpload}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignatureUpload;
