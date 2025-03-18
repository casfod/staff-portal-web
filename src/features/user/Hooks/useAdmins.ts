import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useAdminsType } from "../../../interfaces";
import { getAdmins } from "../../../services/apiUser";

export function useAdmins(
  options?: UseQueryOptions<useAdminsType, Error> // Add options parameter
) {
  return useQuery<useAdminsType, Error>({
    queryKey: ["admins"],
    queryFn: () => getAdmins(),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}
