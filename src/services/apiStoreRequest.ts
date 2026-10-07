import { IStoreRequestStatsResponse, IStoreRequestsListResponse } from '../interfaces';
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