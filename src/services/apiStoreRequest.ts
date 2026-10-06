import { IStoreRequestStatsResponse } from '../interfaces';
import apiClient, { handleError } from './apiClient';

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