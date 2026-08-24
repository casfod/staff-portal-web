import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
  getAdvanceRequest,
  getAdvanceRequestStats,
  getAllAdvanceRequest,
  saveAdvanceRequests as saveAdvanceRequestsApi,
  sendAdvanceRequests as sendAdvanceRequestsApi,
  updateAdvanceRequest as updateAdvanceRequestApi,
  updateStatus as updateStatusApi,
  copyTo as copyToApi,
  addComment as addCommentApi,
  updateComment as updateCommentApi,
  deleteComment as deleteCommentApi,
  deleteAdvanceRequest as deleteAdvanceRequestAPI,
} from '../../../services/apiAdvanceRequest';
import {
  IAdvanceRequest,
  IAdvanceRequestSingleResponse,
  IAdvanceRequestStatsResponse,
  IAdvanceRequestsListResponse,
} from '../../../interfaces';
import { AxiosError, AxiosResponse } from 'axios';
import { useState } from 'react';

import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { setAdvanceRequest } from '@/store/advanceRequestSlice';
import { useDispatch } from 'react-redux';

interface ErrorResponse {
  message: string;
}

interface ErrorResponse {
  message: string;
}

interface HookError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useAdvanceRequest(id: string) {
  return useQuery<IAdvanceRequestSingleResponse, Error>({
    queryKey: ['advance-request', id],
    queryFn: () => getAdvanceRequest(id),
    staleTime: 0,
  });
}

export function useAdvanceRequestStats(
  options?: UseQueryOptions<IAdvanceRequestStatsResponse, Error> // Add options parameter
) {
  return useQuery<IAdvanceRequestStatsResponse, Error>({
    queryKey: ['advance-requests-stats'],
    queryFn: () => getAdvanceRequestStats(),
    staleTime: 0,
    ...options, // Spread the options to include onError
  });
}

export function useAllAdvanceRequests(
  queryParams: Record<string, string | number | undefined>,
  options?: UseQueryOptions<IAdvanceRequestsListResponse, Error> // Add options parameter
) {
  return useQuery<IAdvanceRequestsListResponse, Error>({
    // Every filter field is part of the cache key, not just search/sort/
    // page/limit, so changing a filter reliably triggers a refetch instead
    // of silently serving a cached page from before the filter changed.
    queryKey: ['all-advance-requests', queryParams],
    queryFn: () => getAllAdvanceRequest(queryParams),
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
    mutationFn: (data: { recipients: string[] }) => copyToApi(requestId, data),

    onSuccess: data => {
      if (data.statusCode === 200) {
        toast.success('Copied successfully');

        //Invalidate
        queryClient.invalidateQueries({
          queryKey: ['advance-request', requestId],
        });
      } else if (data.status !== 200) {
        toast.error('Copy not successful');
        setErrorMessage(data.message);
        console.error('Error:', data.message); // Log error directly here
      }
    },

    onError: (err: HookError) => {
      toast.error('Error');
      const error = err.response?.data.message || 'An error occurred';

      console.error('Copy Error:', error);
      setErrorMessage(error); // Set the error message to display
    },
  });

  return { copyto, isPending, isError, errorMessage };
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

        // Invalidate and refetch
        queryClient.invalidateQueries({
          queryKey: ['advance-request', requestId],
        });
      } else if (data.status !== 201) {
        toast.error('Failed to add comment');
        setErrorMessage(data.message);
        console.error('Error:', data.message);
      }
    },

    onError: (err: HookError) => {
      toast.error('Error adding comment');
      const error = err.response?.data.message || 'An error occurred';
      console.error('Add Comment Error:', error);
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

    onSuccess: data => {
      if (data.statusCode === 200) {
        toast.success('Comment updated successfully');

        // Invalidate and refetch
        queryClient.invalidateQueries({
          queryKey: ['advance-request', requestId],
        });
      } else if (data.status !== 200) {
        toast.error('Failed to update comment');
        setErrorMessage(data.message);
        console.error('Error:', data.message);
      }
    },

    onError: (err: HookError) => {
      toast.error('Error updating comment');
      const error = err.response?.data.message || 'An error occurred';
      console.error('Update Comment Error:', error);
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

    onSuccess: data => {
      if (data.statusCode === 200) {
        toast.success('Comment deleted successfully');

        // Invalidate and refetch
        queryClient.invalidateQueries({
          queryKey: ['advance-request', requestId],
        });
      } else if (data.status !== 200) {
        toast.error('Failed to delete comment');
        setErrorMessage(data.message);
        console.error('Error:', data.message);
      }
    },

    onError: (err: HookError) => {
      toast.error('Error deleting comment');
      const error = err.response?.data.message || 'An error occurred';
      console.error('Delete Comment Error:', error);
      setErrorMessage(error);
    },
  });

  return { deleteComment, isPending, isError, errorMessage };
}

