import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useProjectType } from "../../../interfaces";
import { getProjects } from "../../../services/apiProject";

export function useProjects(
  search?: string,
  sort?: string,
  page?: number,
  limit?: number,
  options?: UseQueryOptions<useProjectType, Error> // Add options parameter
) {
  return useQuery<useProjectType, Error>({
    queryKey: ["projects", search, sort, page, limit],
    queryFn: () => getProjects({ search, sort, page, limit }),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}
