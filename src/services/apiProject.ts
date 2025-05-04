import axios from "axios";
import Cookies from "js-cookie";
import { localStorageUser } from "../utils/localStorageUser.ts";
import { baseUrl } from "./baseUrl.ts";
import { Project, UseProjectStatsType, useProjectType } from "../interfaces.ts";

const url = baseUrl();

const axiosInstance = axios.create({
  baseURL: url,
});

const getToken = () => {
  const localStorageUserX = localStorageUser();
  return localStorageUserX
    ? Cookies.get(`token-${localStorageUserX.id}`) ||
        sessionStorage.getItem(`token-${localStorageUserX.id}`)
    : null;
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // console.log("Token attached to request:", token);
    } else {
      console.error("No token found, request not authorized");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const retryRequest = async (error: any, retries: number = 0): Promise<any> => {
  if (retries >= MAX_RETRIES) {
    return Promise.reject(error);
  }

  const delay = RETRY_DELAY * Math.pow(2, retries);
  await new Promise((resolve) => setTimeout(resolve, delay));

  return axiosInstance
    .request(error.config)
    .catch((err) => retryRequest(err, retries + 1));
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 429) {
      return retryRequest(error);
    }
    return Promise.reject(error);
  }
);

// Error Handler
const handleError = (err: any) => {
  if (axios.isAxiosError(err)) {
    return err.response?.data;
  } else {
    console.log(err);
  }
};

// API Functions

export const getProjectsStats = async function () {
  try {
    const response = await axiosInstance.get<UseProjectStatsType>(
      `/projects/stats`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getProjects = async function (queryParams: {
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const response = await axiosInstance.get<useProjectType>(`/projects`, {
      params: queryParams,
    });
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getProject = async function (projectId: string) {
  try {
    const response = await axiosInstance.get<useProjectType>(
      `/projects/${projectId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const addProject = async function (
  data: Partial<Project>,
  files: File[]
) {
  try {
    const formData = new FormData();

    formData.append("project_partners", JSON.stringify(data.project_partners));
    formData.append(
      "implementation_period",
      JSON.stringify(data.implementation_period)
    );
    formData.append("account_code", JSON.stringify(data.account_code));
    formData.append("sectors", JSON.stringify(data.sectors));

    // Append standard fields
    const simpleFields: (keyof Project)[] = [
      "project_title",
      "donor",
      "project_code",
      "project_budget",
      "project_locations",
      "target_beneficiaries",
      "project_objectives",
      "project_summary",
    ];

    simpleFields.forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, String(data[key]));
      }
    });

    // Append files
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await axiosInstance.post<useProjectType>(
      `/projects`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateProject = async function (
  projectId: string,
  data: Partial<Project>,
  files: File[]
) {
  try {
    const formData = new FormData();

    formData.append("project_partners", JSON.stringify(data.project_partners));
    formData.append(
      "implementation_period",
      JSON.stringify(data.implementation_period)
    );
    formData.append("account_code", JSON.stringify(data.account_code));
    formData.append("sectors", JSON.stringify(data.sectors));

    // Append standard fields
    const simpleFields: (keyof Project)[] = [
      "project_title",
      "donor",
      "project_code",
      "project_budget",
      "project_locations",
      "target_beneficiaries",
      "project_objectives",
      "project_summary",
    ];

    simpleFields.forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, String(data[key]));
      }
    });

    // Append files
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await axiosInstance.put<Project>(
      `/projects/${projectId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteProject = async function (projectId: string) {
  try {
    const response = await axiosInstance.delete<Project>(
      `/projects/${projectId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
