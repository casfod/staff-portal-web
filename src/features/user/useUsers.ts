import { useQuery } from "@tanstack/react-query";
import { UserType } from "../../interfaces";
import { getUsers } from "../../services/apiUser";
interface useUsersType {
  status: number;
  message: string;
  data: UserType[];
}

export function useUsers() {
  return useQuery<useUsersType, Error>({
    queryKey: ["users"],
    queryFn: getUsers,
    staleTime: 0,
  });
}
