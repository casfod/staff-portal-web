import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { deletePurchaseRequest as deletePurchaseRequestAPI } from "../../../services/apiPurchaseRequest";
import toast from "react-hot-toast";

interface ErrorResponse {
  message: string;
}

interface FetchError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useDeletePurchaseRequest(
  search?: string,
  sort?: string,
  page?: number,
  limit?: number
) {
  const queryClient = useQueryClient();

  const {
    mutate: deletePurchaseRequest,
    isPending: isDeleting,
    isError: isErrorDeleting,
    error: errorDeleting,
  } = useMutation<any, FetchError, string>({
    mutationFn: async (userID: string) => {
      await deletePurchaseRequestAPI(userID);
    },
    onSuccess: () => {
      toast.success("Purchase Request deleted");

      queryClient.invalidateQueries([
        "all-purchase-requests",
        search,
        sort,
        page,
        limit,
      ] as any);
    },

    onError: (error) => {
      toast.error("Error deleting Purchase Request");

      const errorMessage =
        error.response?.data.message ||
        "An error occurred while deleting the Purchase Request.";
      console.error("Delete Purchase Request Error:", errorMessage);
    },
  });

  return {
    deletePurchaseRequest,
    isDeleting,
    isErrorDeleting,
    errorDeleting,
  };
}
