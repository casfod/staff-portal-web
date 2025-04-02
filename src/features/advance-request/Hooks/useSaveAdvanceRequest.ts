import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveAdvanceRequests as saveAdvanceRequestsApi } from "../../../services/apiAdvanceRequest.ts";
import { AxiosError, AxiosResponse } from "axios";
import { AdvanceRequestType } from "../../../interfaces.ts";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface ErrorResponse {
  message: string;
}

interface LoginError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useSaveAdvanceRequest() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: saveAdvanceRequest,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: Partial<AdvanceRequestType>) =>
      saveAdvanceRequestsApi(data),

    onSuccess: (data) => {
      if (data.status === 201) {
        // Show success toast
        toast.success("AdvanceRequest saved successfully");

        // Invalidate the users query to refetch data
        queryClient.invalidateQueries({ queryKey: ["all-advance-requests"] });
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
      console.error("Advance Request save Error:", err.response?.data.message);
    },
  });

  return { saveAdvanceRequest, isPending, isError };
}
