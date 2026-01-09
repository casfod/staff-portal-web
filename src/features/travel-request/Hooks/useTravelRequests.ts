import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  TravelRequestType,
  UseTravelRequest,
  useTravelRequestType,
  UseTravelStatsType,
} from "../../../interfaces";
import {
  getAllTravelRequest,
  getTravelRequest,
  getTravelRequestStats,
  saveTravelRequests as saveTravelRequestsApi,
  sendTravelRequests as sendTravelRequestsApi,
  updateStatus as updateStatusApi,
  updateTravelRequest as updateTravelRequestApi,
  copyTo as copyToApi,
  deleteTravelRequest as deleteTravelRequestAPI,
} from "../../../services/apiTravelRequest";
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

export function useAllTravelRequests(
  search?: string,
  sort?: string,
  page?: number,
  limit?: number,
  options?: UseQueryOptions<useTravelRequestType, Error> // Add options parameter
) {
  return useQuery<useTravelRequestType, Error>({
    queryKey: ["all-travel-requests", search, sort, page, limit],
    queryFn: () => getAllTravelRequest({ search, sort, page, limit }),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}

export function useTravelRequestStats(
  options?: UseQueryOptions<UseTravelStatsType, Error> // Add options parameter
) {
  return useQuery<UseTravelStatsType, Error>({
    queryKey: ["travel-requests-stats"],
    queryFn: () => getTravelRequestStats(),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}

export function useTravelRequest(id: string) {
  return useQuery<UseTravelRequest, Error>({
    queryKey: ["travel-request", id],
    queryFn: () => getTravelRequest(id),
    staleTime: 0,
  });
}

export function useSaveTravelRequest() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: saveTravelRequest,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: Partial<TravelRequestType>) =>
      saveTravelRequestsApi(data),

    onSuccess: (data) => {
      if (data.status === 201) {
        // Show success toast
        toast.success("TravelRequest saved successfully");

        // Invalidate the users query to refetch data
        queryClient.invalidateQueries({ queryKey: ["all-travel-requests"] });
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
      console.error("Travel Request save Error:", err.response?.data.message);
    },
  });

  return { saveTravelRequest, isPending, isError };
}

export function useSendTravelRequest() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: sendTravelRequest,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({
      data,
      files,
    }: {
      data: Partial<TravelRequestType>;
      files: File[];
    }) => sendTravelRequestsApi(data, files),

    onSuccess: (data) => {
      if (data.status === 201) {
        // Show success toast
        toast.success("TravelRequest sent successfully");

        // Invalidate the users query to refetch data
        queryClient.invalidateQueries({ queryKey: ["all-travel-requests"] });
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

  return { sendTravelRequest, isPending, isError };
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
          queryKey: ["travel-request", requestId],
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

export function useUpdateTravelRequest(requestId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: updateTravelRequest,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({
      data,
      files,
    }: {
      data: Partial<TravelRequestType>;
      files: File[];
    }) => updateTravelRequestApi(requestId, data, files),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Travel Request updated successfully");

        //Invalidate
        queryClient.invalidateQueries({
          queryKey: ["travel-request", requestId],
        });
      } else if (data.status !== 200) {
        toast.error("Travel Request update not successful");
        setErrorMessage(data.message);
        console.error("Login Error:", data.message); // Log error directly here
      }
    },

    onError: (err: HookError) => {
      toast.error("Error updating Travel Request");
      const error = err.response?.data.message || "An error occurred";

      console.error("TravelRequest Error:", error);
      setErrorMessage(error); // Set the error message to display
    },
  });

  return { updateTravelRequest, isPending, isError, errorMessage };
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
          queryKey: ["travel-request", requestId],
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

export function useDeleteTravelRequest(
  search?: string,
  sort?: string,
  page?: number,
  limit?: number
) {
  const queryClient = useQueryClient();

  const {
    mutate: deleteTravelRequest,
    isPending: isDeleting,
    isError: isErrorDeleting,
    error: errorDeleting,
  } = useMutation<void, HookError, string>({
    mutationFn: async (userID: string) => {
      await deleteTravelRequestAPI(userID);
    },
    onSuccess: () => {
      toast.success("Travel Request deleted");

      queryClient.invalidateQueries({
        queryKey: ["all-travel-requests", search, sort, page, limit],
      });
    },

    onError: (error) => {
      toast.error("Error deleting Travel Request");

      const errorMessage =
        error.response?.data.message ||
        "An error occurred while deleting the Travel Request.";
      console.error("Delete Travel Request Error:", errorMessage);
    },
  });

  return {
    deleteTravelRequest,
    isDeleting,
    isErrorDeleting,
    errorDeleting,
  };
}
