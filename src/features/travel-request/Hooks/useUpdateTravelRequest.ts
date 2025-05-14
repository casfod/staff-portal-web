import { useMutation } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { useState } from "react";
import { updateTravelRequest as updateTravelRequestApi } from "../../../services/apiTravelRequest.ts";
import { TravelRequestType } from "../../../interfaces.ts";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface ErrorResponse {
  message: string;
}

interface LoginError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useUpdateTravelRequest(requestId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

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

        navigate(-1);
      } else if (data.status !== 200) {
        toast.error("Travel Request update not successful");
        setErrorMessage(data.message);
        console.error("Login Error:", data.message); // Log error directly here
      }
    },

    onError: (err: LoginError) => {
      toast.error("Error updating Travel Request");
      const error = err.response?.data.message || "An error occurred";

      console.error("TravelRequest Error:", error);
      setErrorMessage(error); // Set the error message to display
    },
  });

  return { updateTravelRequest, isPending, isError, errorMessage };
}
