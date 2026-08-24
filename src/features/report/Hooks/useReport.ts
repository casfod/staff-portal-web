// features/report/Hooks/useReport.ts
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
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
} from '../../../services/apiReport';
import {
  IHookError,
  IReport,
  IReportSingleResponse,
  IReportsListResponse,
  IReportStatsResponse,
} from '../../../interfaces';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { QueryParams } from '@/services/apiClient';

// ─── QUERIES ──────────────────────────────────────────────────────────────────

/**
 * Get a single report by ID
 */
export function useReport(id: string) {
  return useQuery<IReportSingleResponse, Error>({
    queryKey: ['report', id],
    queryFn: () => getReport(id),
    staleTime: 0,
    enabled: !!id, // Only run if ID exists
  });
}

/**
 * Get report statistics
 */
export function useReportStats(options?: UseQueryOptions<IReportStatsResponse, Error>) {
  return useQuery<IReportStatsResponse, Error>({
    queryKey: ['report-stats'],
    queryFn: () => getReportStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Get all reports with pagination and filtering
 * ✅ Updated to accept queryParams object like AdvanceRequest
 */
export function useAllReports(
  queryParams: QueryParams,
  options?: UseQueryOptions<IReportsListResponse, Error>
) {
  return useQuery<IReportsListResponse, Error>({
    queryKey: ['all-reports', queryParams],
    queryFn: () => getAllReports(queryParams),
    staleTime: 0,
    ...options,
  });
}

// ─── MUTATIONS ────────────────────────────────────────────────────────────────

/**
 * Copy report to recipients
 */
export function useCopyReport(reportId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: copyTo,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: { recipients: string[] }) => copyReportToApi(reportId, data),
    onSuccess: data => {
      if (data.statusCode === 200) {
        toast.success('Copied successfully');
        queryClient.invalidateQueries({ queryKey: ['report', reportId] });
        queryClient.invalidateQueries({ queryKey: ['all-reports'] });
      } else {
        toast.error('Copy not successful');
        setErrorMessage(data.message);
      }
    },
    onError: (err: IHookError) => {
      toast.error('Error copying report');
      const error = err.response?.data.message || 'An error occurred';
      setErrorMessage(error);
    },
  });

  return { copyTo, isPending, isError, errorMessage };
}

// ─── COMMENTS ─────────────────────────────────────────────────────────────────

/**
 * Add a comment to a report
 */
export function useAddReportComment(reportId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: addComment,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: { text: string }) => addReportCommentApi(reportId, data),
    onSuccess: data => {
      if (data.statusCode === 201) {
        toast.success('Comment added successfully');
        queryClient.invalidateQueries({ queryKey: ['report', reportId] });
      } else {
        toast.error('Failed to add comment');
        setErrorMessage(data.message);
      }
    },
    onError: (err: IHookError) => {
      toast.error('Error adding comment');
      setErrorMessage(err.response?.data.message || 'An error occurred');
    },
  });

  return { addComment, isPending, isError, errorMessage };
}

/**
 * Update a comment on a report
 */
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
    onSuccess: data => {
      if (data.statusCode === 200) {
        toast.success('Comment updated successfully');
        queryClient.invalidateQueries({ queryKey: ['report', reportId] });
      } else {
        toast.error('Failed to update comment');
        setErrorMessage(data.message);
      }
    },
    onError: (err: IHookError) => {
      toast.error('Error updating comment');
      setErrorMessage(err.response?.data.message || 'An error occurred');
    },
  });

  return { updateComment, isPending, isError, errorMessage };
}

/**
 * Delete a comment from a report
 */
export function useDeleteReportComment(reportId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: deleteComment,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (commentId: string) => deleteReportCommentApi(reportId, commentId),
    onSuccess: data => {
      if (data.statusCode === 200) {
        toast.success('Comment deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['report', reportId] });
      } else {
        toast.error('Failed to delete comment');
        setErrorMessage(data.message);
      }
    },
    onError: (err: IHookError) => {
      toast.error('Error deleting comment');
      setErrorMessage(err.response?.data.message || 'An error occurred');
    },
  });

  return { deleteComment, isPending, isError, errorMessage };
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

/**
 * Delete a report
 * ✅ Updated to accept queryParams for cache invalidation
 */
