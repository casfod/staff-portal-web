import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  PurChaseRequestType,
  UsePurChaseRequest,
  usePurChaseRequestType,
  UsePurchaseStatsType,
} from "../../../interfaces";
import { AxiosError, AxiosResponse } from "axios";
import { useState } from "react";
import { copyTo as copyToApi } from "../../../services/apiPurchaseRequest";
import {
  getAllPurchaseRequest,
  getPurChaseRequest,
  getPurchaseRequestStats,
  sendPurchaseRequests as sendPurchaseRequestsApi,
  savePurchaseRequests as savePurchaseRequestsApi,
  updatePurchaseRequest as updatePurchaseRequestApi,
  updateStatus as updateStatusApi,
  addComment as addCommentApi,
  updateComment as updateCommentApi,
  deleteComment as deleteCommentApi,
  deletePurchaseRequest as deletePurchaseRequestAPI,
} from "../../../services/apiPurchaseRequest";

import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface ErrorResponse {
  message: string;
}

interface HookError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useAllPurchaseRequests(
  search?: string,
  sort?: string,
  page?: number,
  limit?: number,
  options?: UseQueryOptions<usePurChaseRequestType, Error> // Add options parameter
) {
  return useQuery<usePurChaseRequestType, Error>({
    queryKey: ["all-purchase-requests", search, sort, page, limit],
    queryFn: () => getAllPurchaseRequest({ search, sort, page, limit }),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
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
          queryKey: ["purchase-request", requestId],
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

export function usePurchaseRequest(id: string) {
  return useQuery<UsePurChaseRequest, Error>({
    queryKey: ["purchase-request", id],
    queryFn: () => getPurChaseRequest(id),
    staleTime: 0,
  });
}

export function usePurchaseStats(
  options?: UseQueryOptions<UsePurchaseStatsType, Error> // Add options parameter
) {
  return useQuery<UsePurchaseStatsType, Error>({
    queryKey: ["purchase-requests-stats"],
    queryFn: () => getPurchaseRequestStats(),
    // staleTime: 0,
    staleTime: 5 * 60 * 1000, // 5 minutes before data becomes stale
    // cacheTime: 15 * 60 * 1000, // 15 minutes before cache is garbage collected

    ...options, // Spread the options to include onError
  });
}

export function useSavePurchaseRequest() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: savePurchaseRequest,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: Partial<PurChaseRequestType>) =>
      savePurchaseRequestsApi(data),

    onSuccess: (data) => {
      if (data.status === 201) {
        // Show success toast
        toast.success("PurchaseRequest saved successfully");

        // Invalidate the users query to refetch data
        queryClient.invalidateQueries({ queryKey: ["all-purchase-requests"] });
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
      console.error("Purchase Request save Error:", err.response?.data.message);
    },
  });

  return { savePurchaseRequest, isPending, isError };
}

export function useSendPurchaseRequest() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: sendPurchaseRequest,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({
      data,
      files,
    }: {
      data: Partial<PurChaseRequestType>;
      files: File[];
    }) => sendPurchaseRequestsApi(data, files),

    onSuccess: (data) => {
      if (data.status === 201) {
        // Show success toast
        toast.success("PurchaseRequest sent successfully");

        // Invalidate the users query to refetch data
        queryClient.invalidateQueries({ queryKey: ["all-purchase-requests"] });
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
      console.error("Purchase Request send Error:", err.response?.data.message);
    },
  });

  return { sendPurchaseRequest, isPending, isError };
}

export function useUpdatePurChaseRequest(requestId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const {
    mutate: updatePurchaseRequest,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({
      data,
      files,
    }: {
      data: Partial<PurChaseRequestType>;
      files: File[];
    }) => updatePurchaseRequestApi(requestId, data, files),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Purchase Request updated successfully");

        //Invalidate
        queryClient.invalidateQueries({
          queryKey: ["purchase-request", requestId],
        });
      } else if (data.status !== 200) {
        toast.error("Purchase Request update not successful");
        setErrorMessage(data.message);
        console.error("Login Error:", data.message); // Log error directly here
      }
    },

    onError: (err: HookError) => {
      toast.error("Error updating Purchase Request");
      const error = err.response?.data.message || "An error occurred";

      console.error("PurchaseRequest Error:", error);
      setErrorMessage(error); // Set the error message to display
    },
  });

  return { updatePurchaseRequest, isPending, isError, errorMessage };
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
          queryKey: ["purchase-request", requestId],
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
          queryKey: ["advance-request", requestId],
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
          queryKey: ["advance-request", requestId],
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
          queryKey: ["advance-request", requestId],
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

export function useDeletePurchaseRequest(
  search?: string,
  sort?: string,
  page?: number,
  limit?: number
) {
  const queryClient = useQueryClient();

  const {
    mutate: deletePurchaseRequest,
    isPending: isDeleting,
    isError: isErrorDeleting,
    error: errorDeleting,
  } = useMutation<void, HookError, string>({
    mutationFn: async (userID: string) => {
      await deletePurchaseRequestAPI(userID);
    },
    onSuccess: () => {
      toast.success("Purchase Request deleted");

      queryClient.invalidateQueries({
        queryKey: ["all-purchase-requests", search, sort, page, limit],
      });
    },

    onError: (error) => {
      toast.error("Error deleting Purchase Request");

      const errorMessage =
        error.response?.data.message ||
        "An error occurred while deleting the Purchase Request.";
      console.error("Delete Purchase Request Error:", errorMessage);
    },
  });

  return {
    deletePurchaseRequest,
    isDeleting,
    isErrorDeleting,
    errorDeleting,
  };
}
