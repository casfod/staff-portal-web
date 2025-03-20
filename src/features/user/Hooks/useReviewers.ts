import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useAdminsType } from "../../../interfaces";
import { getReviewers } from "../../../services/apiUser";

export function useReviewers(
  options?: UseQueryOptions<useAdminsType, Error> // Add options parameter
) {
  return useQuery<useAdminsType, Error>({
    queryKey: ["reviewers"],
    queryFn: () => getReviewers(),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}
