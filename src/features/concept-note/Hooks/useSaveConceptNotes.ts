import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveConceptNote as saveAndSendConceptNoteApi } from "../../../services/apiConceptNotes.ts";
import { AxiosError, AxiosResponse } from "axios";
import { ConceptNoteType } from "../../../interfaces.ts";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface ErrorResponse {
  message: string;
}

interface LoginError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useSaveConceptNote() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: saveConceptNote,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: Partial<ConceptNoteType>) =>
      saveAndSendConceptNoteApi(data),

    onSuccess: (data) => {
      if (data.status === 201) {
        // Show success toast
        toast.success("Concept Note saved successfully");

        // Invalidate the users query to refetch data
        queryClient.invalidateQueries({ queryKey: ["all-concept-notes"] });
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
      console.error("Concept Note save Error:", err.response?.data.message);
    },
  });

  return { saveConceptNote, isPending, isError };
}
