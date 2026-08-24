// src/services/apiFileUpload.ts
import apiClient, { handleError } from './apiClient';

// API Functions

export const uploadFile = async function (file: File) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getFileList = async function () {
  try {
    const response = await apiClient.get('/files/files');
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteFile = async function (fileId: string) {
  try {
    const response = await apiClient.delete(`/files/files/${fileId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
