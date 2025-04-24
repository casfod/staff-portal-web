import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendExpenseClaims as sendExpenseClaimsApi } from "../../../services/apiExpenseClaim.ts";
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

export function useSendExpenseClaim() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: sendExpenseClaim,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: Partial<ExpenseClaimType>) => sendExpenseClaimsApi(data),

    onSuccess: (data) => {
      if (data.status === 201) {
        // Show success toast
        toast.success("Expense Claim sent successfully");

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
      console.error("Travel Request send Error:", err.response?.data.message);
    },
  });

  return { sendExpenseClaim, isPending, isError };
}