export function useDeleteReport(queryParams?: QueryParams) {
  const queryClient = useQueryClient();

  const {
    mutate: deleteReport,
    isPending: isDeleting,
    isError: isErrorDeleting,
    error: errorDeleting,
  } = useMutation<void, IHookError, string>({
    mutationFn: async (reportId: string) => {
      await deleteReportApi(reportId);
    },
    onSuccess: () => {
      toast.success('Report deleted');
      // Invalidate both the list and any individual report queries
      queryClient.invalidateQueries({
        queryKey: ['all-reports', queryParams],
      });
      queryClient.invalidateQueries({
        queryKey: ['report-stats'],
      });
    },
    onError: error => {
      toast.error('Error deleting report');
      const errorMessage =
        error.response?.data.message || 'An error occurred while deleting the report.';
      console.error('Delete Report Error:', errorMessage);
    },
  });

  return { deleteReport, isDeleting, isErrorDeleting, errorDeleting };
}

// ─── SAVE / CREATE ────────────────────────────────────────────────────────────

/**
 * Save a report as draft
 * ✅ Returns the created report data
 */
export function useSaveReport() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: saveReport,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: (data: Partial<IReport>) => saveReportApi(data),
    onSuccess: (data) => {
      if (data.statusCode === 201) {
        toast.success('Report saved successfully');
        queryClient.invalidateQueries({ queryKey: ['all-reports'] });
        queryClient.invalidateQueries({ queryKey: ['report-stats'] });
        navigate(-1);
      } else {
        toast.error(data.message || 'Failed to save report');
      }
    },
    onError: (err: IHookError) => {
      const message = err.response?.data.message || 'An error occurred while saving';
      toast.error(message);
      console.error('Report save error:', message);
    },
  });

  return { saveReport, isPending, isError, error };
}

/**
 * Submit a report for review
 * ✅ Returns the created report data
 */
export function useSendReport() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: sendReport,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: (data: Partial<IReport>) => sendReportApi(data),
    onSuccess: (data) => {
      if (data.statusCode === 201) {
        toast.success('Report submitted successfully');
        queryClient.invalidateQueries({ queryKey: ['all-reports'] });
        queryClient.invalidateQueries({ queryKey: ['report-stats'] });
        navigate(-1);
      } else {
        toast.error(data.message || 'Failed to submit report');
      }
    },
    onError: (err: IHookError) => {
      const message = err.response?.data.message || 'An error occurred while submitting';
      toast.error(message);
      console.error('Report submit error:', message);
    },
  });

  return { sendReport, isPending, isError, error };
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

/**
 * Update a report
 * ✅ Returns the updated report data
 */
export function useUpdateReport(reportId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: updateReport,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ( data: Partial<IReport> ) => updateReportApi(reportId, data),
    onSuccess: (data) => {
      if (data.statusCode === 200) {
        toast.success('Report updated successfully');
        queryClient.invalidateQueries({ queryKey: ['report', reportId] });
        queryClient.invalidateQueries({ queryKey: ['all-reports'] });
      } else {
        toast.error('Report update not successful');
        setErrorMessage(data.message);
      }
    },
    onError: (err: IHookError) => {
      toast.error('Error updating report');
      const error = err.response?.data.message || 'An error occurred';
      setErrorMessage(error);
    },
  });

  return { updateReport, isPending, isError, errorMessage };
}

/**
 * Update report status (approve/reject)
 * ✅ Returns the updated report data
 */
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
      if (data.statusCode === 200) {
        toast.success('Status updated successfully');
        queryClient.invalidateQueries({ queryKey: ['report', reportId] });
        queryClient.invalidateQueries({ queryKey: ['all-reports'] });
        queryClient.invalidateQueries({ queryKey: ['report-stats'] });
      } else {
        toast.error('Status update not successful');
        setErrorMessage(data.message);
      }
    },
    onError: (err: IHookError) => {
      toast.error('Error updating status');
      const error = err.response?.data.message || 'An error occurred';
      setErrorMessage(error);
    },
  });

  return { updateStatus, isPending, isError, errorMessage };
}

// ─── EXPORT ALL ───────────────────────────────────────────────────────────────

export default {
  useReport,
  useReportStats,
  useAllReports,
  useCopyReport,
  useAddReportComment,
  useUpdateReportComment,
  useDeleteReportComment,
  useDeleteReport,
  useSaveReport,
  useSendReport,
  useUpdateReport,
  useUpdateReportStatus,
};