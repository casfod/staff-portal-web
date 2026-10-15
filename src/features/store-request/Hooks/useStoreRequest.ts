import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
  IHookError,
  IStoreRequest,
  IStoreRequestSingleResponse,
  IStoreRequestStatsResponse,
  IStoreRequestsListResponse,
} from '../../../interfaces';
import {
  createStoreRequest as createStoreRequestApi,
  deleteStoreRequest as deleteStoreRequestApi,
  getAllStoreRequests,
  getStoreRequestStats,
  saveStoreRequestDraft as saveStoreRequestDraftApi,
  updateStoreRequest as updateStoreRequestApi,
} from '../../../services/apiStoreRequest';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function useAllStoreRequests(
  queryParams: Record<string, string | number | undefined>,
  options?: UseQueryOptions<IStoreRequestsListResponse, Error>
) {
  return useQuery<IStoreRequestsListResponse, Error>({
    queryKey: ['all-store-requests', queryParams],
    queryFn: () => getAllStoreRequests(queryParams),
    staleTime: 0,
    ...options,
  });
}

export function useStoreRequestStats(
  options?: UseQueryOptions<IStoreRequestStatsResponse, Error>
) {
  return useQuery<IStoreRequestStatsResponse, Error>({
    queryKey: ['store-request-stats'],
    queryFn: () => getStoreRequestStats(),
    staleTime: 0,
    ...options,
  });
}

function useStoreRequestMutation(
  mutationFn: (data: Partial<IStoreRequest>) => Promise<IStoreRequestSingleResponse>,
  successMessage: string
) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation<IStoreRequestSingleResponse, IHookError, Partial<IStoreRequest>>({
    mutationFn,
    onSuccess: response => {
      if (response.statusCode === 201) {
        toast.success(successMessage);
        queryClient.invalidateQueries({ queryKey: ['all-store-requests'] });
        navigate(-1);
      } else {
        toast.error(response.message || 'Store request could not be saved');
      }
    },
    onError: error => {
      toast.error(error.response?.data.message || 'An error occurred while saving the store request');
    },
  });

  return mutation;
}

export function useSaveStoreRequestDraft() {
  const { mutate, isPending, isError } = useStoreRequestMutation(
    saveStoreRequestDraftApi,
    'Store request saved as draft'
  );
  return { saveStoreRequestDraft: mutate, isPending, isError };
}

export function useCreateStoreRequest() {
  const { mutate, isPending, isError } = useStoreRequestMutation(
    createStoreRequestApi,
    'Store request created successfully'
  );
  return { createStoreRequest: mutate, isPending, isError };
}

export function useUpdateStoreRequest(requestId: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate, isPending, isError } = useMutation<
    IStoreRequestSingleResponse,
    IHookError,
    Partial<IStoreRequest>
  >({
    mutationFn: data => updateStoreRequestApi(requestId, data),
    onSuccess: response => {
      if (response.statusCode === 200) {
        toast.success('Store Request updated successfully');
        queryClient.invalidateQueries({ queryKey: ['all-store-requests'] });
        navigate(-1);
      } else {
        toast.error(response.message || 'Store Request could not be updated');
      }
    },
    onError: error => {
      toast.error(error.response?.data.message || 'An error occurred while updating the Store Request');
    },
  });

  return { updateStoreRequest: mutate, isPending, isError };
}

export function useDeleteStoreRequest(queryParams: Record<string, string | number | undefined>) {
  const queryClient = useQueryClient();

  const { mutate: deleteStoreRequest, isPending, isError, error } = useMutation<
    unknown,
    IHookError,
    string
  >({
    mutationFn: deleteStoreRequestApi,
    onSuccess: () => {
      toast.success('Store Request deleted');
      queryClient.invalidateQueries({
        queryKey: ['all-store-requests', queryParams],
      });
    },
    onError: mutationError => {
      toast.error(
        mutationError.response?.data.message || 'An error occurred while deleting the Store Request.'
      );
    },
  });

  return { deleteStoreRequest, isPending, isError, error };
}