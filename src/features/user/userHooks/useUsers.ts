import { useQuery } from "@tanstack/react-query";
import { UserType } from "../../../interfaces";
import { getUsers } from "../../../services/apiUser";

interface useUsersType {
  status: number;
  message: string;
  data: UserType[];
  totalUsers: number;
  totalPages: number;
  currentPage: number;
}

export function useUsers(
  search?: string,
  role?: string,
  sort?: string,
  page?: number,
  limit?: number
) {
  return useQuery<useUsersType, Error>({
    queryKey: ["users", search, role, sort, page, limit],
    queryFn: () => getUsers({ search, role, sort, page, limit }),
    staleTime: 0,
  });
}
