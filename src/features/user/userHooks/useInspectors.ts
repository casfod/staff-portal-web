import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useAdminsType } from "../../../interfaces";
import { getInspectors } from "../../../services/apiUser";

export function useInspectors(
  options?: UseQueryOptions<useAdminsType, Error> // Add options parameter
) {
  return useQuery<useAdminsType, Error>({
    queryKey: ["inspectors"],
    queryFn: () => getInspectors(),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}
