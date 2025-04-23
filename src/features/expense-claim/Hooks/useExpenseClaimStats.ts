import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { getExpenseClaimStats } from "../../../services/apiExpenseClaim";
import { UseExpenseClaimStatsType } from "../../../interfaces";

export function useExpenseClaimStats(
  options?: UseQueryOptions<UseExpenseClaimStatsType, Error> // Add options parameter
) {
  return useQuery<UseExpenseClaimStatsType, Error>({
    queryKey: ["expense-claim-stats"],
    queryFn: () => getExpenseClaimStats(),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}
