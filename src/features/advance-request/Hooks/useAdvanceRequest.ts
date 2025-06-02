import { useQuery } from "@tanstack/react-query";
import { getAdvanceRequest } from "../../../services/apiAdvanceRequest";
import { UseAdvanceRequest } from "../../../interfaces";

export function useAdvanceRequest(id: string) {
  return useQuery<UseAdvanceRequest, Error>({
    queryKey: ["advance-request", id],
    queryFn: () => getAdvanceRequest(id),
    staleTime: 0,
  });
}
