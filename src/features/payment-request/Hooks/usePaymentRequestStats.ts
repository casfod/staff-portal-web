import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { getPaymentRequestStats } from "../../../services/apiPaymentRequest";
import { UsePaymentStatsType } from "../../../interfaces";

export function usePaymentRequestStats(
  options?: UseQueryOptions<UsePaymentStatsType, Error> // Add options parameter
) {
  return useQuery<UsePaymentStatsType, Error>({
    queryKey: ["payment-requests-stats"],
    queryFn: () => getPaymentRequestStats(),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}
