// src/services/apiStaffStrategy.ts
import {
  IStaffStrategy,
  IStaffStrategiesListResponse,
  IStaffStrategySingleResponse,
} from '../interfaces';
import apiClient, { handleError, QueryParams, CommentData, CopyToData } from './apiClient';

// ========== GET STATS ==========
export const getStaffStrategyStats = async function () {
  try {
    const response = await apiClient.get(`/hr/staff-strategy/stats`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ========== GET ALL ==========
export const getAllStaffStrategies = async function (queryParams: QueryParams) {
  try {
    const response = await apiClient.get<IStaffStrategiesListResponse>(`/hr/staff-strategy`, {
      params: queryParams,
    });
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ========== GET BY ID ==========
export const getStaffStrategy = async function (requestId: string) {
  try {
    const response = await apiClient.get<IStaffStrategySingleResponse>(
      `/hr/staff-strategy/${requestId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ========== CREATE AND SUBMIT ==========
export const createStaffStrategy = async function (data: Partial<IStaffStrategy>) {
  try {
    const response = await apiClient.post<IStaffStrategySingleResponse>(
      `/hr/staff-strategy`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ✅ FIXED: Match backend route /hr/staff-strategy/draft
export const saveStaffStrategyDraft = async function (data: Partial<IStaffStrategy>) {
  try {
    const response = await apiClient.post<IStaffStrategySingleResponse>(
      `/hr/staff-strategy/draft`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ✅ FIXED: Match backend route /hr/staff-strategy/:id/submit
export const submitStaffStrategyDraft = async function (strategyId: string, files: File[] = []) {
  try {
    const formData = new FormData();

    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await apiClient.patch<IStaffStrategySingleResponse>(
      `/hr/staff-strategy/${strategyId}/submit`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ========== UPDATE ==========
export const updateStaffStrategy = async function (
  strategyId: string,
  data: Partial<IStaffStrategy>,
) {
  try {
    const response = await apiClient.patch<IStaffStrategySingleResponse>(
      `/hr/staff-strategy/${strategyId}`,
      data,

    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ✅ FIXED: Match backend route /hr/staff-strategy/:id/status
export const updateStatus = async function (
  requestId: string,
  data: { status: string; comment?: string }
) {
  try {
    const response = await apiClient.patch<Partial<IStaffStrategy>>(
      `/hr/staff-strategy/${requestId}/status`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const copyTo = async function (requestId: string, data: CopyToData) {
  try {
    const response = await apiClient.post<Partial<IStaffStrategy>>(
      `/hr/staff-strategy/${requestId}/copy`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ========== COMMENTS ==========
export const addComment = async function (requestId: string, data: CommentData) {
  try {
    const response = await apiClient.post(`/hr/staff-strategy/${requestId}/comments`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateComment = async function (
  requestId: string,
  commentId: string,
  data: CommentData
) {
  try {
    const response = await apiClient.patch(
      `/hr/staff-strategy/${requestId}/comments/${commentId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteComment = async function (requestId: string, commentId: string) {
  try {
    const response = await apiClient.delete(
      `/hr/staff-strategy/${requestId}/comments/${commentId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ========== DELETE ==========
export const deleteStaffStrategy = async function (strategyId: string) {
  try {
    const response = await apiClient.delete<IStaffStrategySingleResponse>(
      `/hr/staff-strategy/${strategyId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};