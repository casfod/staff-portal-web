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
    mutationFn: ({
      data,
      files,
    }: {
      data: Partial<ExpenseClaimType>;
      files: File[];
    }) => saveExpenseClaimsApi(data, files),

    onSuccess: (data) => {
      if (data.status === 201) {
        toast.success("ExpenseClaim saved successfully");
        queryClient.invalidateQueries({ queryKey: ["all-expense-claims"] });
        navigate(-1);
      } else {
        toast.error(data.message);
      }
    },

    onError: (err: LoginError) => {
      toast.error(err.response?.data.message || "An error occurred");
      console.error("Expense Claim save error:", err.response?.data.message);
    },
  });

  return { saveExpenseClaim, isPending, isError };
}
