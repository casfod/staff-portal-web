// src/features/leave/Hooks/useLeave.ts
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  UseLeave,
  UseLeaveStatsType,
  UseLeaveType,
  UseLeaveBalance,
  LeaveFormData,
} from "../../../interfaces";
import {
  getAllLeaves,
  getLeave,
  getLeaveStats,
  getMyLeaveBalance,
  getUserLeaveBalance,
  saveLeaveDraft as saveLeaveDraftApi,
  createLeaveApplication as createLeaveApplicationApi,
  updateLeaveApplication as updateLeaveApplicationApi,
  updateLeaveStatus as updateLeaveStatusApi,
  addComment as addCommentApi,
  updateComment as updateCommentApi,
  deleteComment as deleteCommentApi,
  deleteLeave as deleteLeaveAPI,
  copyLeave as copyLeaveApi,
} from "../../../services/apiLeave";

import { AxiosError, AxiosResponse } from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface ErrorResponse {
  message: string;
}

interface HookError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useAllLeaves(
  search?: string,
  sort?: string,
  page?: number,
  limit?: number,
  options?: UseQueryOptions<UseLeaveType, Error>
) {
  return useQuery<UseLeaveType, Error>({
    queryKey: ["all-leaves", search, sort, page, limit],
    queryFn: () => getAllLeaves({ search, sort, page, limit }),
    staleTime: 0,
    ...options,
  });
}

export function useLeave(id: string) {
  return useQuery<UseLeave, Error>({
    queryKey: ["leave", id],
    queryFn: () => getLeave(id),
    staleTime: 0,
  });
}

export function useLeaveStats(
  options?: UseQueryOptions<UseLeaveStatsType, Error>
) {
  return useQuery<UseLeaveStatsType, Error>({
    queryKey: ["leave-stats"],
    queryFn: () => getLeaveStats(),
    staleTime: 0,
    ...options,
  });
}

export function useMyLeaveBalance() {
  return useQuery<UseLeaveBalance, Error>({
    queryKey: ["my-leave-balance"],
    queryFn: () => getMyLeaveBalance(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserLeaveBalance(userId: string) {
  return useQuery<UseLeaveBalance, Error>({
    queryKey: ["user-leave-balance", userId],
    queryFn: () => getUserLeaveBalance(userId),
    staleTime: 5 * 60 * 1000,
    enabled: !!userId,
  });
}

export function useCopyLeave(requestId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: copyto,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: { userIds: string[] }) => copyLeaveApi(requestId, data),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Copied successfully");
        queryClient.invalidateQueries({
          queryKey: ["leave", requestId],
        });
      } else {
        toast.error("Copy not successful");
        setErrorMessage(data.message);
        console.error("Error:", data.message);
      }
    },

    onError: (err: HookError) => {
      toast.error("Error copying");
      const error = err.response?.data.message || "An error occurred";
      console.error("Copy Error:", error);
      setErrorMessage(error);
    },
  });

  return { copyto, isPending, isError, errorMessage };
}

export function useSaveLeaveDraft() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: saveLeaveDraft,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: LeaveFormData) => saveLeaveDraftApi(data),

    onSuccess: (data) => {
      if (data.status === 201) {
        toast.success("Leave draft saved successfully");
        queryClient.invalidateQueries({ queryKey: ["all-leaves"] });
        navigate(-1);
      } else {
        toast.error(data.message);
      }
    },

    onError: (err: HookError) => {
      toast.error(err.response?.data.message || "An error occurred");
      console.error("Leave draft save Error:", err.response?.data.message);
    },
  });

  return { saveLeaveDraft, isPending, isError };
}

