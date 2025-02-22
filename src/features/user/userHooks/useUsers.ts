import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useUsersType } from "../../../interfaces";
import { getUsers } from "../../../services/apiUser";

export function useUsers(
  search?: string,
  sort?: string,
  page?: number,
  limit?: number,
  options?: UseQueryOptions<useUsersType, Error> // Add options parameter
) {
  return useQuery<useUsersType, Error>({
    queryKey: ["users", search, sort, page, limit],
    queryFn: () => getUsers({ search, sort, page, limit }),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}
