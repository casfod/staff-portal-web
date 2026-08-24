// useUsers.ts
import {
  useQuery,
  UseQueryOptions,
  useMutation,
  useQueryClient,
  // InvalidateQueryFilters,
} from '@tanstack/react-query';
import {
  IUserSingleResponse,
  IUsersListResponse,
  IAdminsListResponse,
  IUser,
} from '../../../interfaces';
import {
  getUsers,
  getAdmins,
  getReviewers,
  addUser as addUserApi,
  updateUserAdmin as updateUserAdminAPI,
  deactivateUser as deactivateUserApi,
  activateUser as activateUserApi,
  getUserById,
  exportUsersToExcel,
  updatePassword as updatePasswordApi,
} from '../../../services/apiUser';
import { getUser } from '../../../services/apiAuth';
import { useDispatch } from 'react-redux';
import { closeModal } from '../../../store/modalSlice.ts';

import { AxiosError, AxiosResponse } from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ErrorResponse {
  message: string;
}

interface HookError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useAddUser() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const {
    mutate: addUser,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: Partial<IUser>) => addUserApi(data),

    onSuccess: data => {
      if (data.statusCode === 201) {
        dispatch(closeModal());
        toast.success('User added successfully');
        queryClient.invalidateQueries({ queryKey: ['users'] });
      } else {
        toast.error(data.message);
      }
    },

    onError: (err: HookError) => {
      toast.error(err.response?.data.message || 'An error occurred');
      console.error('Add User Error:', err.response?.data.message);
    },
  });

  return { addUser, isPending, isError };
}

export function useAdmins(options?: UseQueryOptions<IAdminsListResponse, Error>) {
  return useQuery<IAdminsListResponse, Error>({
    queryKey: ['admins'],
    queryFn: () => getAdmins(),
    staleTime: 0,
    ...options,
  });
}

export function useUsers(
  queryParams: Record<string, string | number | undefined>,
  options?: UseQueryOptions<IUsersListResponse, Error>
) {
  return useQuery<IUsersListResponse, Error>({
    queryKey: ['users', queryParams],
    queryFn: () => getUsers(queryParams),
    staleTime: 0,
    ...options,
  });
}

export function useUser(id: string) {
  return useQuery<IUserSingleResponse, Error>({
    queryKey: ['user', id],
    queryFn: getUser,
    staleTime: 0,
  });
}

export function useUserById(id: string) {
  return useQuery<IUserSingleResponse, Error>({
    queryKey: [`user-${id}`, id],
    queryFn: () => getUserById(id),
    staleTime: 0,
  });
}

interface Error extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useUpdateUser(id: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: UpdateUser,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: Partial<IUser>) => updateUserAdminAPI(id, data),

    onSuccess: data => {
      if (data.statusCode === 200) {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: [`user-${id}`] });
        toast.success('User updated successfully');
      } else {
        toast.error(data.message || 'Failed to update user');
      }
    },

    onError: (err: Error) => {
      const error = err.response?.data.message || 'An error occurred while updating the user';
      toast.error(error);
      console.error('Update User Error:', error);
      setErrorMessage(error);
    },
  });

  return { UpdateUser, isPending, isError, errorMessage };
}

export function useReviewers(options?: UseQueryOptions<IAdminsListResponse, Error>) {
  return useQuery<IAdminsListResponse, Error>({
    queryKey: ['reviewers'],
    queryFn: () => getReviewers(),
    staleTime: 0,
    ...options,
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  const {
    mutate: deactivateUser,
    isPending: isDeactivating,
    isError: isErrorDeactivating,
    error: errorDeactivating,
  } = useMutation<void, HookError, string>({
    mutationFn: async (userID: string) => {
      await deactivateUserApi(userID);
    },
    onSuccess: userId => {
      toast.success('User deactivated successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: [`user-${userId}`] });
    },

    onError: error => {
      toast.error('Error deactivating User');
      const errorMessage =
        error.response?.data.message || 'An error occurred while deactivating the user.';
      console.error('Deactivate user Error:', errorMessage);
    },
  });

  return {
    deactivateUser,
    isDeactivating,
    isErrorDeactivating,
    errorDeactivating,
  };
}

export function useActivateUser() {
  const queryClient = useQueryClient();

  const {
    mutate: activateUser,
    isPending: isActivating,
    isError: isErrorActivating,
    error: errorActivating,
  } = useMutation<void, HookError, string>({
    mutationFn: async (userID: string) => {
      await activateUserApi(userID);
    },
    onSuccess: userId => {
      toast.success('User activated successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: [`user-${userId}`] });
    },

    onError: error => {
      toast.error('Error activating User');
      const errorMessage =
        error.response?.data.message || 'An error occurred while activating the user.';
      console.error('Activating user Error:', errorMessage);
    },
  });

  return {
    activateUser,
    isActivating,
    isErrorActivating,
    errorActivating,
  };
}

export function useChangePassword() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    mutate: changePassword,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => updatePasswordApi(data),

    onSuccess: () => {
      setErrorMessage(null);
      toast.success('Password changed successfully');
    },

    onError: (err: HookError) => {
      const message = err.response?.data?.message || 'Failed to change password';
      toast.error(message);
      setErrorMessage(message);
    },
  });

  return { changePassword, isPending, isSuccess, errorMessage };
}

export const useExportUsersToExcel = () => {
  const {
    mutate: exportUsersMutation,
    isPending: isExporting,
    isError: isExportError,
    isSuccess: isExportSuccess,
  } = useMutation({
    mutationFn: exportUsersToExcel,

    onSuccess: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users_export_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Users exported successfully');
    },

    onError: (err: HookError) => {
      const errorMessage = err.response?.data?.message || 'An error occurred while exporting users';
      toast.error(errorMessage);
      console.error('Users export error:', errorMessage);
    },
  });

  return {
    exportUsers: exportUsersMutation,
    isExporting,
    isExportError,
    isExportSuccess,
  };
};
