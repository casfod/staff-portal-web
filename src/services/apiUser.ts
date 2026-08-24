// src/services/apiUser.ts
import { IAdminsListResponse, IQueryParams, IUser, IUsersListResponse } from '../interfaces.ts';
import apiClient, { handleError } from './apiClient';

// API Functions

export const exportUsersToExcel = async function (): Promise<Blob> {
  try {
    const response = await apiClient.get(`/users/export`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getAdmins = async function () {
  try {
    const response = await apiClient.get<IAdminsListResponse>(`/users`, {
      params: { role: 'ADMIN' },
    });
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getReviewers = async function () {
  try {
    const response = await apiClient.get<IAdminsListResponse>(`/users`, {
      params: { role: 'REVIEWER' },
    });
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getUsers = async function (_queryParams: IQueryParams) {
  try {
    const response = await apiClient.get<IUsersListResponse>(`/users`, {
      params: _queryParams,
    });
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getUserById = async function (userId: string) {
  try {
    const response = await apiClient.get<IUser>(`/users/${userId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateUser = async function (data: IUser) {
  try {
    const response = await apiClient.patch<IUser>(`/users/updateMe`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateUserAdmin = async function (userId: string, data: Partial<IUser>) {
  console.log({ data });
  try {
    const response = await apiClient.patch<IUser>(`/users/${userId}`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const addUser = async function (data: Partial<IUser>) {
  console.log('staff:', { data });
  try {
    const response = await apiClient.post<IUser>(`users/staff`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const updatePassword = async function (data: UpdatePasswordData) {
  try {
    const response = await apiClient.patch<IUser>(`/users/me/password`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// These now correctly use isActive (not isDeleted)
export const activateUser = async function (userId: string) {
  try {
    const response = await apiClient.patch<IUser>(`/users/${userId}/activate`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deactivateUser = async function (userId: string) {
  try {
    const response = await apiClient.patch<IUser>(`/users/${userId}/deactivate`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
