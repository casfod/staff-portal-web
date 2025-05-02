import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { getPurchaseRequestStats } from "../../../services/apiPurchaseRequest";
import { UsePurchaseStatsType } from "../../../interfaces";

export function usePurchaseStats(
  options?: UseQueryOptions<UsePurchaseStatsType, Error> // Add options parameter
) {
  return useQuery<UsePurchaseStatsType, Error>({
    queryKey: ["purchase-requests-stats"],
    queryFn: () => getPurchaseRequestStats(),
    // staleTime: 0,
    staleTime: 5 * 60 * 1000, // 5 minutes before data becomes stale
    // cacheTime: 15 * 60 * 1000, // 15 minutes before cache is garbage collected

    ...options, // Spread the options to include onError
  });
}
