import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useExpenseClaimType } from "../../../interfaces";
import { getAllExpenseClaim } from "../../../services/apiExpenseClaim";

export function useAllExpenseClaims(
  search?: string,
  sort?: string,
  page?: number,
  limit?: number,
  options?: UseQueryOptions<useExpenseClaimType, Error> // Add options parameter
) {
  return useQuery<useExpenseClaimType, Error>({
    queryKey: ["all-expense-claims", search, sort, page, limit],
    queryFn: () => getAllExpenseClaim({ search, sort, page, limit }),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}
