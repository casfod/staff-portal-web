import { useQuery } from "@tanstack/react-query";
import { getPurChaseRequest } from "../../../services/apiPurchaseRequest";
import { UsePurChaseRequest } from "../../../interfaces";

export function usePurchaseRequest(id: string) {
  return useQuery<UsePurChaseRequest, Error>({
    queryKey: ["purchase-request", id],
    queryFn: () => getPurChaseRequest(id),
    staleTime: 0,
  });
}
