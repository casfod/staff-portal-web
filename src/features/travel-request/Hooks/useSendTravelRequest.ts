import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendTravelRequests as sendTravelRequestsApi } from "../../../services/apiTravelRequest.ts";
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

    onError: (err: LoginError) => {
      // Show error toast
      toast.error(err.response?.data.message || "An error occurred");

      // Log the error for debugging
      console.error("Travel Request send Error:", err.response?.data.message);
    },
  });

  return { sendTravelRequest, isPending, isError };
}
