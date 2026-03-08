// src/features/appraisal/Hooks/useAppraisal.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AxiosError, AxiosResponse } from "axios";
import {
  getAllAppraisals,
  getAppraisal,
  saveAppraisalDraft,
  createAndSubmitAppraisal,
  submitExistingAppraisal,
  updateAppraisalStatus, // FIXED: Added import
  updateAppraisal,
  updateAppraisalObjectives,
  signAppraisal,
  addComment,
  updateComment,
  deleteComment,
  deleteAppraisal,
  getAppraisalStats,
  copyTo as copyToApi,
} from "../../../services/apiAppraisal";
import {
  AppraisalType,
  UseAppraisal,
  UseAppraisalType,
} from "../../../interfaces";
import { useState } from "react";

interface ErrorResponse {
  message: string;
}

interface ApiError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

// Query keys
export const appraisalKeys = {
  all: ["appraisals"] as const,
  stats: () => [...appraisalKeys.all, "stats"] as const,
  lists: () => [...appraisalKeys.all, "list"] as const,
  list: (filters: any) => [...appraisalKeys.lists(), filters] as const,
  details: () => [...appraisalKeys.all, "detail"] as const,
  detail: (id: string) => [...appraisalKeys.details(), id] as const,
};

// ========== GET STATS ==========
export const useAppraisalStats = (options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: appraisalKeys.stats(),
    queryFn: () => getAppraisalStats(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// ========== GET ALL ==========
export const useAppraisals = (
  queryParams: {
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
    status?: string;
    period?: string;
  },
  options?: UseQueryOptions<UseAppraisalType, Error>
) => {
  return useQuery({
    queryKey: appraisalKeys.list(queryParams),
    queryFn: () => getAllAppraisals(queryParams),
    staleTime: 2 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    ...options,
  });
};

// ========== GET BY ID ==========
export const useAppraisal = (
  appraisalId: string,
  options?: UseQueryOptions<UseAppraisal, Error>
) => {
  return useQuery({
    queryKey: appraisalKeys.detail(appraisalId),
    queryFn: () => getAppraisal(appraisalId),
    enabled: !!appraisalId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// ========== SAVE DRAFT ==========
export const useSaveAppraisalDraft = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (data: Partial<AppraisalType>) => saveAppraisalDraft(data),

    onSuccess: (data) => {
      if (data?.status === 201 || data?.status === 200) {
        toast.success("Appraisal saved as draft");
        queryClient.invalidateQueries({ queryKey: appraisalKeys.lists() });
        navigate("/human-resources/appraisals");
      } else {
        toast.error(data?.message || "Failed to save draft");
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message || "An error occurred while saving draft"
      );
    },
  });

  return {
    saveAppraisalDraft: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
};

// ========== CREATE AND SUBMIT ==========
export const useCreateAndSubmitAppraisal = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (data: Partial<AppraisalType>) =>
      createAndSubmitAppraisal(data),

    onSuccess: (data) => {
      if (data?.status === 200) {
        toast.success("Appraisal created and submitted successfully");
        queryClient.invalidateQueries({ queryKey: appraisalKeys.lists() });
        navigate("/human-resources/appraisals");
      } else {
        toast.error(data?.message || "Failed to submit appraisal");
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message || "An error occurred while submitting"
      );
    },
  });

  return {
    createAndSubmitAppraisal: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
};

// ========== SUBMIT EXISTING ==========
export const useSubmitExistingAppraisal = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (appraisalId: string) => submitExistingAppraisal(appraisalId),

    onSuccess: (data) => {
      if (data?.status === 200) {
        toast.success("Appraisal submitted successfully");
        queryClient.invalidateQueries({ queryKey: appraisalKeys.lists() });
        navigate("/human-resources/appraisals");
      } else {
        toast.error(data?.message || "Failed to submit appraisal");
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message || "An error occurred while submitting"
      );
    },
  });

  return {
    submitExistingAppraisal: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
};

// ========== UPDATE STATUS (Approve/Reject) ==========
export const useUpdateAppraisalStatus = (appraisalId: string) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { status: "approved" | "rejected"; comment?: string }) =>
      updateAppraisalStatus(appraisalId, data),

    onSuccess: (data) => {
      if (data?.status === 200) {
        toast.success(`Appraisal ${data.data.status} successfully`);
        queryClient.invalidateQueries({ queryKey: appraisalKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: appraisalKeys.detail(appraisalId),
        });
      } else {
        toast.error(data?.message || "Failed to update status");
        setErrorMessage(data?.message);
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message || "An error occurred while updating status"
      );
      setErrorMessage(err.response?.data?.message || "An error occurred");
    },
  });

  return {
    updateStatus: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage,
  };
};

// ========== UPDATE ==========
export const useUpdateAppraisal = (appraisalId: string) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      data,
      files = [],
    }: {
      data: Partial<AppraisalType>;
      files?: File[];
    }) => updateAppraisal(appraisalId, data, files),

    onSuccess: (data) => {
      if (data?.status === 200) {
        toast.success("Appraisal updated successfully");
        queryClient.invalidateQueries({ queryKey: appraisalKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: appraisalKeys.detail(appraisalId),
        });
      } else {
        toast.error(data?.message || "Failed to update appraisal");
        setErrorMessage(data?.message);
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message ||
          "An error occurred while updating appraisal"
      );
      setErrorMessage(err.response?.data?.message || "An error occurred");
    },
  });

  return {
    updateAppraisal: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage,
  };
};

