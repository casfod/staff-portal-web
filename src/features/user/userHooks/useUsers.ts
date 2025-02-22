import { useQuery } from "@tanstack/react-query";
import { useUsersType } from "../../../interfaces";
import { getUsers } from "../../../services/apiUser";

export function useUsers(
  search?: string,
  // role?: string,
  sort?: string,
  page?: number,
  limit?: number
) {
  return useQuery<useUsersType, Error>({
    queryKey: ["users", search, sort, page, limit],
    queryFn: () => getUsers({ search, sort, page, limit }),
    staleTime: 0,
  });
}
