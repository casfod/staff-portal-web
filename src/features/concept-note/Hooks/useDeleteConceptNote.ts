import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { deleteConceptNote as deleteConceptNoteAPI } from "../../../services/apiConceptNotes";
import toast from "react-hot-toast";

interface ErrorResponse {
  message: string;
}

interface FetchError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useDeleteConceptNote(
  search?: string,
  sort?: string,
  page?: number,
  limit?: number
) {
  const queryClient = useQueryClient();

  const {
    mutate: deleteConceptNote,
    isPending: isDeleting,
    isError: isErrorDeleting,
    error: errorDeleting,
  } = useMutation<any, FetchError, string>({
    mutationFn: async (userID: string) => {
      await deleteConceptNoteAPI(userID);
    },
    onSuccess: () => {
      toast.success("Concept Note deleted");

      queryClient.invalidateQueries([
        "all-concept-notes",
        search,
        sort,
        page,
        limit,
      ] as any);
    },

    onError: (error) => {
      toast.error("Error deleting Concept Note");

      const errorMessage =
        error.response?.data.message ||
        "An error occurred while deleting the Concept Note.";
      console.error("Delete Purchase Request Error:", errorMessage);
    },
  });

  return {
    deleteConceptNote,
    isDeleting,
    isErrorDeleting,
    errorDeleting,
  };
}
