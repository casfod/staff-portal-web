import { useQuery } from "@tanstack/react-query";
import { UsePaymentRequest } from "../../../interfaces";
import { getPaymentRequest } from "../../../services/apiPaymentRequest";

export function usePaymentRequest(id: string) {
  return useQuery<UsePaymentRequest, Error>({
    queryKey: ["payment-request", id],
    queryFn: () => getPaymentRequest(id),
    staleTime: 0,
  });
}
