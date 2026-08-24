// src/features/employment-info/Hooks/useEmploymentInfo.ts
import { useQuery, UseQueryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyEmploymentInfo,
  updateMyEmploymentInfo,
  getAllEmploymentInfoStatus,
  getGlobalSettings,
  toggleGlobalEmploymentInfoUpdate,
  toggleUserEmploymentInfoUpdate,
  superAdminUpdateUserEmploymentInfo,
  superAdminGetUserEmploymentInfo,
} from '../../../services/apiEmploymentInfo';
import {
  IHookError,
  IEmploymentInfo,
  IEmploymentInfoResponse,
  ISystemSettingsResponse, // Fixed import name
} from '../../../interfaces';
import toast from 'react-hot-toast';
import { useState } from 'react';

// ============== QUERY HOOKS ==============

// Get current user's employment info
export function useMyEmploymentInfo(
  enabled: boolean = true,
  options?: UseQueryOptions<IEmploymentInfoResponse, Error>
) {
  return useQuery<IEmploymentInfoResponse, Error>({
    queryKey: ['my-employment-info'],
    queryFn: () => getMyEmploymentInfo(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled,
    ...options,
  });
}

// Get all users employment info status (Admin only)
export function useAllEmploymentInfoStatus(
  options?: UseQueryOptions<IEmploymentInfoResponse, Error>
) {
  return useQuery<IEmploymentInfoResponse, Error>({
    queryKey: ['employment-info-status'],
    queryFn: () => getAllEmploymentInfoStatus(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    ...options,
  });
}

// Get global settings (Admin only)
export function useGlobalSettings(
  options?: UseQueryOptions<ISystemSettingsResponse, Error> // Fixed type
) {
  return useQuery<ISystemSettingsResponse, Error>({
    queryKey: ['global-settings'],
    queryFn: () => getGlobalSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    ...options,
  });
}

// ============== MUTATION HOOKS ==============

// Update my employment info
export function useUpdateMyEmploymentInfo() {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    mutate: updateEmploymentInfo,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: Partial<IEmploymentInfo>) => updateMyEmploymentInfo(data),

    onSuccess: data => {
      if (data?.statusCode === 200 || data?.status === 201) {
        queryClient.invalidateQueries({ queryKey: ['my-employment-info'] });
        queryClient.invalidateQueries({ queryKey: ['users'] });
        toast.success('Employment information updated successfully');
        setErrorMessage(null);
      } else {
        toast.error(data?.message || 'Failed to update employment information');
      }
    },

    onError: (err: IHookError) => {
      const error = err.response?.data?.message || 'An error occurred';
      toast.error(error);
      setErrorMessage(error);
      console.error('Update Employment Info Error:', error);
    },
  });

  return { updateEmploymentInfo, isPending, isError, errorMessage };
}

// Toggle global employment info updates (Super Admin only)
export function useToggleGlobalUpdate() {
  const queryClient = useQueryClient();

  const {
    mutate: toggleGlobalUpdate,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (enabled: boolean) => toggleGlobalEmploymentInfoUpdate(enabled),

    onSuccess: data => {
      if (data?.statusCode === 200) {
        queryClient.invalidateQueries({ queryKey: ['global-settings'] });
        queryClient.invalidateQueries({ queryKey: ['employment-info-status'] });
        toast.success(
          `Employment info updates ${
            data.data?.globalEmploymentInfoLock ? 'disabled' : 'enabled'
          } globally`
        );
      } else {
        toast.error(data?.message || 'Failed to update global settings');
      }
    },

    onError: (err: IHookError) => {
      const error = err.response?.data?.message || 'An error occurred';
      toast.error(error);
      console.error('Toggle Global Update Error:', error);
    },
  });

  return { toggleGlobalUpdate, isPending, isError };
}

// Toggle user-specific employment info updates (Admin/Super Admin)
export function useToggleUserUpdate() {
  const queryClient = useQueryClient();

  const {
    mutate: toggleUserUpdate,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({ userId, enabled }: { userId: string; enabled: boolean }) =>
      toggleUserEmploymentInfoUpdate(userId, enabled),

    onSuccess: data => {
      if (data?.statusCode === 200) {
        queryClient.invalidateQueries({ queryKey: ['employment-info-status'] });
        queryClient.invalidateQueries({ queryKey: ['users'] });
        toast.success(data?.message || 'User permission updated successfully');
      } else {
        toast.error(data?.message || 'Failed to update user settings');
      }
    },

    onError: (err: IHookError) => {
      const error = err.response?.data?.message || 'An error occurred';
      toast.error(error);
      console.error('Toggle User Update Error:', error);
    },
  });

  return { toggleUserUpdate, isPending, isError };
}

// Super Admin update employment info
export function useSuperAdminUpdateEmploymentInfo() {
  const queryClient = useQueryClient();

  const {
    mutate: superAdminUpdate,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<IEmploymentInfo> }) =>
      superAdminUpdateUserEmploymentInfo(userId, data),

    onSuccess: data => {
      if (data?.statusCode === 200) {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['user'] });
        toast.success('Employment information updated successfully');
      } else {
        toast.error(data?.message || 'Failed to update employment information');
      }
    },

    onError: (err: IHookError) => {
      const error = err.response?.data?.message || 'An error occurred';
      toast.error(error);
      console.error('Super Admin Update Error:', error);
    },
  });

  return { superAdminUpdate, isPending, isError, error };
}

export function useUserEmploymentInfo(
  userId: string,
  options?: UseQueryOptions<IEmploymentInfo, Error>
) {
  return useQuery<IEmploymentInfo, Error>({
    queryKey: ['user-employment-info', userId],
    queryFn: () => superAdminGetUserEmploymentInfo(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: !!userId,
    ...options,
  });
}
