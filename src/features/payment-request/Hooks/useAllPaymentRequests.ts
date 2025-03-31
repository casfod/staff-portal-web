import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { usePaymentRequestType } from "../../../interfaces";
import { getAllPaymentRequest } from "../../../services/apiPaymentRequest";

export function useAllPaymentRequests(
  search?: string,
  sort?: string,
  page?: number,
  limit?: number,
  options?: UseQueryOptions<usePaymentRequestType, Error> // Add options parameter
) {
  return useQuery<usePaymentRequestType, Error>({
    queryKey: ["all-payment-requests", search, sort, page, limit],
    queryFn: () => getAllPaymentRequest({ search, sort, page, limit }),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}
