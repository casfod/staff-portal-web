// src/services/apiAppraisal.ts
import {
  IAppraisalStatsResponse,
  IAppraisalsListResponse,
  IAppraisalSingleResponse,
  IAppraisal,
} from '../interfaces';
import apiClient, { handleError, QueryParams, CommentData, CopyToData } from './apiClient';

// ========== GET STATS ==========
export const getAppraisalStats = async function () {
  try {
    const response = await apiClient.get<IAppraisalStatsResponse>(`/hr/appraisals/stats`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ========== GET ALL ==========
export const getAllAppraisals = async function (
  queryParams: QueryParams & {
    status?: string;
    period?: string;
  }
) {
  try {
    const response = await apiClient.get<IAppraisalsListResponse>(`/hr/appraisals`, {
      params: queryParams,
    });
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ========== GET BY ID ==========
export const getAppraisal = async function (appraisalId: string) {
  try {
    const response = await apiClient.get<IAppraisalSingleResponse>(`/hr/appraisals/${appraisalId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ✅ FIXED: Match backend route /hr/appraisals/draft
export const saveAppraisalDraft = async function (data: Partial<IAppraisal>) {
  try {
    const response = await apiClient.post<IAppraisalSingleResponse>(`/hr/appraisals/draft`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ✅ FIXED: Match backend route /hr/appraisals (POST creates and submits)
export const createAndSubmitAppraisal = async function (data: Partial<IAppraisal>) {
  try {
    const response = await apiClient.post<IAppraisalSingleResponse>(`/hr/appraisals`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ✅ FIXED: Match backend route /hr/appraisals/:id/submit
export const submitExistingAppraisal = async function (appraisalId: string) {
  try {
    const response = await apiClient.patch<IAppraisalSingleResponse>(
      `/hr/appraisals/${appraisalId}/submit`,
      {}
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ========== UPDATE STATUS (Approve/Reject) ==========
export const updateAppraisalStatus = async function (
  appraisalId: string,
  data: { status: 'approved' | 'rejected'; comment?: string }
) {
  try {
    const response = await apiClient.patch(`/hr/appraisals/${appraisalId}/status`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ✅ FIXED: Use PATCH instead of PUT to match backend
export const updateAppraisal = async function (
  appraisalId: string,
  data: Partial<IAppraisal>,
) {
  try {

    console.log({updateAppraisal:data})
    const response = await apiClient.patch<IAppraisalSingleResponse>(
      `/hr/appraisals/${appraisalId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ✅ FIXED: Match backend route /hr/appraisals/:id/copy
export const copyAppraisal = async function (requestId: string, data: CopyToData) {
  try {
    const response = await apiClient.post<Partial<IAppraisal>>(
      `/hr/appraisals/${requestId}/copy`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ========== UPDATE OBJECTIVES ==========
export const updateAppraisalObjectives = async function (
  appraisalId: string,
  objectives: Array<{
    objective: string;
    employeeRating?: { rating: string; achievements: string };
    supervisorRating?: string;
  }>
) {
  try {
    const response = await apiClient.patch(`/hr/appraisals/${appraisalId}/objectives`, {
      objectives,
    });
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ========== SIGN APPRAISAL ==========
export const signAppraisal = async function (
  appraisalId: string,
  signatureType: 'staff' | 'supervisor',
  comments?: string
) {
  try {
    const response = await apiClient.patch(`/hr/appraisals/${appraisalId}/sign`, {
      signatureType,
      comments,
    });
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ========== COMMENTS ==========
export const addComment = async function (appraisalId: string, data: CommentData) {
  try {
    const response = await apiClient.post(`/hr/appraisals/${appraisalId}/comments`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateComment = async function (
  appraisalId: string,
  commentId: string,
  data: CommentData
) {
  try {
    const response = await apiClient.patch(
      `/hr/appraisals/${appraisalId}/comments/${commentId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteComment = async function (appraisalId: string, commentId: string) {
  try {
    const response = await apiClient.delete(`/hr/appraisals/${appraisalId}/comments/${commentId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ========== DELETE ==========
export const deleteAppraisal = async function (appraisalId: string) {
  try {
    const response = await apiClient.delete(`/hr/appraisals/${appraisalId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};