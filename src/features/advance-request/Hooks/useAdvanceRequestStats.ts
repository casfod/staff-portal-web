import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { getAdvanceRequestStats } from "../../../services/apiAdvanceRequest";
import { UseAdvanceStatsType } from "../../../interfaces";

export function useAdvanceRequestStats(
  options?: UseQueryOptions<UseAdvanceStatsType, Error> // Add options parameter
) {
  return useQuery<UseAdvanceStatsType, Error>({
    queryKey: ["advance-requests-stats"],
    queryFn: () => getAdvanceRequestStats(),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}
