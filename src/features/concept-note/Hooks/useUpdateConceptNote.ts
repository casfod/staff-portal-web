import { useMutation } from "@tanstack/react-query";
// import { useNavigate } from "react-router-dom";

import { AxiosError, AxiosResponse } from "axios";
import { useState } from "react";
import { updateConceptNote as updateConceptNoteApi } from "../../../services/apiConceptNotes.ts";
import { ConceptNote } from "../../../interfaces.ts";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface ErrorResponse {
  message: string;
}

interface LoginError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useUpdateConceptNote(conceptNoteId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    mutate: updateConceptNote,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: Partial<ConceptNote>) =>
      updateConceptNoteApi(conceptNoteId, data),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Concept note updated successfully");

        navigate(-1);
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
