// src/hooks/useFile.ts
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  uploadFiles,
  uploadAvatar,
  removeAvatar,
  getFilesForEntity,
  getMyFiles,
  updateFile,
  deleteFile,
  deleteFilePermanent,
  uploadSignature,
  removeSignature,
} from '../services/apiFile';
import {
  IFile,
  IHookError,
  IFileListResponse,
  IFileSingleResponse,
  IFileUploadResponse,
  IAvatarResponse,
} from '../interfaces';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface UseFileUploadOptions {
  associatedModel?: string;
  associatedId?: string;
  folder?: string;
  onSuccess?: (files: IFile[]) => void;
  onError?: (error: IHookError) => void;
}

export interface UseFileUploadReturn {
  uploadFiles: (files: File[]) => Promise<IFile[]>;
  isUploading: boolean;
  error: IHookError | null;
}

export interface UseAvatarReturn {
  uploadAvatar: (file: File) => Promise<IAvatarResponse>;
  removeAvatar: () => Promise<void>;
  isUploading: boolean;
  isRemoving: boolean;
  error: IHookError | null;
}

// Add this new interface after UseAvatarReturn
export interface UseSignatureReturn {
  uploadSignature: (file: File) => Promise<IAvatarResponse>;
  removeSignature: () => Promise<void>;
  isUploading: boolean;
  isRemoving: boolean;
  error: IHookError | null;
}


export interface UseEntityFilesReturn {
  files: IFile[];
  isLoading: boolean;
  isError: boolean;
  error: IHookError | null;
  refetch: () => void;
  deleteFile: (fileId: string) => Promise<void>;
  deleteFilePermanent: (fileId: string) => Promise<void>;
  updateFile: (fileId: string, updates: { name?: string; description?: string }) => Promise<IFile>;
}

export interface UseMyFilesReturn {
  files: IFile[];
  isLoading: boolean;
  isError: boolean;
  error: IHookError | null;
  refetch: () => void;
  deleteFile: (fileId: string) => Promise<void>;
  updateFile: (fileId: string, updates: { name?: string; description?: string }) => Promise<IFile>;
}

// ─── Hook: Upload files ──────────────────────────────────────────────────────
export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const { associatedModel, associatedId, folder, onSuccess, onError } = options;
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<IHookError | null>(null);
  const queryClient = useQueryClient();

  const uploadFilesMutation = useMutation<IFileUploadResponse, IHookError, File[]>({
    mutationFn: (files: File[]) => {
      setIsUploading(true);
      setError(null);
      return uploadFiles(files, associatedModel, associatedId, folder);
    },
    onSuccess: response => {
      setIsUploading(false);
      const files = response?.data || [];

      // Invalidate relevant queries
      if (associatedModel && associatedId) {
        queryClient.invalidateQueries({
          queryKey: ['files', 'entity', associatedModel, associatedId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ['files', 'me'] });

      toast.success(`${files.length} file(s) uploaded successfully`);
      onSuccess?.(files);
    },
    onError: (err: IHookError) => {
      setIsUploading(false);
      setError(err);
      toast.error(err.response?.data?.message || 'Failed to upload files');
      onError?.(err);
    },
  });

  // ✅ FIX: Wrap the mutation to return IFile[] instead of IFileUploadResponse
  const uploadFilesWrapper = useCallback(
    async (files: File[]): Promise<IFile[]> => {
      const response = await uploadFilesMutation.mutateAsync(files);
      return response?.data || [];
    },
    [uploadFilesMutation]
  );

  return {
    uploadFiles: uploadFilesWrapper,
    isUploading,
    error,
  };
}

// ─── Hook: Avatar operations ─────────────────────────────────────────────────
export function useAvatar(id: string): UseAvatarReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<IHookError | null>(null);
  const queryClient = useQueryClient();

  const uploadAvatarMutation = useMutation<IAvatarResponse, IHookError, File>({
    mutationFn: (file: File) => {
      setIsUploading(true);
      setError(null);
      return uploadAvatar(file);
    },
    onSuccess: () => {
      setIsUploading(false);

      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: [`user-${id}`, id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Avatar updated successfully');
    },
    onError: (err: IHookError) => {
      setIsUploading(false);
      setError(err);
      toast.error(err.response?.data?.message || 'Failed to upload avatar');
    },
  });

  const removeAvatarMutation = useMutation<void, IHookError>({
    mutationFn: () => {
      setIsRemoving(true);
      setError(null);
      return removeAvatar();
    },
    onSuccess: () => {
      setIsRemoving(false);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Avatar removed successfully');
    },
    onError: (err: IHookError) => {
      setIsRemoving(false);
      setError(err);
      toast.error(err.response?.data?.message || 'Failed to remove avatar');
    },
  });

  return {
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    removeAvatar: removeAvatarMutation.mutateAsync,
    isUploading,
    isRemoving,
    error,
  };
}
// ─── Hook: Signature operations ─────────────────────────────────────────────────
// Then update the useSignature function to use the correct return type
export function useSignature(id: string): UseSignatureReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<IHookError | null>(null);
  const queryClient = useQueryClient();

  const uploadSignatureMutation = useMutation<IAvatarResponse, IHookError, File>({
    mutationFn: (file: File) => {
      setIsUploading(true);
      setError(null);
      return uploadSignature(file);
    },
    onSuccess: () => {
      setIsUploading(false);

      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: [`user-${id}`, id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Signature updated successfully');
    },
    onError: (err: IHookError) => {
      setIsUploading(false);
      setError(err);
      toast.error(err.response?.data?.message || 'Failed to upload signature');
    },
  });

  const removeSignatureMutation = useMutation<void, IHookError>({
    mutationFn: () => {
      setIsRemoving(true);
      setError(null);
      return removeSignature();
    },
    onSuccess: () => {
      setIsRemoving(false);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Signature removed successfully');
    },
    onError: (err: IHookError) => {
      setIsRemoving(false);
      setError(err);
      toast.error(err.response?.data?.message || 'Failed to remove signature');
    },
  });

  return {
    uploadSignature: uploadSignatureMutation.mutateAsync,
    removeSignature: removeSignatureMutation.mutateAsync,
    isUploading,
    isRemoving,
    error,
  };
}

// ─── Hook: Get entity files ──────────────────────────────────────────────────
export function useEntityFiles(
  model: string,
  id: string,
  options?: UseQueryOptions<IFileListResponse, IHookError>
): UseEntityFilesReturn {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery<IFileListResponse, IHookError>({
    queryKey: ['files', 'entity', model, id],
    queryFn: () => getFilesForEntity(model, id),
    enabled: !!model && !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });

  const files: IFile[] = data?.data?.files || [];

  const deleteFileMutation = useMutation<void, IHookError, string>({
    mutationFn: (fileId: string) => deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', 'entity', model, id] });
      queryClient.invalidateQueries({ queryKey: ['files', 'me'] });
      toast.success('File deleted successfully');
    },
    onError: (err: IHookError) => {
      toast.error(err.response?.data?.message || 'Failed to delete file');
    },
  });

  const deleteFilePermanentMutation = useMutation<void, IHookError, string>({
    mutationFn: (fileId: string) => deleteFilePermanent(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', 'entity', model, id] });
      queryClient.invalidateQueries({ queryKey: ['files', 'me'] });
      toast.success('File permanently deleted');
    },
    onError: (err: IHookError) => {
      toast.error(err.response?.data?.message || 'Failed to permanently delete file');
    },
  });

  const updateFileMutation = useMutation<
    IFileSingleResponse,
    IHookError,
    { fileId: string; updates: { name?: string; description?: string } }
  >({
    mutationFn: ({ fileId, updates }) => updateFile(fileId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', 'entity', model, id] });
      toast.success('File updated successfully');
    },
    onError: (err: IHookError) => {
      toast.error(err.response?.data?.message || 'Failed to update file');
    },
  });

  // ✅ FIX: Wrap updateFile to return IFile
  const updateFileWrapper = useCallback(
    async (fileId: string, updates: { name?: string; description?: string }): Promise<IFile> => {
      const response = await updateFileMutation.mutateAsync({ fileId, updates });
      return response.data;
    },
    [updateFileMutation]
  );

  return {
    files,
    isLoading,
    isError,
    error: error as IHookError | null,
    refetch,
    deleteFile: deleteFileMutation.mutateAsync,
    deleteFilePermanent: deleteFilePermanentMutation.mutateAsync,
    updateFile: updateFileWrapper,
  };
}

