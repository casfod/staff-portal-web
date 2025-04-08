import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { getTravelRequestStats } from "../../../services/apiTravelRequest";
import { UseTravelStatsType } from "../../../interfaces";

export function useTravelRequestStats(
  options?: UseQueryOptions<UseTravelStatsType, Error> // Add options parameter
) {
  return useQuery<UseTravelStatsType, Error>({
    queryKey: ["travel-requests-stats"],
    queryFn: () => getTravelRequestStats(),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}
