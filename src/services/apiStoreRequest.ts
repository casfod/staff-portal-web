import {
  IStoreRequest,
  IStoreRequestSingleResponse,
  IStoreRequestStatsResponse,
  IStoreRequestsListResponse,
} from '../interfaces';
import apiClient, { CommentData, CopyToData, handleError, StatusUpdateData } from './apiClient';

export const getAllStoreRequests = async function (
  queryParams: Record<string, string | number | undefined>
) {
  try {
    const response = await apiClient.get<IStoreRequestsListResponse>('/finance/store-requests', {
      params: queryParams,
    });
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const saveStoreRequestDraft = async function (data: Partial<IStoreRequest>) {
  try {
    const response = await apiClient.post<IStoreRequestSingleResponse>(
      '/finance/store-requests/draft',
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const createStoreRequest = async function (data: Partial<IStoreRequest>) {
  try {
    const response = await apiClient.post<IStoreRequestSingleResponse>('/finance/store-requests', data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateStoreRequest = async function (
  storeRequestId: string,
  data: Partial<IStoreRequest>
) {
  try {
    const response = await apiClient.patch<IStoreRequestSingleResponse>(
      `/finance/store-requests/${storeRequestId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteStoreRequest = async function (storeRequestId: string) {
  try {
    const response = await apiClient.delete(`/finance/store-requests/${storeRequestId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getStoreRequestStats = async function () {
  try {
    const response = await apiClient.get<IStoreRequestStatsResponse>(
      '/finance/store-requests/stats'
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getStoreRequest = async function (requestId: string) {
  try {
    const response = await apiClient.get<IStoreRequestSingleResponse>(
      `/finance/store-requests/${requestId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const copyStoreRequest = async function (requestId: string, data: CopyToData) {
  try {
    const response = await apiClient.post(`/finance/store-requests/${requestId}/copy`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateStoreRequestStatus = async function (
  requestId: string,
  data: StatusUpdateData
) {
  try {
    const response = await apiClient.patch(
      `/finance/store-requests/${requestId}/status`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const addStoreRequestComment = async function (requestId: string, data: CommentData) {
  try {
    const response = await apiClient.post(`/finance/store-requests/${requestId}/comments`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateStoreRequestComment = async function (
  requestId: string,
  commentId: string,
  data: CommentData
) {
  try {
    const response = await apiClient.patch(
      `/finance/store-requests/${requestId}/comments/${commentId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteStoreRequestComment = async function (requestId: string, commentId: string) {
  try {
    const response = await apiClient.delete(
      `/finance/store-requests/${requestId}/comments/${commentId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};