export function useCreateLeaveApplication() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: createLeaveApplication,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({ data, files }: { data: LeaveFormData; files: File[] }) =>
      createLeaveApplicationApi(data, files),

    onSuccess: (data) => {
      if (data.status === 201) {
        toast.success("Leave application submitted successfully");
        queryClient.invalidateQueries({ queryKey: ["all-leaves"] });
        queryClient.invalidateQueries({ queryKey: ["my-leave-balance"] });
        navigate(-1);
      } else {
        toast.error(data.message);
      }
    },

    onError: (err: HookError) => {
      toast.error(err.response?.data.message || "An error occurred");
      console.error("Leave application Error:", err.response?.data.message);
    },
  });

  return { createLeaveApplication, isPending, isError };
}

export function useUpdateLeaveApplication(leaveId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: updateLeaveApplication,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({ data, files }: { data: LeaveFormData; files: File[] }) =>
      updateLeaveApplicationApi(leaveId, data, files),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Leave application updated successfully");
        queryClient.invalidateQueries({
          queryKey: ["leave", leaveId],
        });
        queryClient.invalidateQueries({ queryKey: ["my-leave-balance"] });
      } else {
        toast.error("Update not successful");
        setErrorMessage(data.message);
        console.error("Update Error:", data.message);
      }
    },

    onError: (err: HookError) => {
      toast.error("Error updating leave");
      const error = err.response?.data.message || "An error occurred";
      console.error("Update Error:", error);
      setErrorMessage(error);
    },
  });

  return { updateLeaveApplication, isPending, isError, errorMessage };
}

export function useUpdateLeaveStatus(leaveId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: updateStatus,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: { status: string; comment: string }) =>
      updateLeaveStatusApi(leaveId, data),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Status updated successfully");
        queryClient.invalidateQueries({
          queryKey: ["leave", leaveId],
        });
        queryClient.invalidateQueries({ queryKey: ["my-leave-balance"] });
      } else {
        toast.error("Status update not successful");
        setErrorMessage(data.message);
        console.error("Status Update Error:", data.message);
      }
    },

    onError: (err: HookError) => {
      toast.error("Error updating status");
      const error = err.response?.data.message || "An error occurred";
      console.error("Status Update Error:", error);
      setErrorMessage(error);
    },
  });

  return { updateStatus, isPending, isError, errorMessage };
}

export function useAddComment(leaveId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: addComment,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: { text: string }) => addCommentApi(leaveId, data),

    onSuccess: (data) => {
      if (data.status === 201) {
        toast.success("Comment added successfully");
        queryClient.invalidateQueries({
          queryKey: ["leave", leaveId],
        });
      } else {
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

export function useUpdateComment(leaveId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: updateComment,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({ commentId, text }: { commentId: string; text: string }) =>
      updateCommentApi(leaveId, commentId, { text }),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Comment updated successfully");
        queryClient.invalidateQueries({
          queryKey: ["leave", leaveId],
        });
      } else {
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

export function useDeleteComment(leaveId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: deleteComment,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (commentId: string) => deleteCommentApi(leaveId, commentId),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Comment deleted successfully");
        queryClient.invalidateQueries({
          queryKey: ["leave", leaveId],
        });
      } else {
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

export function useDeleteLeave(
  search?: string,
  sort?: string,
  page?: number,
  limit?: number
) {
  const queryClient = useQueryClient();

  const {
    mutate: deleteLeave,
    isPending: isDeleting,
    isError: isErrorDeleting,
    error: errorDeleting,
  } = useMutation<void, HookError, string>({
    mutationFn: async (leaveId: string) => {
      await deleteLeaveAPI(leaveId);
    },
    onSuccess: () => {
      toast.success("Leave application deleted");
      queryClient.invalidateQueries({
        queryKey: ["all-leaves", search, sort, page, limit],
      });
    },
    onError: (error) => {
      toast.error("Error deleting leave application");
      const errorMessage =
        error.response?.data.message ||
        "An error occurred while deleting the leave application.";
      console.error("Delete Leave Error:", errorMessage);
    },
  });

  return {
    deleteLeave,
    isDeleting,
    isErrorDeleting,
    errorDeleting,
  };
}
