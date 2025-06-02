import { useQuery } from "@tanstack/react-query";
import { getTravelRequest } from "../../../services/apiTravelRequest";
import { UseTravelRequest } from "../../../interfaces";

export function useTravelRequest(id: string) {
  return useQuery<UseTravelRequest, Error>({
    queryKey: ["travel-request", id],
    queryFn: () => getTravelRequest(id),
    staleTime: 0,
  });
}
