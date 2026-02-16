// src/features/employment-info/Hooks/useEmploymentInfo.ts
import {
  useQuery,
  UseQueryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getMyEmploymentInfo,
  updateMyEmploymentInfo,
  getAllEmploymentInfoStatus,
  getGlobalSettings,
  toggleGlobalEmploymentInfoUpdate,
  toggleUserEmploymentInfoUpdate,
  superAdminUpdateUserEmploymentInfo,
  superAdminGetUserEmploymentInfo,
} from "../../../services/apiEmploymentInfo";
import {
  UseEmploymentInfoType,
  UseEmploymentInfoStatusType,
  UseSystemSettingsResponse, // Fixed import name
  EmploymentInfoType,
} from "../../../interfaces";
import { AxiosError, AxiosResponse } from "axios";
import toast from "react-hot-toast";
import { useState } from "react";

interface ErrorResponse {
  message: string;
}

interface HookError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

// ============== QUERY HOOKS ==============

// Get current user's employment info
export function useMyEmploymentInfo(
  enabled: boolean = true,
  options?: UseQueryOptions<UseEmploymentInfoType, Error>
) {
  return useQuery<UseEmploymentInfoType, Error>({
    queryKey: ["my-employment-info"],
    queryFn: () => getMyEmploymentInfo(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled,
    ...options,
  });
}

// Get all users employment info status (Admin only)
export function useAllEmploymentInfoStatus(
  options?: UseQueryOptions<UseEmploymentInfoStatusType, Error>
) {
  return useQuery<UseEmploymentInfoStatusType, Error>({
    queryKey: ["employment-info-status"],
    queryFn: () => getAllEmploymentInfoStatus(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    ...options,
  });
}

// Get global settings (Admin only)
export function useGlobalSettings(
  options?: UseQueryOptions<UseSystemSettingsResponse, Error> // Fixed type
) {
  return useQuery<UseSystemSettingsResponse, Error>({
    queryKey: ["global-settings"],
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
    mutationFn: (data: Partial<EmploymentInfoType>) =>
      updateMyEmploymentInfo(data),

    onSuccess: (data) => {
      if (data?.status === 200 || data?.status === 201) {
        queryClient.invalidateQueries({ queryKey: ["my-employment-info"] });
        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast.success("Employment information updated successfully");
        setErrorMessage(null);
      } else {
        toast.error(data?.message || "Failed to update employment information");
      }
    },

    onError: (err: HookError) => {
      const error = err.response?.data?.message || "An error occurred";
      toast.error(error);
      setErrorMessage(error);
      console.error("Update Employment Info Error:", error);
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

    onSuccess: (data) => {
      if (data?.status === 200) {
        queryClient.invalidateQueries({ queryKey: ["global-settings"] });
        queryClient.invalidateQueries({ queryKey: ["employment-info-status"] });
        toast.success(
          `Employment info updates ${
            data.data?.globalEmploymentInfoLock ? "disabled" : "enabled"
          } globally`
        );
      } else {
        toast.error(data?.message || "Failed to update global settings");
      }
    },

    onError: (err: HookError) => {
      const error = err.response?.data?.message || "An error occurred";
      toast.error(error);
      console.error("Toggle Global Update Error:", error);
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

    onSuccess: (data) => {
      if (data?.status === 200) {
        queryClient.invalidateQueries({ queryKey: ["employment-info-status"] });
        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast.success(data?.message || "User permission updated successfully");
      } else {
        toast.error(data?.message || "Failed to update user settings");
      }
    },

    onError: (err: HookError) => {
      const error = err.response?.data?.message || "An error occurred";
      toast.error(error);
      console.error("Toggle User Update Error:", error);
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
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: Partial<EmploymentInfoType>;
    }) => superAdminUpdateUserEmploymentInfo(userId, data),

    onSuccess: (data) => {
      if (data?.status === 200) {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        queryClient.invalidateQueries({ queryKey: ["user"] });
        toast.success("Employment information updated successfully");
      } else {
        toast.error(data?.message || "Failed to update employment information");
      }
    },

    onError: (err: HookError) => {
      const error = err.response?.data?.message || "An error occurred";
      toast.error(error);
      console.error("Super Admin Update Error:", error);
    },
  });

  return { superAdminUpdate, isPending, isError, error };
}

export function useUserEmploymentInfo(
  userId: string,
  options?: UseQueryOptions<UseEmploymentInfoType, Error>
) {
  return useQuery<UseEmploymentInfoType, Error>({
    queryKey: ["user-employment-info", userId],
    queryFn: () => superAdminGetUserEmploymentInfo(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: !!userId,
    ...options,
  });
}
