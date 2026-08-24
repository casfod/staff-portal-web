// src/services/apiReport.ts
import {
  IReport,
  IReportsListResponse,
  IReportSingleResponse,
  IReportStatsResponse,
} from '../interfaces';
import apiClient, {
  handleError,
  QueryParams,
  StatusUpdateData,
  CommentData,
  CopyToData,
} from './apiClient';

export const getAllReports = async function (queryParams: QueryParams) {
  try {
    const response = await apiClient.get<IReportsListResponse>(`hr/reports`, {
      params: queryParams,
    });
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getReport = async function (reportId: string) {
  try {
    const response = await apiClient.get<IReportSingleResponse>(`hr/reports/${reportId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getReportStats = async function () {
  try {
    const response = await apiClient.get<IReportStatsResponse>(`hr/reports/stats`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const saveReport = async function (data: Partial<IReport>) {
  try {
    const response = await apiClient.post<IReport>(`hr/reports/draft`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const sendReport = async function (data: Partial<IReport>) {
  try {
    const response = await apiClient.post<IReport>(`hr/reports`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateReport = async function (
  reportId: string,
  data: Partial<IReport>,
) {
  try {
    const response = await apiClient.patch<Partial<IReport>>(`hr/reports/${reportId}`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateReportStatus = async function (reportId: string, data: StatusUpdateData) {
  try {
    const response = await apiClient.patch<Partial<IReport>>(
      `hr/reports/${reportId}/status`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const copyReportTo = async function (reportId: string, data: CopyToData) {
  try {
    const response = await apiClient.post<Partial<IReport>>(`hr/reports/${reportId}/copy`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const addReportComment = async function (reportId: string, data: CommentData) {
  try {
    const response = await apiClient.post(`hr/reports/${reportId}/comments`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateReportComment = async function (
  reportId: string,
  commentId: string,
  data: CommentData
) {
  try {
    const response = await apiClient.patch(`hr/reports/${reportId}/comments/${commentId}`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteReportComment = async function (reportId: string, commentId: string) {
  try {
    const response = await apiClient.delete(`hr/reports/${reportId}/comments/${commentId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteReport = async function (reportId: string) {
  try {
    const response = await apiClient.delete<IReport>(`hr/reports/${reportId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};