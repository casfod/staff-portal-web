// frontend/src/features/signature/Hooks/useSignature.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMySignature,
  uploadSignature,
  uploadSignatureFromDataUrl,
  deleteSignature,
} from "../../../services/apiSignature";
import toast from "react-hot-toast";

interface HookError extends Error {
  response?: {
    data: {
      message: string;
    };
  };
}

export const signatureKeys = {
  all: ["signature"] as const,
  me: () => [...signatureKeys.all, "me"] as const,
};

/**
 * Get current user's signature
 */
export const useMySignature = () => {
  return useQuery({
    queryKey: signatureKeys.me(),
    queryFn: () => getMySignature(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Upload signature mutation (for file uploads)
 */
export const useUploadSignature = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (file: File) => uploadSignature(file),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Signature uploaded successfully");
        queryClient.invalidateQueries({ queryKey: signatureKeys.me() });
      } else {
        toast.error(data.message || "Upload failed");
      }
    },

    onError: (err: HookError) => {
      toast.error(err.message || "An error occurred while uploading");
    },
  });

  return {
    uploadSignature: mutation.mutate,
    isUploading: mutation.isPending,
    isError: mutation.isError,
  };
};

/**
 * Upload drawn signature mutation
 */
export const useUploadDrawnSignature = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (dataUrl: string) =>
      uploadSignatureFromDataUrl(dataUrl, "drawn"),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Drawn signature saved successfully");
        queryClient.invalidateQueries({ queryKey: signatureKeys.me() });
      } else {
        toast.error(data.message || "Failed to save drawn signature");
      }
    },

    onError: (err: HookError) => {
      toast.error(err.message || "An error occurred while saving");
    },
  });

  return {
    uploadDrawnSignature: mutation.mutate,
    isUploading: mutation.isPending,
    isError: mutation.isError,
  };
};

/**
 * Delete signature mutation
 */
export const useDeleteSignature = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => deleteSignature(),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Signature deleted successfully");
        queryClient.invalidateQueries({ queryKey: signatureKeys.me() });
      } else {
        toast.error(data.message || "Delete failed");
      }
    },

    onError: (err: HookError) => {
      toast.error(err.message || "An error occurred while deleting");
    },
  });

  return {
    deleteSignature: mutation.mutate,
    isDeleting: mutation.isPending,
    isError: mutation.isError,
  };
};
