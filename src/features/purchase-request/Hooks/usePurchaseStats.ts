import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { getPurchaseRequestStats } from "../../../services/apiPurchaseRequest";
import { UsePurchaseStatsType } from "../../../interfaces";

export function usePurchaseStats(
  options?: UseQueryOptions<UsePurchaseStatsType, Error> // Add options parameter
) {
  return useQuery<UsePurchaseStatsType, Error>({
    queryKey: ["purchase-requests-stats"],
    queryFn: () => getPurchaseRequestStats(),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}
