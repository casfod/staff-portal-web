import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { useNavigate } from "react-router-dom";

import { AxiosError, AxiosResponse } from "axios";
import { useState } from "react";
import { updateConceptNote as updateConceptNoteApi } from "../../../services/apiConceptNotes.ts";
import { ConceptNoteType } from "../../../interfaces.ts";
import toast from "react-hot-toast";

interface ErrorResponse {
  message: string;
}

interface LoginError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useUpdateConceptNote(conceptNoteId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const {
    mutate: updateConceptNote,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({
      data,
      files,
    }: {
      data: Partial<ConceptNoteType>;
      files: File[];
    }) => updateConceptNoteApi(conceptNoteId, data, files),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Concept note updated successfully");

        //Invalidate
        queryClient.invalidateQueries({
          queryKey: ["concept-note", conceptNoteId],
        });
      } else if (data.status !== 200) {
        toast.error("Concept note update not successful");
        setErrorMessage(data.message);
        console.error("Login Error:", data.message); // Log error directly here
      }
    },

    onError: (err: LoginError) => {
      toast.error("Error updating ConceptNote");
      const error = err.response?.data.message || "An error occurred";

      console.error("ConceptNote update Error:", error);
      setErrorMessage(error); // Set the error message to display
    },
  });

  return { updateConceptNote, isPending, isError, errorMessage };
}
