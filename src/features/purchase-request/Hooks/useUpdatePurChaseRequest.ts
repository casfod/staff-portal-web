import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { useNavigate } from "react-router-dom";

import { AxiosError, AxiosResponse } from "axios";
import { useState } from "react";
import { updatePurchaseRequest as updatePurchaseRequestApi } from "../../../services/apiPurchaseRequest.ts";
import { PurChaseRequestType } from "../../../interfaces.ts";
import toast from "react-hot-toast";

interface ErrorResponse {
  message: string;
}

interface LoginError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
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

    onError: (err: LoginError) => {
      toast.error("Error updating Purchase Request");
      const error = err.response?.data.message || "An error occurred";

      console.error("PurchaseRequest Error:", error);
      setErrorMessage(error); // Set the error message to display
    },
  });

  return { updatePurchaseRequest, isPending, isError, errorMessage };
}
