import { useMutation } from "@tanstack/react-query";
// import { useNavigate } from "react-router-dom";

import { AxiosError, AxiosResponse } from "axios";
import { useState } from "react";
import { updatePaymentRequest as updatePaymentRequestApi } from "../../../services/apiPaymentRequest.ts";
import { PaymentRequestType } from "../../../interfaces.ts";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface ErrorResponse {
  message: string;
}

interface LoginError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useUpdatePaymentRequest(requestId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    mutate: updatePaymentRequest,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: Partial<PaymentRequestType>) =>
      updatePaymentRequestApi(requestId, data),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Payment Request updated successfully");

        navigate(-1);
      } else if (data.status !== 200) {
        toast.error("Payment Request update not successful");
        setErrorMessage(data.message);
        console.error("Login Error:", data.message); // Log error directly here
      }
    },

    onError: (err: LoginError) => {
      toast.error("Error updating Payment Request");
      const error = err.response?.data.message || "An error occurred";

      console.error("PaymentRequest Error:", error);
      setErrorMessage(error); // Set the error message to display
    },
  });

  return { updatePaymentRequest, isPending, isError, errorMessage };
}
