// src/services/apiProject.ts
import {
  IProject,
  IProjectsListResponse,
  IProjectSingleResponse,
  IProjectStatsResponse,
} from '../interfaces';
import apiClient, { handleError, QueryParams } from './apiClient';

// API Functions

export const getProjectsStats = async function () {
  try {
    const response = await apiClient.get<IProjectStatsResponse>(`/admin/projects/stats`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getProjects = async function (queryParams: QueryParams) {
  try {
    const response = await apiClient.get<IProjectsListResponse>(`/admin/projects`, {
      params: queryParams,
    });

    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getProject = async function (projectId: string) {
  try {
    const response = await apiClient.get<IProjectSingleResponse>(`/admin/projects/${projectId}`);

    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// src/services/apiProject.ts

// src/services/apiProject.ts - Simplified
export const addProject = async function (data: Partial<IProject>) {
  const response = await apiClient.post('/admin/projects', data);

  return response.data;
};

// Same for updateProject function
export const updateProject = async function (projectId: string, data: Partial<IProject>) {
  try {
    const response = await apiClient.patch<IProjectSingleResponse>(
      `/admin/projects/${projectId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteProject = async function (projectId: string) {
  try {
    const response = await apiClient.delete<IProjectSingleResponse>(`/admin/projects/${projectId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
