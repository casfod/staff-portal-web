import { QueryClient, QueryClientConfig } from '@tanstack/react-query';

// Default configuration for QueryClient
const defaultConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      retry: 1,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
};

// Create a singleton QueryClient instance
export const queryClient = new QueryClient(defaultConfig);

// Utility to reset all queries (useful for logout)
export const resetAllQueries = async () => {
  await queryClient.resetQueries();
};

// Utility to clear all queries (useful for logout)
export const clearAllQueries = () => {
  queryClient.clear();
};

// Utility to invalidate queries by key prefix
export const invalidateQueries = async (queryKey: unknown[]) => {
  await queryClient.invalidateQueries({ queryKey });
};

// Utility to refetch queries by key prefix
export const refetchQueries = async (queryKey: unknown[]) => {
  await queryClient.refetchQueries({ queryKey });
};

// Utility to get query data
export const getQueryData = <TData = unknown>(queryKey: unknown[]): TData | undefined => {
  return queryClient.getQueryData<TData>(queryKey);
};

// Utility to set query data
export const setQueryData = <TData = unknown>(
  queryKey: unknown[],
  data: TData | ((oldData: TData | undefined) => TData)
) => {
  return queryClient.setQueryData<TData>(queryKey, data);
};

// Utility to remove queries
export const removeQueries = (queryKey: unknown[]) => {
  queryClient.removeQueries({ queryKey });
};

// Utility to prefetch data
export const prefetchQuery = async <TData = unknown>({
  queryKey,
  queryFn,
  staleTime,
}: {
  queryKey: unknown[];
  queryFn: () => Promise<TData>;
  staleTime?: number;
}) => {
  return await queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime,
  });
};

// Utility to fetch query (returns data or throws)
export const fetchQuery = async <TData = unknown>({
  queryKey,
  queryFn,
  staleTime,
}: {
  queryKey: unknown[];
  queryFn: () => Promise<TData>;
  staleTime?: number;
}): Promise<TData> => {
  return await queryClient.fetchQuery({
    queryKey,
    queryFn,
    staleTime,
  });
};

// Utility to ensure query data is available (cached)
export const ensureQueryData = async <TData = unknown>({
  queryKey,
  queryFn,
  staleTime,
}: {
  queryKey: unknown[];
  queryFn: () => Promise<TData>;
  staleTime?: number;
}): Promise<TData> => {
  return await queryClient.ensureQueryData({
    queryKey,
    queryFn,
    staleTime,
  });
};

// Utility to cancel ongoing queries
export const cancelQueries = async (queryKey: unknown[]) => {
  await queryClient.cancelQueries({ queryKey });
};

// Utility to get query state
export const getQueryState = (queryKey: unknown[]) => {
  return queryClient.getQueryState(queryKey);
};

// Utility for optimistic updates
export const optimisticUpdate = <TData>({
  queryKey,
  updater,
  rollback,
}: {
  queryKey: unknown[];
  updater: (oldData: TData | undefined) => TData;
  rollback?: () => void;
}) => {
  const previousData = queryClient.getQueryData<TData>(queryKey);

  queryClient.setQueryData<TData>(queryKey, updater);

  return () => {
    if (rollback) {
      rollback();
    } else {
      queryClient.setQueryData<TData>(queryKey, previousData);
    }
  };
};

// Export default as well
export default queryClient;
