import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  ExpenseClaimType,
  UseExpenseClaim,
  UseExpenseClaimStatsType,
  useExpenseClaimType,
} from "../../../interfaces";
import {
  getAllExpenseClaim,
  getExpenseClaim,
  getExpenseClaimStats,
  saveExpenseClaims as saveExpenseClaimsApi,
  sendExpenseClaims as sendExpenseClaimsApi,
  updateExpenseClaim as updateExpenseClaimApi,
  updateStatus as updateStatusApi,
  copyTo as copyToApi,
  deleteExpenseClaim as deleteExpenseClaimAPI,
} from "../../../services/apiExpenseClaim";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AxiosError, AxiosResponse } from "axios";
import { useState } from "react";

interface ErrorResponse {
  message: string;
}

interface HookError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

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

export function useExpenseClaimStats(
  options?: UseQueryOptions<UseExpenseClaimStatsType, Error> // Add options parameter
) {
  return useQuery<UseExpenseClaimStatsType, Error>({
    queryKey: ["expense-claim-stats"],
    queryFn: () => getExpenseClaimStats(),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}

export function useExpenseClaim(id: string) {
  return useQuery<UseExpenseClaim, Error>({
    queryKey: ["expense-claim", id],
    queryFn: () => getExpenseClaim(id),
    staleTime: 0,
  });
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
        toast.success("ExpenseClaim saved successfully");
        queryClient.invalidateQueries({ queryKey: ["all-expense-claims"] });
        navigate(-1);
      } else {
        toast.error(data.message);
      }
    },

    onError: (err: HookError) => {
      toast.error(err.response?.data.message || "An error occurred");
      console.error("Expense Claim save error:", err.response?.data.message);
    },
  });

  return { saveExpenseClaim, isPending, isError };
}

export function useSendExpenseClaim() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: sendExpenseClaim,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({
      data,
      files,
    }: {
      data: Partial<ExpenseClaimType>;
      files: File[];
    }) => sendExpenseClaimsApi(data, files),

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

    onError: (err: HookError) => {
      // Show error toast
      toast.error(err.response?.data.message || "An error occurred");

      // Log the error for debugging
      console.error("Travel Request send Error:", err.response?.data.message);
    },
  });

  return { sendExpenseClaim, isPending, isError };
}

export function useUpdateExpenseClaim(requestId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

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

        queryClient.invalidateQueries({
          queryKey: ["expense-claim", requestId],
        });
      } else if (data.status !== 200) {
        toast.error("Expense Claim update not successful");
        setErrorMessage(data.message);
        console.error("Login Error:", data.message); // Log error directly here
      }
    },

    onError: (err: HookError) => {
      toast.error("Error updating Expense Claim");
      const error = err.response?.data.message || "An error occurred";

      console.error("Expense Claim Error:", error);
      setErrorMessage(error); // Set the error message to display
    },
  });

  return { updateExpenseClaim, isPending, isError, errorMessage };
}

export function useUpdateStatus(requestId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: updateStatus,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: { status: string; comment: string }) =>
      updateStatusApi(requestId, data),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Status updated successfully");

        queryClient.invalidateQueries({
          queryKey: ["expense-claim", requestId],
        });
      } else if (data.status !== 200) {
        toast.error("Status update not successful");
        setErrorMessage(data.message);
        console.error("Login Error:", data.message); // Log error directly here
      }
    },

    onError: (err: HookError) => {
      toast.error("Error updating Status");
      const error = err.response?.data.message || "An error occurred";

      console.error("Status update Error:", error);
      setErrorMessage(error); // Set the error message to display
    },
  });

  return { updateStatus, isPending, isError, errorMessage };
}

export function useCopy(requestId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: copyto,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: { userIds: string[] }) => copyToApi(requestId, data),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Copied successfully");

        //Invalidate
        queryClient.invalidateQueries({
          queryKey: ["expense-claim", requestId],
        });
      } else if (data.status !== 200) {
        toast.error("Copy not successful");
        setErrorMessage(data.message);
        console.error("Error:", data.message); // Log error directly here
      }
    },

    onError: (err: HookError) => {
      toast.error("Error");
      const error = err.response?.data.message || "An error occurred";

      console.error("Copy Error:", error);
      setErrorMessage(error); // Set the error message to display
    },
  });

  return { copyto, isPending, isError, errorMessage };
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
  } = useMutation<void, HookError, string>({
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
