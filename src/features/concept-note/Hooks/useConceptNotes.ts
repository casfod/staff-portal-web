import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  ConceptNoteType,
  UseConceptNote,
  UseConceptNoteStatsType,
  UseConceptNoteType,
} from "../../../interfaces";
import {
  getAllConceptNotes,
  getConceptNote,
  getConceptNotesStats,
  saveConceptNote as saveAndSendConceptNoteApi,
  saveAndSendConceptNote as SendConceptNoteApi,
  updateConceptNote as updateConceptNoteApi,
  updateStatus as updateStatusApi,
  addComment as addCommentApi,
  updateComment as updateCommentApi,
  deleteComment as deleteCommentApi,
  deleteConceptNote as deleteConceptNoteAPI,
} from "../../../services/apiConceptNotes";

import { copyTo as copyToApi } from "../../../services/apiConceptNotes";
import { AxiosError, AxiosResponse } from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface ErrorResponse {
  message: string;
}
interface ErrorResponse {
  message: string;
}

interface HookError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useAllConceptNotes(
  search?: string,
  sort?: string,
  page?: number,
  limit?: number,
  options?: UseQueryOptions<UseConceptNoteType, Error> // Add options parameter
) {
  return useQuery<UseConceptNoteType, Error>({
    queryKey: ["all-concept-notes", search, sort, page, limit],
    queryFn: () => getAllConceptNotes({ search, sort, page, limit }),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}

export function useConceptNote(id: string) {
  return useQuery<UseConceptNote, Error>({
    queryKey: ["concept-note", id],
    queryFn: () => getConceptNote(id),
    staleTime: 0,
  });
}

export function useConceptNotesStats(
  options?: UseQueryOptions<UseConceptNoteStatsType, Error> // Add options parameter
) {
  return useQuery<UseConceptNoteStatsType, Error>({
    queryKey: ["concept-notes-stats"],
    queryFn: () => getConceptNotesStats(),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}

export function useCopy(requestId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: copyto,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: { userIds: string[] }) => copyToApi(requestId, data),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Copied successfully");

        //Invalidate
        queryClient.invalidateQueries({
          queryKey: ["concept-note", requestId],
        });
      } else if (data.status !== 200) {
        toast.error("Copy not successful");
        setErrorMessage(data.message);
        console.error("Error:", data.message); // Log error directly here
      }
    },

    onError: (err: HookError) => {
      toast.error("Error");
      const error = err.response?.data.message || "An error occurred";

      console.error("Copy Error:", error);
      setErrorMessage(error); // Set the error message to display
    },
  });

  return { copyto, isPending, isError, errorMessage };
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

    onError: (err: HookError) => {
      // Show error toast
      toast.error(err.response?.data.message || "An error occurred");

      // Log the error for debugging
      console.error("Concept Note save Error:", err.response?.data.message);
    },
  });

  return { saveConceptNote, isPending, isError };
}

export function useSendConceptNote() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: sendConceptNote,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({
      data,
      files,
    }: {
      data: Partial<ConceptNoteType>;
      files: File[];
    }) => SendConceptNoteApi(data, files),

    onSuccess: (data) => {
      if (data.status === 201) {
        // Show success toast
        toast.success("Concept Note sent successfully");

        // Invalidate the users query to refetch data
        queryClient.invalidateQueries({ queryKey: ["all-concept-notes"] });
        navigate(-1);
      } else {
        // Handle unexpected response
        toast.error(data.message);
      }
    },

    onError: (err: HookError) => {
      // Show error toast
      toast.error(err.response?.data.message || "An error occurred");

      // Log the error for debugging
      console.error("Concept Note send Error:", err.response?.data.message);
    },
  });

  return { sendConceptNote, isPending, isError };
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

    onError: (err: HookError) => {
      toast.error("Error updating ConceptNote");
      const error = err.response?.data.message || "An error occurred";

      console.error("ConceptNote update Error:", error);
      setErrorMessage(error); // Set the error message to display
    },
  });

  return { updateConceptNote, isPending, isError, errorMessage };
}

export function useUpdateStatus(requestId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const {
    mutate: updateStatus,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: { status: string; comment: string }) =>
      updateStatusApi(requestId, data),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Status updated successfully");

        //Invalidate
        queryClient.invalidateQueries({
          queryKey: ["concept-note", requestId],
        });
      } else if (data.status !== 200) {
        toast.error("Status update not successful");
        setErrorMessage(data.message);
        console.error("Login Error:", data.message); // Log error directly here
      }
    },

    onError: (err: HookError) => {
      toast.error("Error updating Status");
      const error = err.response?.data.message || "An error occurred";

      console.error("Status update Error:", error);
      setErrorMessage(error); // Set the error message to display
    },
  });

  return { updateStatus, isPending, isError, errorMessage };
}

export function useAddComment(requestId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: addComment,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: { text: string }) => addCommentApi(requestId, data),

    onSuccess: (data) => {
      if (data.status === 201) {
        toast.success("Comment added successfully");

        // Invalidate and refetch
        queryClient.invalidateQueries({
          queryKey: ["advance-request", requestId],
        });
      } else if (data.status !== 201) {
        toast.error("Failed to add comment");
        setErrorMessage(data.message);
        console.error("Error:", data.message);
      }
    },

    onError: (err: HookError) => {
      toast.error("Error adding comment");
      const error = err.response?.data.message || "An error occurred";
      console.error("Add Comment Error:", error);
      setErrorMessage(error);
    },
  });

  return { addComment, isPending, isError, errorMessage };
}

export function useUpdateComment(requestId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: updateComment,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({ commentId, text }: { commentId: string; text: string }) =>
      updateCommentApi(requestId, commentId, { text }),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Comment updated successfully");

        // Invalidate and refetch
        queryClient.invalidateQueries({
          queryKey: ["advance-request", requestId],
        });
      } else if (data.status !== 200) {
        toast.error("Failed to update comment");
        setErrorMessage(data.message);
        console.error("Error:", data.message);
      }
    },

    onError: (err: HookError) => {
      toast.error("Error updating comment");
      const error = err.response?.data.message || "An error occurred";
      console.error("Update Comment Error:", error);
      setErrorMessage(error);
    },
  });

  return { updateComment, isPending, isError, errorMessage };
}

export function useDeleteComment(requestId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: deleteComment,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (commentId: string) => deleteCommentApi(requestId, commentId),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Comment deleted successfully");

        // Invalidate and refetch
        queryClient.invalidateQueries({
          queryKey: ["advance-request", requestId],
        });
      } else if (data.status !== 200) {
        toast.error("Failed to delete comment");
        setErrorMessage(data.message);
        console.error("Error:", data.message);
      }
    },

    onError: (err: HookError) => {
      toast.error("Error deleting comment");
      const error = err.response?.data.message || "An error occurred";
      console.error("Delete Comment Error:", error);
      setErrorMessage(error);
    },
  });

  return { deleteComment, isPending, isError, errorMessage };
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
  } = useMutation<void, HookError, string>({
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
