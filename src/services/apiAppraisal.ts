// src/services/apiAppraisal.ts
import axios from "axios";
import Cookies from "js-cookie";
import { localStorageUser } from "../utils/localStorageUser";
import { baseUrl } from "./baseUrl";
import { AppraisalType, UseAppraisalType, UseAppraisal } from "../interfaces";

const url = baseUrl();

const axiosInstance = axios.create({
  baseURL: url,
});

const getToken = () => {
  const currentUser = localStorageUser();
  return currentUser
    ? Cookies.get(`token-${currentUser.id}`) ||
        sessionStorage.getItem(`token-${currentUser.id}`)
    : null;
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

const handleError = (err: any) => {
  if (axios.isAxiosError(err)) {
    return err.response?.data;
  } else {
    console.log(err);
  }
};

// ========== GET STATS ==========
export const getAppraisalStats = async function () {
  try {
    const response = await axiosInstance.get(`/appraisals/stats`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ========== GET ALL ==========
export const getAllAppraisals = async function (queryParams: {
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
  status?: string;
  period?: string;
}) {
  try {
    const response = await axiosInstance.get<UseAppraisalType>(`/appraisals`, {
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
    const response = await axiosInstance.get<UseAppraisal>(
      `/appraisals/${appraisalId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ========== SAVE DRAFT ==========
export const saveAppraisalDraft = async function (
  data: Partial<AppraisalType>
) {
  try {
    const response = await axiosInstance.post<UseAppraisalType>(
      `/appraisals/save`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ========== SUBMIT ==========
export const submitAppraisal = async function (data: Partial<AppraisalType>) {
  try {
    // FIXED: Changed from /submit to /appraisals/submit (full path)
    const response = await axiosInstance.post<UseAppraisalType>(
      `/appraisals/submit`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ========== SUBMIT EXISTING ==========
export const submitExistingAppraisal = async function (
  appraisalId: string,
  submitterRole: "employee" | "supervisor"
) {
  try {
    const response = await axiosInstance.post<UseAppraisalType>(
      `/appraisals/${appraisalId}/submit`,
      { submitterRole }
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ========== UPDATE ==========
export const updateAppraisal = async function (
  appraisalId: string,
  data: Partial<AppraisalType>,
  files: File[] = []
) {
  try {
    const formData = new FormData();

    // Handle objectives as JSON
    if (data.objectives) {
      formData.append("objectives", JSON.stringify(data.objectives));
    }

    // Handle performanceAreas as JSON
    if (data.performanceAreas) {
      formData.append(
        "performanceAreas",
        JSON.stringify(data.performanceAreas)
      );
    }

    // Handle safeguarding as JSON
    if (data.safeguarding) {
      formData.append("safeguarding", JSON.stringify(data.safeguarding));
    }

    // Handle signatures as JSON
    if (data.signatures) {
      formData.append("signatures", JSON.stringify(data.signatures));
    }

    // Append simple fields
    const simpleFields: (keyof AppraisalType)[] = [
      "staffId",
      "staffName",
      "position",
      "department",
      "lengthOfTimeInPosition",
      "appraisalPeriod",
      "dateOfAppraisal",
      "supervisorId",
      "supervisorName",
      "lengthOfTimeSupervised",
      "supervisorComments",
      "overallRating",
      "futureGoals",
      "comment",
      "staffStrategy",
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

    const response = await axiosInstance.put<UseAppraisalType>(
      `/appraisals/${appraisalId}`,
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

// ========== UPDATE OBJECTIVES ==========
export const updateAppraisalObjectives = async function (
  appraisalId: string,
  objectives: any[]
) {
  try {
    const response = await axiosInstance.patch(
      `/appraisals/${appraisalId}/objectives`,
      { objectives }
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ========== SIGN APPRAISAL ==========
export const signAppraisal = async function (
  appraisalId: string,
  signatureType: "staff" | "supervisor",
  comments?: string
) {
  try {
    const response = await axiosInstance.patch(
      `/appraisals/${appraisalId}/sign`,
      { signatureType, comments }
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ========== COMMENTS ==========
export const addComment = async function (
  appraisalId: string,
  data: { text: string }
) {
  try {
    const response = await axiosInstance.post(
      `/appraisals/${appraisalId}/comments`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateComment = async function (
  appraisalId: string,
  commentId: string,
  data: { text: string }
) {
  try {
    const response = await axiosInstance.put(
      `/appraisals/${appraisalId}/comments/${commentId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteComment = async function (
  appraisalId: string,
  commentId: string
) {
  try {
    const response = await axiosInstance.delete(
      `/appraisals/${appraisalId}/comments/${commentId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// ========== DELETE ==========
export const deleteAppraisal = async function (appraisalId: string) {
  try {
    const response = await axiosInstance.delete(`/appraisals/${appraisalId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
