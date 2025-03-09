import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { usePurChaseRequestType } from "../../../interfaces";
import { getAllPurchaseRequest } from "../../../services/apiPurchaseRequest";

export function useAllPurchaseRequests(
  search?: string,
  sort?: string,
  page?: number,
  limit?: number,
  options?: UseQueryOptions<usePurChaseRequestType, Error> // Add options parameter
) {
  return useQuery<usePurChaseRequestType, Error>({
    queryKey: ["all-purchase-requests", search, sort, page, limit],
    queryFn: () => getAllPurchaseRequest({ search, sort, page, limit }),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}