// ========== UPDATE OBJECTIVES ==========
export const useUpdateAppraisalObjectives = (appraisalId: string) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (objectives: any[]) =>
      updateAppraisalObjectives(appraisalId, objectives),

    onSuccess: (data) => {
      if (data?.status === 200) {
        toast.success("Objectives updated successfully");
        queryClient.invalidateQueries({
          queryKey: appraisalKeys.detail(appraisalId),
        });
      } else {
        toast.error(data?.message || "Failed to update objectives");
        setErrorMessage(data?.message);
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message ||
          "An error occurred while updating objectives"
      );
      setErrorMessage(err.response?.data?.message || "An error occurred");
    },
  });

  return {
    updateObjectives: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage,
  };
};

// ========== SIGN ==========
export const useSignAppraisal = (appraisalId: string) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      signatureType,
      comments,
    }: {
      signatureType: "staff" | "supervisor";
      comments?: string;
    }) => signAppraisal(appraisalId, signatureType, comments),

    onSuccess: (data) => {
      if (data?.status === 200) {
        toast.success("Appraisal signed successfully");
        queryClient.invalidateQueries({
          queryKey: appraisalKeys.detail(appraisalId),
        });
        queryClient.invalidateQueries({ queryKey: appraisalKeys.lists() });
      } else {
        toast.error(data?.message || "Failed to sign appraisal");
        setErrorMessage(data?.message);
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message || "An error occurred while signing"
      );
      setErrorMessage(err.response?.data?.message || "An error occurred");
    },
  });

  return {
    signAppraisal: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage,
  };
};

export function useCopy(requestId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: copyto,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: { userIds: string[] }) => copyToApi(requestId, data),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Copied successfully");

        //Invalidate
        queryClient.invalidateQueries({
          queryKey: ["advance-request", requestId],
        });
      } else if (data.status !== 200) {
        toast.error("Copy not successful");
        setErrorMessage(data.message);
        console.error("Error:", data.message); // Log error directly here
      }
    },

    onError: (err: ApiError) => {
      toast.error("Error");
      const error = err.response?.data.message || "An error occurred";

      console.error("Copy Error:", error);
      setErrorMessage(error); // Set the error message to display
    },
  });

  return { copyto, isPending, isError, errorMessage };
}

// ========== COMMENTS ==========
export const useAddComment = (appraisalId: string) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { text: string }) => addComment(appraisalId, data),

    onSuccess: (data) => {
      if (data?.status === 201) {
        toast.success("Comment added successfully");
        queryClient.invalidateQueries({
          queryKey: appraisalKeys.detail(appraisalId),
        });
      } else {
        toast.error("Failed to add comment");
        setErrorMessage(data?.message);
      }
    },

    onError: (err: ApiError) => {
      toast.error("Error adding comment");
      const error = err.response?.data?.message || "An error occurred";
      setErrorMessage(error);
    },
  });

  return {
    addComment: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage,
  };
};

export const useUpdateComment = (appraisalId: string) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ commentId, text }: { commentId: string; text: string }) =>
      updateComment(appraisalId, commentId, { text }),

    onSuccess: (data) => {
      if (data?.status === 200) {
        toast.success("Comment updated successfully");
        queryClient.invalidateQueries({
          queryKey: appraisalKeys.detail(appraisalId),
        });
      } else {
        toast.error("Failed to update comment");
        setErrorMessage(data?.message);
      }
    },

    onError: (err: ApiError) => {
      toast.error("Error updating comment");
      const error = err.response?.data?.message || "An error occurred";
      setErrorMessage(error);
    },
  });

  return {
    updateComment: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage,
  };
};

export const useDeleteComment = (appraisalId: string) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(appraisalId, commentId),

    onSuccess: (data) => {
      if (data?.status === 200) {
        toast.success("Comment deleted successfully");
        queryClient.invalidateQueries({
          queryKey: appraisalKeys.detail(appraisalId),
        });
      } else {
        toast.error("Failed to delete comment");
        setErrorMessage(data?.message);
      }
    },

    onError: (err: ApiError) => {
      toast.error("Error deleting comment");
      const error = err.response?.data?.message || "An error occurred";
      setErrorMessage(error);
    },
  });

  return {
    deleteComment: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage,
  };
};

// ========== DELETE ==========
export const useDeleteAppraisal = (
  search?: string,
  sort?: string,
  page?: number,
  limit?: number
) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, ApiError, string>({
    mutationFn: async (appraisalId: string) => {
      await deleteAppraisal(appraisalId);
    },
    onSuccess: () => {
      toast.success("Appraisal deleted successfully");
      queryClient.invalidateQueries({
        queryKey: appraisalKeys.list({ search, sort, page, limit }),
      });
    },
    onError: (error) => {
      toast.error("Error deleting appraisal");
      const errorMessage =
        error.response?.data?.message ||
        "An error occurred while deleting the appraisal.";
      console.error("Delete Appraisal Error:", errorMessage);
    },
  });

  return {
    deleteAppraisal: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};
