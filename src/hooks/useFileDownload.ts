// src/hooks/useFileDownload.ts
import { useMutation } from '@tanstack/react-query';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import apiClient from '../services/apiClient';
import { IHookError } from '../interfaces';

interface DownloadFileParams {
  fileId: string;
  fileName: string;
  fileType: string;
  mimeType?: string;
}

export function useFileDownload() {
  const downloadMutation = useMutation<void, IHookError, DownloadFileParams>({
    mutationFn: async ({ fileId, fileName, fileType, mimeType }) => {
      try {
        // Clean the file ID
        const cleanFileId = String(fileId).replace(/['"]/g, '').trim();

        const response = await apiClient.get(`/files/${cleanFileId}/download`, {
          responseType: 'blob',
          headers: {
            Accept: '*/*',
          },
        });

        const blob = response.data;

        // Get filename from Content-Disposition header
        const contentDisposition = response.headers['content-disposition'];
        let filename = getDownloadName(fileName, fileType, mimeType);

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = decodeURIComponent(filenameMatch[1]);
          }
        }

        saveAs(blob, filename);
      } catch (error) {
        console.error('Download error:', error);
        // Fallback: Open in new tab
        const cleanFileId = String(fileId).replace(/['"]/g, '').trim();
        window.open(`/api/v1/files/${cleanFileId}/download`, '_blank');
        throw error;
      }
    },
    onError: error => {
      toast.error(error.response?.data?.message || 'Failed to download file');
    },
  });

  const getExtension = (fileType: string, mimeType?: string): string => {
    if (mimeType) {
      const mimeExtensions: Record<string, string> = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'application/pdf': '.pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
        'application/vnd.ms-excel': '.xls',
      };
      return mimeExtensions[mimeType] || '';
    }

    switch (fileType) {
      case 'image':
        return '.jpg';
      case 'pdf':
        return '.pdf';
      case 'document':
        return '.docx';
      case 'spreadsheet':
        return '.xlsx';
      default:
        return '';
    }
  };

  const getDownloadName = (name: string, fileType: string, mimeType?: string): string => {
    const extensionRegex = /\.[^/.]+$/;
    if (extensionRegex.test(name)) {
      return name;
    }

    const extension = getExtension(fileType, mimeType);
    return extension ? `${name}${extension}` : name;
  };

  return {
    downloadFile: downloadMutation.mutateAsync,
    isDownloading: downloadMutation.isPending,
    error: downloadMutation.error,
  };
}
