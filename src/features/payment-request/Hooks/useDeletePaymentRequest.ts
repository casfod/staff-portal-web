import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { deletePaymentRequest as deletePaymentRequestAPI } from "../../../services/apiPaymentRequest";
import toast from "react-hot-toast";

interface ErrorResponse {
  message: string;
}

interface FetchError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useDeletePaymentRequest(
  search?: string,
  sort?: string,
  page?: number,
  limit?: number
) {
  const queryClient = useQueryClient();

  const {
    mutate: deletePaymentRequest,
    isPending: isDeleting,
    isError: isErrorDeleting,
    error: errorDeleting,
  } = useMutation<any, FetchError, string>({
    mutationFn: async (userID: string) => {
      await deletePaymentRequestAPI(userID);
    },
    onSuccess: () => {
      toast.success("Payment Request deleted");

      queryClient.invalidateQueries([
        "all-payment-requests",
        search,
        sort,
        page,
        limit,
      ] as any);
    },

    onError: (error) => {
      toast.error("Error deleting Payment Request");

      const errorMessage =
        error.response?.data.message ||
        "An error occurred while deleting the Payment Request.";
      console.error("Delete Payment Request Error:", errorMessage);
    },
  });

  return {
    deletePaymentRequest,
    isDeleting,
    isErrorDeleting,
    errorDeleting,
  };
}
