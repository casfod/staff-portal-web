// src/services/apiFile.ts
import apiClient from './apiClient';

// ─── Upload files ────────────────────────────────────────────────────────────
export const uploadFiles = async (
  files: File[],
  associatedModel?: string,
  associatedId?: string,
  folder?: string
) => {
  const formData = new FormData();

  files.forEach(file => formData.append('files', file));

  if (associatedModel) formData.append('associatedModel', associatedModel);
  if (associatedId) formData.append('associatedId', associatedId);
  if (folder) formData.append('folder', folder);

  const response = await apiClient.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

// ─── Upload avatar ──────────────────────────────────────────────────────────
export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await apiClient.post('/files/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};
export const uploadSignature = async (file: File) => {
  const formData = new FormData();
  formData.append('signature', file);

  const response = await apiClient.post('/files/signature', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

// ─── Remove avatar ──────────────────────────────────────────────────────────
export const removeAvatar = async () => {
  const response = await apiClient.delete('/files/avatar');
  return response.data;
};
// ─── Remove Signature ──────────────────────────────────────────────────────────
export const removeSignature = async () => {
  const response = await apiClient.delete('/files/signature');
  return response.data;
};

// ─── Get files for entity ──────────────────────────────────────────────────
export const getFilesForEntity = async (
  model: string,
  id: string,
  page?: number,
  limit?: number
) => {
  const params = new URLSearchParams();
  if (page) params.append('page', String(page));
  if (limit) params.append('limit', String(limit));

  const response = await apiClient.get(`/files/entity/${model}/${id}?${params.toString()}`);
  return response.data;
};

// ─── Get my files ───────────────────────────────────────────────────────────
export const getMyFiles = async (page?: number, limit?: number) => {
  const params = new URLSearchParams();
  if (page) params.append('page', String(page));
  if (limit) params.append('limit', String(limit));

  const response = await apiClient.get(`/files/me?${params.toString()}`);
  return response.data;
};

// ─── Update file ────────────────────────────────────────────────────────────
export const updateFile = async (
  fileId: string,
  updates: { name?: string; description?: string }
) => {
  const response = await apiClient.patch(`/files/${fileId}`, updates);
  return response.data;
};

// ─── Delete file ────────────────────────────────────────────────────────────
export const deleteFile = async (fileId: string) => {
  const response = await apiClient.delete(`/files/${fileId}`);
  return response.data;
};

// ─── Delete file permanently ────────────────────────────────────────────────
export const deleteFilePermanent = async (fileId: string) => {
  const response = await apiClient.delete(`/files/${fileId}/permanent`);
  return response.data;
};
