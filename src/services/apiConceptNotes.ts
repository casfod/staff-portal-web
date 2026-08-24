// src/services/apiConceptNotes.ts
import {
  IConceptNote,
  IConceptNotesListResponse,
  IConceptNoteSingleResponse,
  IConceptNoteStatsResponse,
} from '../interfaces';
import apiClient, {
  handleError,
  QueryParams,
  StatusUpdateData,
  CommentData,
  CopyToData,
} from './apiClient';

// API Functions

export const getConceptNotesStats = async function () {
  try {
    const response = await apiClient.get<IConceptNoteStatsResponse>(`/finance/concept-notes/stats`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getAllConceptNotes = async function (queryParams: QueryParams) {
  try {
    const response = await apiClient.get<IConceptNotesListResponse>(`/finance/concept-notes`, {
      params: queryParams,
    });
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getConceptNote = async function (requestId: string) {
  try {
    const response = await apiClient.get<IConceptNoteSingleResponse>(
      `/finance/concept-notes/${requestId}`
    );
    console.log('API Response:', response.data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const saveAndSendConceptNote = async function (data: Partial<IConceptNote>) {
  try {
    const response = await apiClient.post<IConceptNoteSingleResponse>(
      `/finance/concept-notes`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const saveConceptNote = async function (data: Partial<IConceptNote>) {
  try {
    const response = await apiClient.post<IConceptNoteSingleResponse>(
      `/finance/concept-notes/draft`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateConceptNote = async function (
  conceptNoteId: string,
  data: Partial<IConceptNote>
) {
  try {
    const response = await apiClient.patch<IConceptNoteSingleResponse>(
      `/finance/concept-notes/${conceptNoteId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const copyTo = async function (requestId: string, data: CopyToData) {
  try {
    const response = await apiClient.post<Partial<IConceptNote>>(
      `/finance/concept-notes/${requestId}/copy`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateStatus = async function (requestId: string, data: StatusUpdateData) {
  try {
    const response = await apiClient.patch<Partial<IConceptNote>>(
      `/finance/concept-notes/${requestId}/status`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const addComment = async function (requestId: string, data: CommentData) {
  try {
    const response = await apiClient.post(`/finance/concept-notes/${requestId}/comments`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateComment = async function (
  requestId: string,
  commentId: string,
  data: CommentData
) {
  try {
    const response = await apiClient.put(
      `/finance/concept-notes/${requestId}/comments/${commentId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteComment = async function (requestId: string, commentId: string) {
  try {
    const response = await apiClient.delete(
      `/finance/concept-notes/${requestId}/comments/${commentId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteConceptNote = async function (conceptNoteId: string) {
  try {
    const response = await apiClient.delete<IConceptNoteSingleResponse>(
      `/finance/concept-notes/${conceptNoteId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
