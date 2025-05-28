import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { UseAdvanceRequestType } from "../../../interfaces";
import { getAllAdvanceRequest } from "../../../services/apiAdvanceRequest";

export function useAllAdvanceRequests(
  search?: string,
  sort?: string,
  page?: number,
  limit?: number,
  options?: UseQueryOptions<UseAdvanceRequestType, Error> // Add options parameter
) {
  return useQuery<UseAdvanceRequestType, Error>({
    queryKey: ["all-advance-requests", search, sort, page, limit],
    queryFn: () => getAllAdvanceRequest({ search, sort, page, limit }),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}
