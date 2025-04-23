import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveExpenseClaims as saveExpenseClaimsApi } from "../../../services/apiExpenseClaim.ts";
import { AxiosError, AxiosResponse } from "axios";
import { ExpenseClaimType } from "../../../interfaces.ts";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface ErrorResponse {
  message: string;
}

interface LoginError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useSaveExpenseClaim() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: saveExpenseClaim,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: Partial<ExpenseClaimType>) => saveExpenseClaimsApi(data),

    onSuccess: (data) => {
      if (data.status === 201) {
        // Show success toast
        toast.success("ExpenseClaim saved successfully");

        // Invalidate the users query to refetch data
        queryClient.invalidateQueries({ queryKey: ["all-expense-claims"] });
        navigate(-1);
      } else {
        // Handle unexpected response
        toast.error(data.message);
      }
    },

    onError: (err: LoginError) => {
      // Show error toast
      toast.error(err.response?.data.message || "An error occurred");

      // Log the error for debugging
      console.error("Travel Request save Error:", err.response?.data.message);
    },
  });

  return { saveExpenseClaim, isPending, isError };
}
