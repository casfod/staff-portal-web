// src/services/apiLeave.ts
import {
  ILeave,
  ILeaveStatsResponse,
  ILeaveSingleResponse,
  ILeaveBalanceResponse,
} from '../interfaces';
import apiClient, {
  handleError,
  QueryParams,
  StatusUpdateData,
  CommentData,
  CopyToData,
} from './apiClient';

// API Functions

export const getLeaveStats = async function () {
  try {
    const response = await apiClient.get<ILeaveStatsResponse>(`/hr/leave/stats`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getMyLeaveBalance = async function () {
  try {
    const response = await apiClient.get<ILeaveBalanceResponse>(`/hr/leave/balance/me`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getUserLeaveBalance = async function (userId: string) {
  try {
    const response = await apiClient.get<ILeaveBalanceResponse>(
      `/hr/leave/balance/${userId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getAllLeaves = async function (queryParams: QueryParams) {
  try {
    const response = await apiClient.get<ILeaveSingleResponse>(`/hr/leave`, {
      params: queryParams,
    });
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getLeave = async function (leaveId: string) {
  try {
    const response = await apiClient.get<ILeaveSingleResponse>(`/hr/leave/${leaveId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const createLeaveApplication = async function (data: Partial<ILeave>) {
  try {
    const response = await apiClient.post<ILeaveSingleResponse>(`/hr/leave`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const saveLeaveDraft = async function (data: Partial<ILeave>) {
  try {
    const response = await apiClient.post<ILeaveSingleResponse>(`/hr/leave/draft`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateLeaveApplication = async function (
  leaveId: string,
  data: Partial<ILeave>,
) {
  try {
    const response = await apiClient.patch<ILeaveSingleResponse>(`/hr/leave/${leaveId}`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ✅ FIXED: Match backend route /hr/leave/:id/status
export const updateLeaveStatus = async function (leaveId: string, data: StatusUpdateData) {
  try {
    const response = await apiClient.patch<ILeaveSingleResponse>(
      `/hr/leave/${leaveId}/status`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ✅ FIXED: Match backend route /hr/leave/:id/copy
export const copyLeave = async function (leaveId: string, data: CopyToData) {
  try {
    const response = await apiClient.post<ILeaveSingleResponse>(`/hr/leave/${leaveId}/copy`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const addComment = async function (leaveId: string, data: CommentData) {
  try {
    const response = await apiClient.post(`/hr/leave/${leaveId}/comments`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateComment = async function (
  leaveId: string,
  commentId: string,
  data: CommentData
) {
  try {
    const response = await apiClient.patch(`/hr/leave/${leaveId}/comments/${commentId}`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteComment = async function (leaveId: string, commentId: string) {
  try {
    const response = await apiClient.delete(`/hr/leave/${leaveId}/comments/${commentId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteLeave = async function (leaveId: string) {
  try {
    const response = await apiClient.delete<ILeaveSingleResponse>(`/hr/leave/${leaveId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};