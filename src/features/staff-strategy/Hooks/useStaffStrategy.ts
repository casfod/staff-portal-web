import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AxiosError, AxiosResponse } from 'axios';
import {
  getAllStaffStrategies,
  getStaffStrategy,
  createStaffStrategy,
  saveStaffStrategyDraft,
  submitStaffStrategyDraft,
  updateStaffStrategy,
  updateStatus,
  addComment,
  updateComment,
  deleteComment,
  deleteStaffStrategy,
  getStaffStrategyStats,
  copyTo as copyToApi,
} from '../../../services/apiStaffStrategy';
import { IStaffStrategy, IStaffStrategiesListResponse, IStaffStrategySingleResponse } from '../../../interfaces';
import { useState } from 'react';
import { QueryParams } from '@/services/apiClient';

interface ErrorResponse {
  message: string;
}

interface ApiError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

// Query keys
export const staffStrategyKeys = {
  all: ['staff-strategies'] as const,
  stats: () => [...staffStrategyKeys.all, 'stats'] as const,
  lists: () => [...staffStrategyKeys.all, 'list'] as const,
  list: (filters: QueryParams) => [...staffStrategyKeys.lists(), filters] as const,
  details: () => [...staffStrategyKeys.all, 'detail'] as const,
  detail: (id: string) => [...staffStrategyKeys.details(), id] as const,
};

// ========== GET STATS ==========
export const useStaffStrategyStats = (options?: UseQueryOptions<unknown, Error>) => {
  return useQuery({
    queryKey: staffStrategyKeys.stats(),
    queryFn: () => getStaffStrategyStats(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// ========== GET ALL ==========
export const useStaffStrategies = (
  queryParams: QueryParams,
  options?: UseQueryOptions<IStaffStrategiesListResponse, Error>
) => {
  return useQuery({
    queryKey: staffStrategyKeys.list(queryParams),
    queryFn: () => getAllStaffStrategies(queryParams),
    staleTime: 2 * 60 * 1000,
    placeholderData: previousData => previousData,
    ...options,
  });
};

// ========== GET BY ID ==========
export const useStaffStrategy = (
  strategyId: string,
  options?: UseQueryOptions<IStaffStrategySingleResponse, Error>
) => {
  return useQuery({
    queryKey: staffStrategyKeys.detail(strategyId),
    queryFn: () => getStaffStrategy(strategyId),
    enabled: !!strategyId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// ========== CREATE ==========
export const useCreateStaffStrategy = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: ({ data}: { data: Partial<IStaffStrategy>; files?: File[] }) =>
      createStaffStrategy(data),

    onSuccess: data => {
      if (data?.statusCode === 201 || data?.status === 200) {
        toast.success('Staff Strategy created and submitted successfully');
        queryClient.invalidateQueries({ queryKey: staffStrategyKeys.lists() });
        navigate('/human-resources/staff-strategy');
      } else {
        toast.error(data?.message || 'Failed to create Staff Strategy');
      }
    },

    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message || 'An error occurred while creating Staff Strategy');
    },
  });

  return {
    createStaffStrategy: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
};

// ========== SAVE DRAFT ==========
export const useSaveStaffStrategyDraft = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (data: Partial<IStaffStrategy>) => saveStaffStrategyDraft(data),

    onSuccess: data => {
      if (data?.statusCode === 201 || data?.status === 200) {
        toast.success('Staff Strategy saved as draft');
        queryClient.invalidateQueries({ queryKey: staffStrategyKeys.lists() });
        navigate('/human-resources/staff-strategy');
      } else {
        toast.error(data?.message || 'Failed to save draft');
      }
    },

    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message || 'An error occurred while saving draft');
    },
  });

  return {
    saveStaffStrategyDraft: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
};

// ========== SUBMIT DRAFT ==========
export const useSubmitStaffStrategyDraft = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: ({ strategyId }: { strategyId: string }) =>
      submitStaffStrategyDraft(strategyId),

    onSuccess: data => {
      if (data?.statusCode === 200) {
        toast.success('Staff Strategy submitted for approval');
        queryClient.invalidateQueries({ queryKey: staffStrategyKeys.lists() });
        navigate('/human-resources/staff-strategy');
      } else {
        toast.error(data?.message || 'Failed to submit Staff Strategy');
      }
    },

    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message || 'An error occurred while submitting');
    },
  });

  return {
    submitStaffStrategyDraft: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
};

