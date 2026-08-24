// src/services/apiTravelRequest.ts
import {
  ITravelRequest,
  ITravelRequestsListResponse,
  ITravelRequestSingleResponse,
  ITravelRequestStatsResponse,
} from '../interfaces';
import apiClient, {
  handleError,
  QueryParams,
  StatusUpdateData,
  CommentData,
  CopyToData,
} from './apiClient';

// API Functions

export const getAllTravelRequest = async function (queryParams: QueryParams) {
  try {
    const response = await apiClient.get<ITravelRequestsListResponse>(`/finance/travel-requests`, {
      params: queryParams,
    });
    console.log('API Response:', response.data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getTravelRequest = async function (requestId: string) {
  try {
    const response = await apiClient.get<ITravelRequestSingleResponse>(
      `/finance/travel-requests/${requestId}`
    );
    console.log('API Response:', response.data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getTravelRequestStats = async function () {
  try {
    const response = await apiClient.get<ITravelRequestStatsResponse>(
      `/finance/travel-requests/stats`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const saveTravelRequests = async function (data: Partial<ITravelRequest>) {
  try {
    const response = await apiClient.post<ITravelRequestSingleResponse>(
      `/finance/travel-requests/draft`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const sendTravelRequests = async function (data: Partial<ITravelRequest>) {
  try {
    const response = await apiClient.post<ITravelRequestSingleResponse>(
      `/finance/travel-requests`,
      data
    );

    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const copyTo = async function (requestId: string, data: CopyToData) {
  try {
    const response = await apiClient.post<Partial<ITravelRequest>>(
      `/finance/travel-requests/${requestId}/copy`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateTravelRequest = async function (
  requestId: string,
  data: Partial<ITravelRequest>
) {
  try {
    const response = await apiClient.patch<Partial<ITravelRequest>>(
      `/finance/travel-requests/${requestId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateStatus = async function (requestId: string, data: StatusUpdateData) {
  try {
    const response = await apiClient.patch<Partial<ITravelRequest>>(
      `/finance/travel-requests/${requestId}/status`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const addComment = async function (requestId: string, data: CommentData) {
  try {
    const response = await apiClient.post(`/finance/travel-requests/${requestId}/comments`, data);
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
      `/finance/travel-requests/${requestId}/comments/${commentId}`,
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
      `/finance/travel-requests/${requestId}/comments/${commentId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteTravelRequest = async function (TravelRequestID: string) {
  try {
    const response = await apiClient.delete<ITravelRequestSingleResponse>(
      `/finance/travel-requests/${TravelRequestID}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
