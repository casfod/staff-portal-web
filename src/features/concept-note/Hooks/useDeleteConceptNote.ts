import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { deleteConceptNote as deleteConceptNoteAPI } from "../../../services/apiConceptNotes";
import toast from "react-hot-toast";

interface ErrorResponse {
  message: string;
}

type FetchError = AxiosError<ErrorResponse>;

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
  } = useMutation<void, FetchError, string>({
    mutationFn: async (userID: string) => {
      await deleteConceptNoteAPI(userID);
    },
    onSuccess: () => {
      toast.success("Concept Note deleted");

      queryClient.invalidateQueries({
        queryKey: ["all-concept-notes", search, sort, page, limit],
      });
    },
    onError: (error) => {
      toast.error("Error deleting Concept Note");
      const errorMessage =
        error.response?.data.message ||
        "An error occurred while deleting the Concept Note.";
      console.error("Delete Concept Note Error:", errorMessage);
    },
  });

  return {
    deleteConceptNote,
    isDeleting,
    isErrorDeleting,
    errorDeleting,
  };
}
