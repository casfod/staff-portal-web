import { useMutation } from "@tanstack/react-query";
// import { useNavigate } from "react-router-dom";

import { AxiosError, AxiosResponse } from "axios";
import { useState } from "react";
import { updateExpenseClaim as updateExpenseClaimApi } from "../../../services/apiExpenseClaim.ts";
import { ExpenseClaimType } from "../../../interfaces.ts";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface ErrorResponse {
  message: string;
}

interface LoginError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useUpdateExpenseClaim(requestId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    mutate: updateExpenseClaim,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({
      data,
      files,
    }: {
      data: Partial<ExpenseClaimType>;
      files: File[];
    }) => updateExpenseClaimApi(requestId, data, files),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Expense Claim updated successfully");

        navigate(-1);
      } else if (data.status !== 200) {
        toast.error("Expense Claim update not successful");
        setErrorMessage(data.message);
        console.error("Login Error:", data.message); // Log error directly here
      }
    },

    onError: (err: LoginError) => {
      toast.error("Error updating Expense Claim");
      const error = err.response?.data.message || "An error occurred";

      console.error("Expense Claim Error:", error);
      setErrorMessage(error); // Set the error message to display
    },
  });

  return { updateExpenseClaim, isPending, isError, errorMessage };
}
