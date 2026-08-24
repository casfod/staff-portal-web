import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
  IConceptNote,
  IConceptNoteSingleResponse,
  IConceptNotesListResponse,
  IConceptNoteStatsResponse,
} from '../../../interfaces';
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
} from '../../../services/apiConceptNotes';

import { copyTo as copyToApi } from '../../../services/apiConceptNotes';
import { AxiosError, AxiosResponse } from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface ErrorResponse {
  message: string;
}

interface HookError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useAllConceptNotes(
  queryParams: Record<string, string | number | undefined>,
  options?: UseQueryOptions<IConceptNotesListResponse, Error>
) {
  return useQuery<IConceptNotesListResponse, Error>({
    queryKey: ['all-concept-notes', queryParams],
    queryFn: () => getAllConceptNotes(queryParams),
    staleTime: 0,
    ...options,
  });
}

export function useConceptNote(id: string) {
  return useQuery<IConceptNoteSingleResponse, Error>({
    queryKey: ['concept-note', id],
    queryFn: () => getConceptNote(id),
    staleTime: 0,
  });
}

export function useConceptNotesStats(options?: UseQueryOptions<IConceptNoteStatsResponse, Error>) {
  return useQuery<IConceptNoteStatsResponse, Error>({
    queryKey: ['concept-notes-stats'],
    queryFn: () => getConceptNotesStats(),
    staleTime: 0,
    ...options,
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
    mutationFn: (data: { recipients: string[] }) => copyToApi(requestId, data),
    onSuccess: data => {
      if (data.statusCode === 200) {
        toast.success('Copied successfully');
        queryClient.invalidateQueries({ queryKey: ['concept-note', requestId] });
      } else if (data.status !== 200) {
        toast.error('Copy not successful');
        setErrorMessage(data.message);
      }
    },
    onError: (err: HookError) => {
      toast.error('Error');
      setErrorMessage(err.response?.data.message || 'An error occurred');
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
    mutationFn: (data: Partial<IConceptNote>) => saveAndSendConceptNoteApi(data),
    onSuccess: data => {
      if (data.statusCode === 201) {
        toast.success('Concept Note saved successfully');
        queryClient.invalidateQueries({ queryKey: ['all-concept-notes'] });
        navigate(-1);
      } else {
        toast.error(data.message);
      }
    },
    onError: (err: HookError) => {
      toast.error(err.response?.data.message || 'An error occurred');
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
    mutationFn: ({ data }: { data: Partial<IConceptNote> }) => SendConceptNoteApi(data),
    onSuccess: data => {
      if (data.statusCode === 201) {
        toast.success('Concept Note sent successfully');
        queryClient.invalidateQueries({ queryKey: ['all-concept-notes'] });
        navigate(-1);
      } else {
        toast.error(data.message);
      }
    },
    onError: (err: HookError) => {
      toast.error(err.response?.data.message || 'An error occurred');
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
    mutationFn: ({ data }: { data: Record<string, unknown> }) =>
      updateConceptNoteApi(conceptNoteId, data),
    onSuccess: data => {
      if (data.statusCode === 200) {
        toast.success('Concept note updated successfully');
        queryClient.invalidateQueries({ queryKey: ['concept-note', conceptNoteId] });
      } else if (data.status !== 200) {
        toast.error('Concept note update not successful');
        setErrorMessage(data.message);
      }
    },
    onError: (err: HookError) => {
      toast.error('Error updating ConceptNote');
      setErrorMessage(err.response?.data.message || 'An error occurred');
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
    mutationFn: (data: { status: string; comment: string }) => updateStatusApi(requestId, data),
    onSuccess: data => {
      if (data.statusCode === 200) {
        toast.success('Status updated successfully');
        queryClient.invalidateQueries({ queryKey: ['concept-note', requestId] });
      } else if (data.status !== 200) {
        toast.error('Status update not successful');
        setErrorMessage(data.message);
      }
    },
    onError: (err: HookError) => {
      toast.error('Error updating Status');
      setErrorMessage(err.response?.data.message || 'An error occurred');
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
    onSuccess: data => {
      if (data.statusCode === 201) {
        toast.success('Comment added successfully');
        queryClient.invalidateQueries({ queryKey: ['concept-note', requestId] });
      } else if (data.status !== 201) {
        toast.error('Failed to add comment');
        setErrorMessage(data.message);
      }
    },
    onError: (err: HookError) => {
      toast.error('Error adding comment');
      setErrorMessage(err.response?.data.message || 'An error occurred');
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
    onSuccess: data => {
      if (data.statusCode === 200) {
        toast.success('Comment updated successfully');
        queryClient.invalidateQueries({ queryKey: ['concept-note', requestId] });
      } else if (data.status !== 200) {
        toast.error('Failed to update comment');
        setErrorMessage(data.message);
      }
    },
    onError: (err: HookError) => {
      toast.error('Error updating comment');
      setErrorMessage(err.response?.data.message || 'An error occurred');
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
    onSuccess: data => {
      if (data.statusCode === 200) {
        toast.success('Comment deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['concept-note', requestId] });
      } else if (data.status !== 200) {
        toast.error('Failed to delete comment');
        setErrorMessage(data.message);
      }
    },
    onError: (err: HookError) => {
      toast.error('Error deleting comment');
      setErrorMessage(err.response?.data.message || 'An error occurred');
    },
  });

  return { deleteComment, isPending, isError, errorMessage };
}

export function useDeleteConceptNote(queryParams: Record<string, string | number | undefined>) {
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
      toast.success('Concept Note deleted');
      queryClient.invalidateQueries({ queryKey: ['all-concept-notes', queryParams] });
    },
    onError: error => {
      toast.error('Error deleting Concept Note');
      console.error(
        'Delete Concept Note Error:',
        error.response?.data.message || 'An error occurred while deleting the Concept Note.'
      );
    },
  });

  return { deleteConceptNote, isDeleting, isErrorDeleting, errorDeleting };
}
