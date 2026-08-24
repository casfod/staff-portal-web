// src/services/apiAdvanceRequest.ts
import {
  IAdvanceRequest,
  IAdvanceRequestsListResponse,
  IAdvanceRequestSingleResponse,
  IAdvanceRequestStatsResponse,
} from '../interfaces.ts';
import apiClient, {
  handleError,
  QueryParams,
  StatusUpdateData,
  CommentData,
  CopyToData,
} from './apiClient';

// API Functions

export const getAllAdvanceRequest = async function (queryParams: QueryParams) {
  try {
    const response = await apiClient.get<IAdvanceRequestsListResponse>(
      `/finance/advance-requests`,
      {
        params: queryParams,
      }
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getAdvanceRequest = async function (requestId: string) {
  try {
    const response = await apiClient.get<IAdvanceRequestSingleResponse>(
      `/finance/advance-requests/${requestId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getAdvanceRequestStats = async function () {
  try {
    const response = await apiClient.get<IAdvanceRequestStatsResponse>(
      `/finance/advance-requests/stats`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const saveAdvanceRequests = async function (data: Partial<IAdvanceRequest>) {
  try {
    const response = await apiClient.post<IAdvanceRequestSingleResponse>(
      `/finance/advance-requests/draft`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const sendAdvanceRequests = async function (data: Partial<IAdvanceRequest>) {
  try {
    const response = await apiClient.post<IAdvanceRequestSingleResponse>(
      `/finance/advance-requests`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateAdvanceRequest = async function (
  requestId: string,
  data: Partial<IAdvanceRequest>
) {
  try {
    const response = await apiClient.patch<IAdvanceRequestSingleResponse>(
      `/finance/advance-requests/${requestId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateStatus = async function (requestId: string, data: StatusUpdateData) {
  try {
    const response = await apiClient.patch<Partial<IAdvanceRequest>>(
      `/finance/advance-requests/${requestId}/status`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const copyTo = async function (requestId: string, data: CopyToData) {
  try {
    const response = await apiClient.post<Partial<IAdvanceRequest>>(
      `/finance/advance-requests/${requestId}/copy`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const addComment = async function (requestId: string, data: CommentData) {
  try {
    const response = await apiClient.post(`/finance/advance-requests/${requestId}/comments`, data);
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
    const response = await apiClient.put(
      `/finance/advance-requests/${requestId}/comments/${commentId}`,
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
      `/finance/advance-requests/${requestId}/comments/${commentId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteAdvanceRequest = async function (advanceRequestID: string) {
  try {
    const response = await apiClient.delete<IAdvanceRequest>(
      `/finance/advance-requests/${advanceRequestID}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