// ========== UPDATE ==========
export const useUpdateStaffStrategy = (strategyId: string) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ data }: { data: Partial<IStaffStrategy>; files?: File[] }) =>
      updateStaffStrategy(strategyId, data),

    onSuccess: data => {
      if (data?.statusCode === 200) {
        toast.success('Staff Strategy updated successfully');
        queryClient.invalidateQueries({ queryKey: staffStrategyKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: staffStrategyKeys.detail(strategyId),
        });
      } else {
        toast.error(data?.message || 'Failed to update Staff Strategy');
        setErrorMessage(data?.message);
      }
    },

    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message || 'An error occurred while updating Staff Strategy');
      setErrorMessage(err.response?.data?.message || 'An error occurred');
    },
  });

  return {
    updateStaffStrategy: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage,
  };
};

// ========== UPDATE STATUS ==========
export const useUpdateStaffStrategyStatus = (requestId: string) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { status: string; comment?: string }) => updateStatus(requestId, data),

    onSuccess: data => {
      if (data?.statusCode === 200) {
        toast.success(`Staff Strategy ${data.data?.status || 'updated'} successfully`);
        queryClient.invalidateQueries({ queryKey: staffStrategyKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: staffStrategyKeys.detail(requestId),
        });
      } else {
        toast.error('Status update not successful');
        setErrorMessage(data?.message);
      }
    },

    onError: (err: ApiError) => {
      toast.error('Error updating status');
      const error = err.response?.data?.message || 'An error occurred';
      setErrorMessage(error);
    },
  });

  return {
    updateStatus: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage,
  };
};

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

    onError: (err: ApiError) => {
      toast.error('Error');
      const error = err.response?.data.message || 'An error occurred';

      console.error('Copy Error:', error);
      setErrorMessage(error); // Set the error message to display
    },
  });

  return { copyto, isPending, isError, errorMessage };
}

// ========== COMMENTS ==========
export const useAddComment = (requestId: string) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { text: string }) => addComment(requestId, data),

    onSuccess: data => {
      if (data?.statusCode === 201) {
        toast.success('Comment added successfully');
        queryClient.invalidateQueries({
          queryKey: staffStrategyKeys.detail(requestId),
        });
      } else {
        toast.error('Failed to add comment');
        setErrorMessage(data?.message);
      }
    },

    onError: (err: ApiError) => {
      toast.error('Error adding comment');
      const error = err.response?.data?.message || 'An error occurred';
      setErrorMessage(error);
    },
  });

  return {
    addComment: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage,
  };
};

export const useUpdateComment = (requestId: string) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ commentId, text }: { commentId: string; text: string }) =>
      updateComment(requestId, commentId, { text }),

    onSuccess: data => {
      if (data?.statusCode === 200) {
        toast.success('Comment updated successfully');
        queryClient.invalidateQueries({
          queryKey: staffStrategyKeys.detail(requestId),
        });
      } else {
        toast.error('Failed to update comment');
        setErrorMessage(data?.message);
      }
    },

    onError: (err: ApiError) => {
      toast.error('Error updating comment');
      const error = err.response?.data?.message || 'An error occurred';
      setErrorMessage(error);
    },
  });

  return {
    updateComment: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage,
  };
};

export const useDeleteComment = (requestId: string) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(requestId, commentId),

    onSuccess: data => {
      if (data?.statusCode === 200) {
        toast.success('Comment deleted successfully');
        queryClient.invalidateQueries({
          queryKey: staffStrategyKeys.detail(requestId),
        });
      } else {
        toast.error('Failed to delete comment');
        setErrorMessage(data?.message);
      }
    },

    onError: (err: ApiError) => {
      toast.error('Error deleting comment');
      const error = err.response?.data?.message || 'An error occurred';
      setErrorMessage(error);
    },
  });

  return {
    deleteComment: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage,
  };
};

// ========== DELETE ==========
export const useDeleteStaffStrategy = (
  queryParams: QueryParams,

) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, ApiError, string>({
    mutationFn: async (strategyId: string) => {
      await deleteStaffStrategy(strategyId);
    },
    onSuccess: () => {
      toast.success('Staff Strategy deleted successfully');
      queryClient.invalidateQueries({
        queryKey: staffStrategyKeys.list(queryParams),
      });
    },
    onError: error => {
      toast.error('Error deleting Staff Strategy');
      const errorMessage =
        error.response?.data?.message || 'An error occurred while deleting the Staff Strategy.';
      console.error('Delete Staff Strategy Error:', errorMessage);
    },
  });

  return {
    deleteStaffStrategy: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};
