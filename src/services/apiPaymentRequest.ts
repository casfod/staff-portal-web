// src/services/apiPaymentRequest.ts
import {
  IPaymentRequest,
  IPaymentRequestsListResponse,
  IPaymentRequestSingleResponse,
  IPaymentRequestStatsResponse,
} from '../interfaces';
import apiClient, {
  handleError,
  QueryParams,
  StatusUpdateData,
  CommentData,
  CopyToData,
} from './apiClient';

// API Functions

export const getAllPaymentRequest = async function (queryParams: QueryParams) {
  try {
    const response = await apiClient.get<IPaymentRequestsListResponse>(
      `/finance/payment-requests`,
      {
        params: queryParams,
      }
    );
    console.log('API Response:', response.data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getPaymentRequest = async function (requestId: string) {
  try {
    const response = await apiClient.get<IPaymentRequestSingleResponse>(
      `/finance/payment-requests/${requestId}`
    );
    console.log('API Response:', response.data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getPaymentRequestStats = async function () {
  try {
    const response = await apiClient.get<IPaymentRequestStatsResponse>(
      `/finance/payment-requests/stats`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const savePaymentRequests = async function (data: Partial<IPaymentRequest>) {
  try {
    const response = await apiClient.post<IPaymentRequestSingleResponse>(
      `/finance/payment-requests/draft`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const sendPaymentRequests = async function (data: Partial<IPaymentRequest>) {
  try {
    const response = await apiClient.post<IPaymentRequestSingleResponse>(
      `/finance/payment-requests`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const copyTo = async function (requestId: string, data: CopyToData) {
  try {
    const response = await apiClient.post<Partial<IPaymentRequest>>(
      `/finance/payment-requests/${requestId}/copy`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updatePaymentRequest = async function (
  requestId: string,
  data: Partial<IPaymentRequest>
) {
  try {
    const response = await apiClient.patch<Partial<IPaymentRequest>>(
      `/finance/payment-requests/${requestId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateStatus = async function (requestId: string, data: StatusUpdateData) {
  try {
    const response = await apiClient.patch<Partial<IPaymentRequest>>(
      `/finance/payment-requests/${requestId}/status`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const addComment = async function (requestId: string, data: CommentData) {
  try {
    const response = await apiClient.post(`/finance/payment-requests/${requestId}/comments`, data);
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
      `/finance/payment-requests/${requestId}/comments/${commentId}`,
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
      `/finance/payment-requests/${requestId}/comments/${commentId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deletePaymentRequest = async function (paymentRequestID: string) {
  try {
    const response = await apiClient.delete<IPaymentRequestSingleResponse>(
      `/finance/payment-requests/${paymentRequestID}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
