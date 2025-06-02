import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { useNavigate } from "react-router-dom";
import { AxiosError, AxiosResponse } from "axios";
import { useState } from "react";
import { updateAdvanceRequest as updateAdvanceRequestApi } from "../../../services/apiAdvanceRequest.ts";
import { AdvanceRequestType } from "../../../interfaces.ts";
import toast from "react-hot-toast";

interface ErrorResponse {
  message: string;
}

interface LoginError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useUpdateAdvanceRequest(requestId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: updateAdvanceRequest,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({
      data,
      files,
    }: {
      data: Partial<AdvanceRequestType>;
      files: File[];
    }) => updateAdvanceRequestApi(requestId, data, files),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Advance Request updated successfully");

        //Invalidate
        queryClient.invalidateQueries({
          queryKey: ["advance-request", requestId],
        });
      } else if (data.status !== 200) {
        toast.error("Advance Request update not successful");
        setErrorMessage(data.message);
        console.error("Login Error:", data.message); // Log error directly here
      }
    },

    onError: (err: LoginError) => {
      toast.error("Error updating Advance Request");
      const error = err.response?.data.message || "An error occurred";

      console.error("AdvanceRequest Error:", error);
      setErrorMessage(error); // Set the error message to display
    },
  });

  return { updateAdvanceRequest, isPending, isError, errorMessage };
}
