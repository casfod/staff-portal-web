// src/services/apiExpenseClaim.ts
import {
  IExpenseClaim,
  IExpenseClaimsListResponse,
  IExpenseClaimSingleResponse,
  IExpenseClaimStatsResponse,
} from '../interfaces';
import apiClient, {
  handleError,
  QueryParams,
  StatusUpdateData,
  CommentData,
  CopyToData,
} from './apiClient';

// API Functions

export const getAllExpenseClaim = async function (queryParams: QueryParams) {
  try {
    const response = await apiClient.get<IExpenseClaimsListResponse>(`/finance/expense-claims`, {
      params: queryParams,
    });
    console.log('API Response:', response.data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getExpenseClaimStats = async function () {
  try {
    const response = await apiClient.get<IExpenseClaimStatsResponse>(
      `/finance/expense-claims/stats`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getExpenseClaim = async function (requestId: string) {
  try {
    const response = await apiClient.get<IExpenseClaimSingleResponse>(
      `/finance/expense-claims/${requestId}`
    );
    console.log('API Response:', response.data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const saveExpenseClaims = async function (data: Partial<IExpenseClaim>) {
  try {
    const response = await apiClient.post<IExpenseClaimSingleResponse>(
      `/finance/expense-claims/draft`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const sendExpenseClaims = async function (data: Partial<IExpenseClaim>) {
  try {
    const response = await apiClient.post(`/finance/expense-claims`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const copyTo = async function (requestId: string, data: CopyToData) {
  try {
    const response = await apiClient.post<Partial<IExpenseClaim>>(
      `/finance/expense-claims/${requestId}/copy`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateExpenseClaim = async function (requestId: string, data: Partial<IExpenseClaim>) {
  try {
    const response = await apiClient.patch<Partial<IExpenseClaim>>(
      `/finance/expense-claims/${requestId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateStatus = async function (requestId: string, data: StatusUpdateData) {
  try {
    const response = await apiClient.patch<Partial<IExpenseClaim>>(
      `/finance/expense-claims/${requestId}/status`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const addComment = async function (requestId: string, data: CommentData) {
  try {
    const response = await apiClient.post(`/finance/expense-claims/${requestId}/comments`, data);
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
      `/finance/expense-claims/${requestId}/comments/${commentId}`,
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
      `/finance/expense-claims/${requestId}/comments/${commentId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteExpenseClaim = async function (expenseClaimID: string) {
  try {
    const response = await apiClient.delete<IExpenseClaim>(
      `/finance/expense-claims/${expenseClaimID}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
