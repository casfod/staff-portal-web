// src/services/apiEmploymentInfo.ts
import {
  IEmploymentInfo,
  IEmploymentInfoResponse,
  IEmploymentInfoStatusResponse,
  ISystemSettingsResponse,
} from '../interfaces';
import apiClient, { handleError } from './apiClient';

// Get current user's employment info
export const getMyEmploymentInfo = async function () {
  try {
    const response = await apiClient.get<IEmploymentInfoResponse>(`/users/me/employment`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// Update current user's employment info
export const updateMyEmploymentInfo = async function (data: Partial<IEmploymentInfo>) {
  try {
    const response = await apiClient.patch<IEmploymentInfoResponse>(`/users/me/employment`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ADMIN: Get all users employment info status
export const getAllEmploymentInfoStatus = async function () {
  try {
    const response = await apiClient.get<IEmploymentInfoStatusResponse>(`/admin/employment-info`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ADMIN: Get global settings
export const getGlobalSettings = async function () {
  try {
    const response = await apiClient.get<ISystemSettingsResponse>(`/admin/settings/global`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// SUPER-ADMIN: Toggle global employment info lock
// NOTE: despite the parameter name, `enabled` is sent as-is to the backend,
// which assigns it directly to `globalEmploymentInfoLock` (see
// employment-info.service.ts). It means "is the lock on", not "are updates
// enabled" — pass the desired lock state directly, do not invert it.
export const toggleGlobalEmploymentInfoUpdate = async function (enabled: boolean) {
  try {
    const response = await apiClient.patch<ISystemSettingsResponse>(`/admin/settings/global-lock`, {
      enabled,
    });
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ADMIN/SUPER-ADMIN: Toggle user-specific employment info lock
export const toggleUserEmploymentInfoUpdate = async function (userId: string, enabled: boolean) {
  try {
    const response = await apiClient.patch(`/admin/employment-info/${userId}/lock`, {
      locked: !enabled,
    });
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ADMIN/SUPER-ADMIN: Get any user's employment info
export const superAdminGetUserEmploymentInfo = async function (userId: string) {
  try {
    const response = await apiClient.get(`/admin/employment-info/${userId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ADMIN/SUPER-ADMIN: Update any user's employment info
export const superAdminUpdateUserEmploymentInfo = async function (
  userId: string,
  data: Partial<IEmploymentInfo>
) {
  try {
    const response = await apiClient.patch(`/admin/employment-info/${userId}`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
