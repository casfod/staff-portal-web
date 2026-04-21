// frontend/src/features/signature/SignatureSettings.tsx
import React, { useState } from "react";
import {
  PenIcon,
  Trash2,
  Upload,
  AlertCircle,
  PenTool,
  Image,
  X,
} from "lucide-react";
import TextHeader from "../../ui/TextHeader";
import Button from "../../ui/Button";
import Spinner from "../../ui/Spinner";
import SignatureUpload from "../../ui/SignatureUpload";
import SignatureCanvas from "../../ui/SignatureCanvas";
import {
  useMySignature,
  useUploadSignature,
  useUploadDrawnSignature,
  useDeleteSignature,
} from "./Hooks/useSignature";
import { formatToDDMMYYYY } from "../../utils/formatToDDMMYYYY";

type Mode = "upload" | "draw";

const SignatureSettings: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<Mode>("upload");

  const { data: signatureData, isLoading, refetch } = useMySignature();
  const { uploadSignature, isUploading } = useUploadSignature();
  const { uploadDrawnSignature, isUploading: isUploadingDrawn } =
    useUploadDrawnSignature();
  const { deleteSignature, isDeleting } = useDeleteSignature();

  const signature = signatureData?.data;
  const hasSignature = !!signature?.imageUrl;

  /* ── handlers ─────────────────────────────────────────────────── */

  const openModal = () => {
    setMode("upload"); // always reset to upload when opening
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleFileSelected = (file: File) => {
    uploadSignature(file, {
      onSuccess: () => {
        closeModal();
        refetch();
      },
    });
  };

  const handleDrawSave = (dataUrl: string) => {
    uploadDrawnSignature(dataUrl, {
      onSuccess: () => {
        closeModal();
        refetch();
      },
    });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete your signature?")) {
      deleteSignature(undefined, { onSuccess: () => refetch() });
    }
  };

  /* ── loading ───────────────────────────────────────────────────── */

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  /* ── render ────────────────────────────────────────────────────── */

  return (
    <div className="flex flex-col space-y-6">
      {/* Page header */}
      <div className="sticky top-0 z-10 bg-[#F8F8F8] pt-4 md:pt-6 pb-3 space-y-1.5 border-b">
        <div className="flex items-center gap-2">
          <PenIcon className="h-6 w-6 text-gray-700" />
          <TextHeader>Signature Settings</TextHeader>
        </div>
        <p className="text-sm text-gray-500">
          Manage your electronic signature for document approval
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Current Signature */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Current Signature
          </h2>

          {hasSignature ? (
            <div className="space-y-4">
              <div
                className="inline-block p-4 rounded-lg border border-gray-200"
                style={{
                  background:
                    "repeating-linear-gradient(45deg,#f0f0f0 0px,#f0f0f0 2px,#ffffff 2px,#ffffff 8px)",
                }}
              >
                <img
                  src={signature.imageUrl}
                  alt="Your signature"
                  className="max-h-24 object-contain"
                />
              </div>

              <div className="text-sm text-gray-500">
                <p>Uploaded: {formatToDDMMYYYY(signature.uploadedAt)}</p>
                {signature.lastUsedAt && (
                  <p>Last used: {formatToDDMMYYYY(signature.lastUsedAt)}</p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  size="small"
                  variant="secondary"
                  onClick={openModal}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Replace Signature
                </Button>
                <Button
                  type="button"
                  size="small"
                  variant="secondary"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {isDeleting ? "Deleting…" : "Delete Signature"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-amber-50 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-amber-500" />
              </div>
              <p className="text-gray-600 mb-4">
                You haven't added a signature yet.
              </p>
              <Button onClick={openModal}>
                <Upload className="h-4 w-4 mr-1" />
                Add Signature
              </Button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-6 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-2">
            About Electronic Signatures
          </h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              Your signature authenticates documents such as Payment Vouchers,
              Advance Requests, and other approval workflows.
            </p>
            <p>
              Upload a photo of your handwritten signature, or draw it directly
              using your mouse or touch screen.
            </p>
            <p className="text-xs text-gray-500 mt-3">
              Your signature is stored securely and is only accessible by you
              and authorised personnel.
            </p>
          </div>
        </div>
      </div>

      {/* ── Modal ─────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">
                {hasSignature ? "Replace Signature" : "Add Signature"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Toggle — this is the single source of truth for which panel shows */}
            <div className="px-6 py-4 border-b shrink-0">
              <div className="flex rounded-lg border border-gray-200 overflow-hidden w-fit">
                <button
                  type="button"
                  onClick={() => setMode("upload")}
                  className={`flex items-center gap-2 px-5 py-2 text-sm font-medium transition-colors ${
                    mode === "upload"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Image className="h-4 w-4" />
                  Upload Image
                </button>
                <button
                  type="button"
                  onClick={() => setMode("draw")}
                  className={`flex items-center gap-2 px-5 py-2 text-sm font-medium transition-colors border-l border-gray-200 ${
                    mode === "draw"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <PenTool className="h-4 w-4" />
                  Draw Signature
                </button>
              </div>
            </div>

            {/* Modal body — swaps between Upload and Draw */}
            <div className="px-6 py-5 overflow-y-auto">
              {mode === "upload" ? (
                <SignatureUpload
                  onUploadComplete={handleFileSelected}
                  isUploading={isUploading}
                  currentSignatureUrl={signature?.imageUrl}
                />
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 text-center">
                    Draw your signature below using your mouse, touch, or
                    stylus.
                  </p>
                  <SignatureCanvas
                    onSave={handleDrawSave}
                    onCancel={closeModal}
                    width={560}
                    height={200}
                  />
                  {isUploadingDrawn && (
                    <p className="text-sm text-center text-gray-400 animate-pulse">
                      Saving signature…
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignatureSettings;
