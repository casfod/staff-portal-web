import { useMutation, useQueryClient } from "@tanstack/react-query";
import { savePurchaseRequests as savePurchaseRequestsApi } from "../../../services/apiPurchaseRequest.ts";
import { AxiosError, AxiosResponse } from "axios";
import { PurChaseRequestType } from "../../../interfaces.ts";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface ErrorResponse {
  message: string;
}

interface LoginError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useSavePurchaseRequest() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: savePurchaseRequest,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: Partial<PurChaseRequestType>) =>
      savePurchaseRequestsApi(data),

    onSuccess: (data) => {
      if (data.status === 201) {
        // Show success toast
        toast.success("PurchaseRequest saved successfully");

        // Invalidate the users query to refetch data
        queryClient.invalidateQueries({ queryKey: ["all-purchase-requests"] });
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
      console.error("Purchase Request save Error:", err.response?.data.message);
    },
  });

  return { savePurchaseRequest, isPending, isError };
}
