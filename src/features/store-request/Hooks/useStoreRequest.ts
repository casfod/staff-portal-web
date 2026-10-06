import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { IStoreRequestStatsResponse } from '../../../interfaces';
import { getStoreRequestStats } from '../../../services/apiStoreRequest';

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