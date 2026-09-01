// src/services/apiPurchaseRequest.ts
import {
  IPurchaseRequest,
  IPurchaseRequestsListResponse,
  IPurchaseRequestSingleResponse,
  IPurchaseRequestStatsResponse,
} from '../interfaces';
import apiClient, {
  handleError,
  QueryParams,
  StatusUpdateData,
  CommentData,
  CopyToData,
} from './apiClient';

// API Functions

export const getAllPurchaseRequest = async function (queryParams: QueryParams) {
  try {
    const response = await apiClient.get<IPurchaseRequestsListResponse>(
      `procurement/purchase-requests`,
      {
        params: queryParams,
      }
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getPurchaseRequest = async function (requestId: string) {
  try {
    const response = await apiClient.get<IPurchaseRequestSingleResponse>(
      `procurement/purchase-requests/${requestId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getPurchaseRequestStats = async function () {
  try {
    const response = await apiClient.get<IPurchaseRequestStatsResponse>(
      `procurement/purchase-requests/stats`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const savePurchaseRequests = async function (data: Partial<IPurchaseRequest>) {
  try {
    const response = await apiClient.post<IPurchaseRequest>(
      `procurement/purchase-requests/draft`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const sendPurchaseRequests = async function (data: Partial<IPurchaseRequest>) {
  try {
    const response = await apiClient.post<IPurchaseRequest>(`procurement/purchase-requests`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const copyTo = async function (requestId: string, data: CopyToData) {
  try {
    const response = await apiClient.post<Partial<IPurchaseRequest>>(
      `procurement/purchase-requests/${requestId}/copy`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ✅ FIXED: Correct URL and HTTP method
export const updatePurchaseRequest = async function (
  requestId: string,
  data: Partial<IPurchaseRequest>
) {
  try {
    const response = await apiClient.patch<Partial<IPurchaseRequest>>(
      `procurement/purchase-requests/${requestId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ✅ FIXED: Correct URL
export const updateStatus = async function (
  requestId: string,
  data: StatusUpdateData & {
    financeReviewStatus?: 'pending' | 'approved' | 'rejected';
    procurementReviewStatus?: 'pending' | 'approved' | 'rejected';
  }
) {
  try {
    const response = await apiClient.patch<Partial<IPurchaseRequest>>(
      `procurement/purchase-requests/${requestId}/status`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const addComment = async function (requestId: string, data: CommentData) {
  try {
    const response = await apiClient.post(
      `procurement/purchase-requests/${requestId}/comments`,
      data
    );
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
      `procurement/purchase-requests/${requestId}/comments/${commentId}`,
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
      `procurement/purchase-requests/${requestId}/comments/${commentId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deletePurchaseRequest = async function (purchaseRequestID: string) {
  try {
    const response = await apiClient.delete<IPurchaseRequest>(
      `procurement/purchase-requests/${purchaseRequestID}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
