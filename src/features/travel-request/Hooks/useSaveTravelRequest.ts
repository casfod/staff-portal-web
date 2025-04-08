import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveTravelRequests as saveTravelRequestsApi } from "../../../services/apiTravelRequest.ts";
import { AxiosError, AxiosResponse } from "axios";
import { TravelRequestType } from "../../../interfaces.ts";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface ErrorResponse {
  message: string;
}

interface LoginError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
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

    onError: (err: LoginError) => {
      // Show error toast
      toast.error(err.response?.data.message || "An error occurred");

      // Log the error for debugging
      console.error("Travel Request save Error:", err.response?.data.message);
    },
  });

  return { saveTravelRequest, isPending, isError };
}
