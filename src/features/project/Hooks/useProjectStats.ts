import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { UseProjectStatsType } from "../../../interfaces";
import { getProjectsStats } from "../../../services/apiProject";

export function useProjectStats(
  options?: UseQueryOptions<UseProjectStatsType, Error> // Add options parameter
) {
  return useQuery<UseProjectStatsType, Error>({
    queryKey: ["projects-stats"],
    queryFn: () => getProjectsStats(),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}
