import { useQuery } from "@tanstack/react-query";
import { UsersType } from "../../interfaces";
import { getActiveUsers } from "../../services/apiUser";

export function useUsers() {
  return useQuery<UsersType, Error>({
    queryKey: ["activeUser"],
    queryFn: getActiveUsers,
    staleTime: 0,
  });
}
