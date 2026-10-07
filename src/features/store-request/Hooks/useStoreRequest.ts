import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { IStoreRequestStatsResponse, IStoreRequestsListResponse } from '../../../interfaces';
import { getAllStoreRequests, getStoreRequestStats } from '../../../services/apiStoreRequest';

export function useAllStoreRequests(
  queryParams: Record<string, string | number | undefined>,
  options?: UseQueryOptions<IStoreRequestsListResponse, Error>
) {
  return useQuery<IStoreRequestsListResponse, Error>({
    queryKey: ['all-store-requests', queryParams],
    queryFn: () => getAllStoreRequests(queryParams),
    staleTime: 0,
    ...options,
  });
}

export function useStoreRequestStats(
  options?: UseQueryOptions<IStoreRequestStatsResponse, Error>
) {
  return useQuery<IStoreRequestStatsResponse, Error>({
    queryKey: ['store-request-stats'],
    queryFn: () => getStoreRequestStats(),
    staleTime: 0,
    ...options,
  });
}