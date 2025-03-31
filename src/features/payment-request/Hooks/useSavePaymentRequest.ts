import { useMutation, useQueryClient } from "@tanstack/react-query";
import { savePaymentRequests as savePaymentRequestsApi } from "../../../services/apiPaymentRequest.ts";
import { AxiosError, AxiosResponse } from "axios";
import { PaymentRequestType } from "../../../interfaces.ts";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface ErrorResponse {
  message: string;
}

interface LoginError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useSavePaymentRequest() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: savePaymentRequest,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: Partial<PaymentRequestType>) =>
      savePaymentRequestsApi(data),

    onSuccess: (data) => {
      if (data.status === 201) {
        // Show success toast
        toast.success("PaymentRequest saved successfully");

        // Invalidate the users query to refetch data
        queryClient.invalidateQueries({ queryKey: ["all-payment-requests"] });
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
      console.error("Payment Request save Error:", err.response?.data.message);
    },
  });

  return { savePaymentRequest, isPending, isError };
}
