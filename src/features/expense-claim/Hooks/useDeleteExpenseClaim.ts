import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { deleteExpenseClaim as deleteExpenseClaimAPI } from "../../../services/apiExpenseClaim";
import toast from "react-hot-toast";

interface ErrorResponse {
  message: string;
}

interface FetchError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useDeleteExpenseClaim(
  search?: string,
  sort?: string,
  page?: number,
  limit?: number
) {
  const queryClient = useQueryClient();

  const {
    mutate: deleteExpenseClaim,
    isPending: isDeleting,
    isError: isErrorDeleting,
    error: errorDeleting,
  } = useMutation<void, FetchError, string>({
    mutationFn: async (userID: string) => {
      await deleteExpenseClaimAPI(userID);
    },
    onSuccess: () => {
      toast.success("Expens Claim deleted");

      queryClient.invalidateQueries({
        queryKey: ["all-expense-claims", search, sort, page, limit],
      });
    },

    onError: (error) => {
      toast.error("Error deleting Expens Claim");

      const errorMessage =
        error.response?.data.message ||
        "An error occurred while deleting the Expens Claim.";
      console.error("Delete Expens Claim Error:", errorMessage);
    },
  });

  return {
    deleteExpenseClaim,
    isDeleting,
    isErrorDeleting,
    errorDeleting,
  };
}
