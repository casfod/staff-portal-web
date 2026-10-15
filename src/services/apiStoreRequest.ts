import {
  IStoreRequest,
  IStoreRequestSingleResponse,
  IStoreRequestStatsResponse,
  IStoreRequestsListResponse,
} from '../interfaces';
import apiClient, { handleError } from './apiClient';

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