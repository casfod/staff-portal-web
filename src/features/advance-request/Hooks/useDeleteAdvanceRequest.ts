import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { deleteAdvanceRequest as deleteAdvanceRequestAPI } from "../../../services/apiAdvanceRequest";
import toast from "react-hot-toast";

interface ErrorResponse {
  message: string;
}

type FetchError = AxiosError<ErrorResponse>;

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
  } = useMutation<void, FetchError, string>({
    mutationFn: async (userID: string) => {
      await deleteAdvanceRequestAPI(userID);
    },
    onSuccess: () => {
      toast.success("Advance Request deleted");

      queryClient.invalidateQueries({
        queryKey: ["all-advance-requests", search, sort, page, limit],
      });
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
