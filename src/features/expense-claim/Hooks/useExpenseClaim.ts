import { useQuery } from "@tanstack/react-query";
import { UseExpenseClaim } from "../../../interfaces";
import { getExpenseClaim } from "../../../services/apiExpenseClaim";

export function useExpenseClaim(id: string) {
  return useQuery<UseExpenseClaim, Error>({
    queryKey: ["expense-claim", id],
    queryFn: () => getExpenseClaim(id),
    staleTime: 0,
  });
}
