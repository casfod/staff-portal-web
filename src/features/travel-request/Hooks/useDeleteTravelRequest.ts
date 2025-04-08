import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { deleteTravelRequest as deleteTravelRequestAPI } from "../../../services/apiTravelRequest";
import toast from "react-hot-toast";

interface ErrorResponse {
  message: string;
}

interface FetchError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useDeleteTravelRequest(
  search?: string,
  sort?: string,
  page?: number,
  limit?: number
) {
  const queryClient = useQueryClient();

  const {
    mutate: deleteTravelRequest,
    isPending: isDeleting,
    isError: isErrorDeleting,
    error: errorDeleting,
  } = useMutation<any, FetchError, string>({
    mutationFn: async (userID: string) => {
      await deleteTravelRequestAPI(userID);
    },
    onSuccess: () => {
      toast.success("Travel Request deleted");

      queryClient.invalidateQueries([
        "all-travel-requests",
        search,
        sort,
        page,
        limit,
      ] as any);
    },

    onError: (error) => {
      toast.error("Error deleting Travel Request");

      const errorMessage =
        error.response?.data.message ||
        "An error occurred while deleting the Travel Request.";
      console.error("Delete Travel Request Error:", errorMessage);
    },
  });

  return {
    deleteTravelRequest,
    isDeleting,
    isErrorDeleting,
    errorDeleting,
  };
}