// ─── Hook: Get my files ──────────────────────────────────────────────────────
export function useMyFiles(
  page?: number,
  limit?: number,
  options?: UseQueryOptions<IFileListResponse, IHookError>
): UseMyFilesReturn {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery<IFileListResponse, IHookError>({
    queryKey: ['files', 'me', page, limit],
    queryFn: () => getMyFiles(page, limit),
    staleTime: 5 * 60 * 1000,
    ...options,
  });

  const files: IFile[] = data?.data?.files || [];

  const deleteFileMutation = useMutation<void, IHookError, string>({
    mutationFn: (fileId: string) => deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', 'me'] });
      toast.success('File deleted successfully');
    },
    onError: (err: IHookError) => {
      toast.error(err.response?.data?.message || 'Failed to delete file');
    },
  });

  const updateFileMutation = useMutation<
    IFileSingleResponse,
    IHookError,
    { fileId: string; updates: { name?: string; description?: string } }
  >({
    mutationFn: ({ fileId, updates }) => updateFile(fileId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', 'me'] });
      toast.success('File updated successfully');
    },
    onError: (err: IHookError) => {
      toast.error(err.response?.data?.message || 'Failed to update file');
    },
  });

  // ✅ FIX: Wrap updateFile to return IFile
  const updateFileWrapper = useCallback(
    async (fileId: string, updates: { name?: string; description?: string }): Promise<IFile> => {
      const response = await updateFileMutation.mutateAsync({ fileId, updates });
      return response.data;
    },
    [updateFileMutation]
  );

  return {
    files,
    isLoading,
    isError,
    error: error as IHookError | null,
    refetch,
    deleteFile: deleteFileMutation.mutateAsync,
    updateFile: updateFileWrapper,
  };
}

// ─── Hook: Combined upload with state management ────────────────────────────
export function useFileManager() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { uploadFiles, isUploading, error } = useFileUpload();

  const handleFileSelect = useCallback((files: File[]) => {
    setSelectedFiles(files);
  }, []);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) {
      toast.error('No files selected');
      return null;
    }
    const result = await uploadFiles(selectedFiles);
    setSelectedFiles([]);
    return result;
  }, [selectedFiles, uploadFiles]);

  const clearFiles = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  return {
    selectedFiles,
    setSelectedFiles,
    isUploading,
    error,
    handleFileSelect,
    handleUpload,
    clearFiles,
    removeFile,
  };
}