export function useDeleteAdvanceRequest(queryParams: Record<string, string | number | undefined>) {
  const queryClient = useQueryClient();

  const {
    mutate: deleteAdvanceRequest,
    isPending: isDeleting,
    isError: isErrorDeleting,
    error: errorDeleting,
  } = useMutation<void, HookError, string>({
    mutationFn: async (userID: string) => {
      await deleteAdvanceRequestAPI(userID);
    },
    onSuccess: () => {
      toast.success('Advance Request deleted');

      queryClient.invalidateQueries({
        queryKey: ['all-advance-requests', queryParams],
      });
    },
    onError: error => {
      toast.error('Error deleting Advance Request');

      const errorMessage =
        error.response?.data.message || 'An error occurred while deleting the Advance Request.';
      console.error('Delete Advance Request Error:', errorMessage);
    },
  });

  return {
    deleteAdvanceRequest,
    isDeleting,
    isErrorDeleting,
    errorDeleting,
  };
}

export function useSaveAdvanceRequest() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: saveAdvanceRequest,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: Partial<IAdvanceRequest>) => saveAdvanceRequestsApi(data),

    onSuccess: data => {
      if (data.statusCode === 201) {
        // Show success toast
        toast.success('AdvanceRequest saved successfully');

        // Invalidate the users query to refetch data
        queryClient.invalidateQueries({ queryKey: ['all-advance-requests'] });
        navigate(-1);
      } else {
        // Handle unexpected response
        toast.error(data.message);
      }
    },

    onError: (err: HookError) => {
      // Show error toast
      toast.error(err.response?.data.message || 'An error occurred');

      // Log the error for debugging
      console.error('Advance Request save Error:', err.response?.data.message);
    },
  });

  return { saveAdvanceRequest, isPending, isError };
}

export function useSendAdvanceRequest() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: sendAdvanceRequest,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({ data }: { data: Partial<IAdvanceRequest> }) => sendAdvanceRequestsApi(data),

    onSuccess: data => {
      if (data.statusCode === 201) {
        // Show success toast
        toast.success('AdvanceRequest sent successfully');

        // Invalidate the users query to refetch data
        queryClient.invalidateQueries({ queryKey: ['all-advance-requests'] });
        navigate(-1);
      } else {
        // Handle unexpected response
        toast.error(data.message);
      }
    },

    onError: (err: HookError) => {
      // Show error toast
      toast.error(err.response?.data.message || 'An error occurred');

      // Log the error for debugging
      console.error('Advance Request send Error:', err.response?.data.message);
    },
  });

  return { sendAdvanceRequest, isPending, isError };
}

// useAdvanceRequest.ts

export function useUpdateAdvanceRequest(requestId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const {
    mutate: updateAdvanceRequest,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({
      data,
    }: {
      data: Record<string, unknown>; // 👈 Changed from Partial<IAdvanceRequest>
    }) => updateAdvanceRequestApi(requestId, data),

    onSuccess: data => {
      if (data.statusCode === 200) {
        toast.success('Advance Request updated successfully');

        // Invalidate queries
        queryClient.invalidateQueries({
          queryKey: ['advance-request', requestId],
        });

        dispatch(setAdvanceRequest(data.data));
        queryClient.invalidateQueries({ queryKey: ['all-advance-requests'] });
      } else if (data.status !== 200) {
        toast.error('Advance Request update not successful');
        setErrorMessage(data.message);
        console.error('Update Error:', data.message);
      }
    },

    onError: (err: HookError) => {
      toast.error('Error updating Advance Request');
      const error = err.response?.data.message || 'An error occurred';
      console.error('AdvanceRequest Error:', error);
      setErrorMessage(error);
    },
  });

  return { updateAdvanceRequest, isPending, isError, errorMessage };
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

        //Invalidate
        queryClient.invalidateQueries({
          queryKey: ['advance-request', requestId],
        });
      } else if (data.status !== 200) {
        toast.error('Status update not successful');
        setErrorMessage(data.message);
        console.error('Login Error:', data.message); // Log error directly here
      }
    },

    onError: (err: HookError) => {
      toast.error('Error updating Status');
      const error = err.response?.data.message || 'An error occurred';

      console.error('Status update Error:', error);
      setErrorMessage(error); // Set the error message to display
    },
  });

  return { updateStatus, isPending, isError, errorMessage };
}
