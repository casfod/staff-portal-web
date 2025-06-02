import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { useState } from "react";
import { updateStatus as updateStatusApi } from "../../../services/apiTravelRequest.ts";

import toast from "react-hot-toast";

interface ErrorResponse {
  message: string;
}

interface LoginError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
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

    onError: (err: LoginError) => {
      toast.error("Error updating Status");
      const error = err.response?.data.message || "An error occurred";

      console.error("Status update Error:", error);
      setErrorMessage(error); // Set the error message to display
    },
  });

  return { updateStatus, isPending, isError, errorMessage };
}
