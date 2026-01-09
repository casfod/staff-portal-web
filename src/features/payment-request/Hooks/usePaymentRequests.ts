import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  PaymentRequestType,
  UsePaymentRequest,
  usePaymentRequestType,
  UsePaymentStatsType,
} from "../../../interfaces";
import {
  getAllPaymentRequest,
  getPaymentRequest,
  getPaymentRequestStats,
  savePaymentRequests as savePaymentRequestsApi,
  sendPaymentRequests as sendPaymentRequestsApi,
  updatePaymentRequest as updatePaymentRequestApi,
  updateStatus as updateStatusApi,
  copyTo as copyToApi,
  addComment as addCommentApi,
  updateComment as updateCommentApi,
  deleteComment as deleteCommentApi,
  deletePaymentRequest as deletePaymentRequestAPI,
} from "../../../services/apiPaymentRequest";
import { AxiosError, AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useState } from "react";

interface ErrorResponse {
  message: string;
}

interface HookError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useAllPaymentRequests(
  search?: string,
  sort?: string,
  page?: number,
  limit?: number,
  options?: UseQueryOptions<usePaymentRequestType, Error> // Add options parameter
) {
  return useQuery<usePaymentRequestType, Error>({
    queryKey: ["all-payment-requests", search, sort, page, limit],
    queryFn: () => getAllPaymentRequest({ search, sort, page, limit }),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}

export function usePaymentRequestStats(
  options?: UseQueryOptions<UsePaymentStatsType, Error> // Add options parameter
) {
  return useQuery<UsePaymentStatsType, Error>({
    queryKey: ["payment-requests-stats"],
    queryFn: () => getPaymentRequestStats(),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}

export function usePaymentRequest(id: string) {
  return useQuery<UsePaymentRequest, Error>({
    queryKey: ["payment-request", id],
    queryFn: () => getPaymentRequest(id),
    staleTime: 0,
  });
}

export function useSavePaymentRequest() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: savePaymentRequest,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: Partial<PaymentRequestType>) =>
      savePaymentRequestsApi(data),

    onSuccess: (data) => {
      if (data.status === 201) {
        // Show success toast
        toast.success("PaymentRequest saved successfully");

        // Invalidate the users query to refetch data
        queryClient.invalidateQueries({ queryKey: ["all-payment-requests"] });
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
      console.error("Payment Request save Error:", err.response?.data.message);
    },
  });

  return { savePaymentRequest, isPending, isError };
}

export function useSendPaymentRequest() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: sendPaymentRequest,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({
      data,
      files,
    }: {
      data: Partial<PaymentRequestType>;
      files: File[];
    }) => sendPaymentRequestsApi(data, files),

    onSuccess: (data) => {
      if (data.status === 201) {
        // Show success toast
        toast.success("PaymentRequest sent successfully");

        // Invalidate the users query to refetch data
        queryClient.invalidateQueries({ queryKey: ["all-payment-requests"] });
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
      console.error("Payment Request send Error:", err.response?.data.message);
    },
  });

  return { sendPaymentRequest, isPending, isError };
}

export function useUpdatePaymentRequest(requestId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: updatePaymentRequest,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({
      data,
      files,
    }: {
      data: Partial<PaymentRequestType>;
      files: File[];
    }) => updatePaymentRequestApi(requestId, data, files),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Payment Request updated successfully");

        //Invalidate
        queryClient.invalidateQueries({
          queryKey: ["payment-request", requestId],
        });
      } else if (data.status !== 200) {
        toast.error("Payment Request update not successful");
        setErrorMessage(data.message);
        console.error("Login Error:", data.message); // Log error directly here
      }
    },

    onError: (err: HookError) => {
      toast.error("Error updating Payment Request");
      const error = err.response?.data.message || "An error occurred";

      console.error("PaymentRequest Error:", error);
      setErrorMessage(error); // Set the error message to display
    },
  });

  return { updatePaymentRequest, isPending, isError, errorMessage };
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

        //Invalidate
        queryClient.invalidateQueries({
          queryKey: ["payment-request", requestId],
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
          queryKey: ["payment-request", requestId],
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

export function useAddComment(requestId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: addComment,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: { text: string }) => addCommentApi(requestId, data),

    onSuccess: (data) => {
      if (data.status === 201) {
        toast.success("Comment added successfully");

        // Invalidate and refetch
        queryClient.invalidateQueries({
          queryKey: ["payment-request", requestId],
        });
      } else if (data.status !== 201) {
        toast.error("Failed to add comment");
        setErrorMessage(data.message);
        console.error("Error:", data.message);
      }
    },

    onError: (err: HookError) => {
      toast.error("Error adding comment");
      const error = err.response?.data.message || "An error occurred";
      console.error("Add Comment Error:", error);
      setErrorMessage(error);
    },
  });

  return { addComment, isPending, isError, errorMessage };
}

export function useUpdateComment(requestId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: updateComment,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({ commentId, text }: { commentId: string; text: string }) =>
      updateCommentApi(requestId, commentId, { text }),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Comment updated successfully");

        // Invalidate and refetch
        queryClient.invalidateQueries({
          queryKey: ["payment-request", requestId],
        });
      } else if (data.status !== 200) {
        toast.error("Failed to update comment");
        setErrorMessage(data.message);
        console.error("Error:", data.message);
      }
    },

    onError: (err: HookError) => {
      toast.error("Error updating comment");
      const error = err.response?.data.message || "An error occurred";
      console.error("Update Comment Error:", error);
      setErrorMessage(error);
    },
  });

  return { updateComment, isPending, isError, errorMessage };
}

export function useDeleteComment(requestId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: deleteComment,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (commentId: string) => deleteCommentApi(requestId, commentId),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Comment deleted successfully");

        // Invalidate and refetch
        queryClient.invalidateQueries({
          queryKey: ["payment-request", requestId],
        });
      } else if (data.status !== 200) {
        toast.error("Failed to delete comment");
        setErrorMessage(data.message);
        console.error("Error:", data.message);
      }
    },

    onError: (err: HookError) => {
      toast.error("Error deleting comment");
      const error = err.response?.data.message || "An error occurred";
      console.error("Delete Comment Error:", error);
      setErrorMessage(error);
    },
  });

  return { deleteComment, isPending, isError, errorMessage };
}

export function useDeletePaymentRequest(
  search?: string,
  sort?: string,
  page?: number,
  limit?: number
) {
  const queryClient = useQueryClient();

  const {
    mutate: deletePaymentRequest,
    isPending: isDeleting,
    isError: isErrorDeleting,
    error: errorDeleting,
  } = useMutation<void, HookError, string>({
    mutationFn: async (userID: string) => {
      await deletePaymentRequestAPI(userID);
    },
    onSuccess: () => {
      toast.success("Payment Request deleted");

      queryClient.invalidateQueries({
        queryKey: ["all-payment-requests", search, sort, page, limit],
      });
    },

    onError: (error) => {
      toast.error("Error deleting Payment Request");

      const errorMessage =
        error.response?.data.message ||
        "An error occurred while deleting the Payment Request.";
      console.error("Delete Payment Request Error:", errorMessage);
    },
  });

  return {
    deletePaymentRequest,
    isDeleting,
    isErrorDeleting,
    errorDeleting,
  };
}
