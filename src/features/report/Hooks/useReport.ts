import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  getReport,
  getReportStats,
  getAllReports,
  saveReport as saveReportApi,
  sendReport as sendReportApi,
  updateReport as updateReportApi,
  updateReportStatus as updateReportStatusApi,
  copyReportTo as copyReportToApi,
  addReportComment as addReportCommentApi,
  updateReportComment as updateReportCommentApi,
  deleteReportComment as deleteReportCommentApi,
  deleteReport as deleteReportApi,
} from "../../../services/apiReport";
import {
  ReportType,
  UseReport,
  UseReportType,
  UseReportStatsType,
} from "../../../interfaces";
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

export function useReport(id: string) {
  return useQuery<UseReport, Error>({
    queryKey: ["report", id],
    queryFn: () => getReport(id),
    staleTime: 0,
  });
}

export function useReportStats(
  options?: UseQueryOptions<UseReportStatsType, Error>
) {
  return useQuery<UseReportStatsType, Error>({
    queryKey: ["report-stats"],
    queryFn: () => getReportStats(),
    staleTime: 0,
    ...options,
  });
}

export function useAllReports(
  search?: string,
  sort?: string,
  page?: number,
  limit?: number,
  options?: UseQueryOptions<UseReportType, Error>
) {
  return useQuery<UseReportType, Error>({
    queryKey: ["all-reports", search, sort, page, limit],
    queryFn: () => getAllReports({ search, sort, page, limit }),
    staleTime: 0,
    ...options,
  });
}

export function useCopyReport(reportId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: copyTo,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: { userIds: string[] }) =>
      copyReportToApi(reportId, data),
    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Copied successfully");
        queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      } else {
        toast.error("Copy not successful");
        setErrorMessage(data.message);
      }
    },
    onError: (err: HookError) => {
      toast.error("Error");
      const error = err.response?.data.message || "An error occurred";
      setErrorMessage(error);
    },
  });

  return { copyTo, isPending, isError, errorMessage };
}

export function useAddReportComment(reportId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: addComment,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: { text: string }) => addReportCommentApi(reportId, data),
    onSuccess: (data) => {
      if (data.status === 201) {
        toast.success("Comment added successfully");
        queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      } else {
        toast.error("Failed to add comment");
        setErrorMessage(data.message);
      }
    },
    onError: (err: HookError) => {
      toast.error("Error adding comment");
      setErrorMessage(err.response?.data.message || "An error occurred");
    },
  });

  return { addComment, isPending, isError, errorMessage };
}

export function useUpdateReportComment(reportId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: updateComment,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({ commentId, text }: { commentId: string; text: string }) =>
      updateReportCommentApi(reportId, commentId, { text }),
    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Comment updated successfully");
        queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      } else {
        toast.error("Failed to update comment");
        setErrorMessage(data.message);
      }
    },
    onError: (err: HookError) => {
      toast.error("Error updating comment");
      setErrorMessage(err.response?.data.message || "An error occurred");
    },
  });

  return { updateComment, isPending, isError, errorMessage };
}

export function useDeleteReportComment(reportId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: deleteComment,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (commentId: string) =>
      deleteReportCommentApi(reportId, commentId),
    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Comment deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      } else {
        toast.error("Failed to delete comment");
        setErrorMessage(data.message);
      }
    },
    onError: (err: HookError) => {
      toast.error("Error deleting comment");
      setErrorMessage(err.response?.data.message || "An error occurred");
    },
  });

  return { deleteComment, isPending, isError, errorMessage };
}

export function useDeleteReport(
  search?: string,
  sort?: string,
  page?: number,
  limit?: number
) {
  const queryClient = useQueryClient();

  const {
    mutate: deleteReport,
    isPending: isDeleting,
    isError: isErrorDeleting,
    error: errorDeleting,
  } = useMutation<void, HookError, string>({
    mutationFn: async (reportId: string) => {
      await deleteReportApi(reportId);
    },
    onSuccess: () => {
      toast.success("Report deleted");
      queryClient.invalidateQueries({
        queryKey: ["all-reports", search, sort, page, limit],
      });
    },
    onError: (error) => {
      toast.error("Error deleting report");
      const errorMessage =
        error.response?.data.message ||
        "An error occurred while deleting the report.";
      console.error("Delete Report Error:", errorMessage);
    },
  });

  return { deleteReport, isDeleting, isErrorDeleting, errorDeleting };
}

export function useSaveReport() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: saveReport,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: Partial<ReportType>) => saveReportApi(data),
    onSuccess: (data) => {
      if (data.status === 201) {
        toast.success("Report saved successfully");
        queryClient.invalidateQueries({ queryKey: ["all-reports"] });
        navigate(-1);
      } else {
        toast.error(data.message);
      }
    },
    onError: (err: HookError) => {
      toast.error(err.response?.data.message || "An error occurred");
      console.error("Report save error:", err.response?.data.message);
    },
  });

  return { saveReport, isPending, isError };
}

export function useSendReport() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: sendReport,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({
      data,
      files,
    }: {
      data: Partial<ReportType>;
      files: File[];
    }) => sendReportApi(data, files),
    onSuccess: (data) => {
      if (data.status === 201) {
        toast.success("Report submitted successfully");
        queryClient.invalidateQueries({ queryKey: ["all-reports"] });
        navigate(-1);
      } else {
        toast.error(data.message);
      }
    },
    onError: (err: HookError) => {
      toast.error(err.response?.data.message || "An error occurred");
      console.error("Report send error:", err.response?.data.message);
    },
  });

  return { sendReport, isPending, isError };
}

export function useUpdateReport(reportId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: updateReport,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({
      data,
      files,
    }: {
      data: Partial<ReportType>;
      files: File[];
    }) => updateReportApi(reportId, data, files),
    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Report updated successfully");
        queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      } else {
        toast.error("Report update not successful");
        setErrorMessage(data.message);
      }
    },
    onError: (err: HookError) => {
      toast.error("Error updating report");
      const error = err.response?.data.message || "An error occurred";
      setErrorMessage(error);
    },
  });

  return { updateReport, isPending, isError, errorMessage };
}

export function useUpdateReportStatus(reportId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: updateStatus,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: { status: string; comment: string }) =>
      updateReportStatusApi(reportId, data),
    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Status updated successfully");
        queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      } else {
        toast.error("Status update not successful");
        setErrorMessage(data.message);
      }
    },
    onError: (err: HookError) => {
      toast.error("Error updating status");
      const error = err.response?.data.message || "An error occurred";
      setErrorMessage(error);
    },
  });

  return { updateStatus, isPending, isError, errorMessage };
}
