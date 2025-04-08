import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useTravelRequestType } from "../../../interfaces";
import { getAllTravelRequest } from "../../../services/apiTravelRequest";

export function useAllTravelRequests(
  search?: string,
  sort?: string,
  page?: number,
  limit?: number,
  options?: UseQueryOptions<useTravelRequestType, Error> // Add options parameter
) {
  return useQuery<useTravelRequestType, Error>({
    queryKey: ["all-travel-requests", search, sort, page, limit],
    queryFn: () => getAllTravelRequest({ search, sort, page, limit }),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}
