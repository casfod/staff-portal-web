import { useQuery } from "@tanstack/react-query";
import { UserType } from "../../../interfaces";
import { getUser } from "../../../services/apiAuth";

interface useUserType {
  status: number;
  message: string;
  data: UserType;
}

export function useUser(id: string) {
  return useQuery<useUserType, Error>({
    queryKey: ["user", id],
    queryFn: getUser,
    staleTime: 0,
  });
}
