import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { deleteAdvanceRequest as deleteAdvanceRequestAPI } from "../../../services/apiAdvanceRequest";
import toast from "react-hot-toast";

interface ErrorResponse {
  message: string;
}

interface FetchError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useDeleteAdvanceRequest(
  search?: string,
  sort?: string,
  page?: number,
  limit?: number
) {
  const queryClient = useQueryClient();

  const {
    mutate: deleteAdvanceRequest,
    isPending: isDeleting,
    isError: isErrorDeleting,
    error: errorDeleting,
  } = useMutation<any, FetchError, string>({
    mutationFn: async (userID: string) => {
      await deleteAdvanceRequestAPI(userID);
    },
    onSuccess: () => {
      toast.success("Advance Request deleted");

      queryClient.invalidateQueries([
        "all-advance-requests",
        search,
        sort,
        page,
        limit,
      ] as any);
    },

    onError: (error) => {
      toast.error("Error deleting Advance Request");

      const errorMessage =
        error.response?.data.message ||
        "An error occurred while deleting the Advance Request.";
      console.error("Delete Advance Request Error:", errorMessage);
    },
  });

  return {
    deleteAdvanceRequest,
    isDeleting,
    isErrorDeleting,
    errorDeleting,
  };
}
