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
  getVendorsStats,
  getAllVendors,
  getVendor,
  getVendorByCode,
  createVendor,
  createVendorDraft,
  updateVendor,
  updateVendorStatus,
  deleteVendor,
  exportVendorsToExcel,
  getVendorsByStatus,
  getVendorApprovalSummary,
} from "../../../services/apiVendor";
import {
  CreateVendorType,
  UpdateVendorType,
  UseVendor,
  UseVendorType,
} from "../../../interfaces";

interface ErrorResponse {
  message: string;
}

interface ApiError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

// Query keys
export const vendorKeys = {
  all: ["vendors"] as const,
  lists: () => [...vendorKeys.all, "list"] as const,
  list: (filters: any) => [...vendorKeys.lists(), filters] as const,
  details: () => [...vendorKeys.all, "detail"] as const,
  detail: (id: string) => [...vendorKeys.details(), id] as const,
  stats: () => [...vendorKeys.all, "stats"] as const,
  export: () => [...vendorKeys.all, "export"] as const,
  byStatus: (status: string, filters: any) =>
    [...vendorKeys.all, "status", status, filters] as const,
  approvalSummary: () => [...vendorKeys.all, "approval-summary"] as const,
};

// Hooks
export const useVendorsStats = (options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: vendorKeys.stats(),
    queryFn: () => getVendorsStats(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useVendors = (
  queryParams: {
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
  },
  options?: UseQueryOptions<UseVendorType, Error>
) => {
  return useQuery({
    queryKey: vendorKeys.list(queryParams),
    queryFn: () => getAllVendors(queryParams),
    staleTime: 2 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    ...options,
  });
};

export const useVendorsByStatus = (
  status: string,
  queryParams: {
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
  },
  options?: UseQueryOptions<UseVendorType, Error>
) => {
  return useQuery({
    queryKey: vendorKeys.byStatus(status, queryParams),
    queryFn: () => getVendorsByStatus(status, queryParams),
    enabled: !!status,
    staleTime: 2 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    ...options,
  });
};

export const useVendorApprovalSummary = (
  options?: UseQueryOptions<any, Error>
) => {
  return useQuery({
    queryKey: vendorKeys.approvalSummary(),
    queryFn: () => getVendorApprovalSummary(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useVendor = (
  vendorId: string,
  options?: UseQueryOptions<UseVendor, Error>
) => {
  return useQuery({
    queryKey: vendorKeys.detail(vendorId),
    queryFn: () => getVendor(vendorId),
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useVendorByCode = (
  vendorCode: string,
  options?: UseQueryOptions<UseVendor, Error>
) => {
  return useQuery({
    queryKey: [...vendorKeys.details(), "code", vendorCode],
    queryFn: () => getVendorByCode(vendorCode),
    enabled: !!vendorCode,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: createVendorMutation,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: CreateVendorType) => createVendor(data, data.files),

    onSuccess: (data) => {
      if (data.status === 201) {
        toast.success("Vendor created successfully and submitted for approval");

        queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
        queryClient.invalidateQueries({ queryKey: vendorKeys.stats() });
        queryClient.invalidateQueries({
          queryKey: vendorKeys.approvalSummary(),
        });
        navigate("/procurement/vendor-management");
      } else {
        toast.error(data.message || "Failed to create vendor");
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message || "An error occurred while creating vendor"
      );
      console.error("Vendor creation error:", err.response?.data?.message);
    },
  });

  return { createVendor: createVendorMutation, isPending, isError };
};

export const useCreateVendorDraft = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: createVendorDraftMutation,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: CreateVendorType) => createVendorDraft(data, data.files),

    onSuccess: (data) => {
      if (data.status === 201) {
        toast.success("Vendor draft saved successfully");

        queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
        queryClient.invalidateQueries({ queryKey: vendorKeys.stats() });
        queryClient.invalidateQueries({
          queryKey: vendorKeys.approvalSummary(),
        });
        navigate("/procurement/vendor-management");
      } else {
        toast.error(data.message || "Failed to save vendor draft");
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message ||
          "An error occurred while saving vendor draft"
      );
      console.error("Vendor draft error:", err.response?.data?.message);
    },
  });

  return { createVendorDraft: createVendorDraftMutation, isPending, isError };
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();

  const {
    mutate: updateVendorMutation,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({
      vendorId,
      data,
    }: {
      vendorId: string;
      data: UpdateVendorType;
    }) => updateVendor(vendorId, data, data.files),

    onSuccess: (data, variables) => {
      if (data.status === 200) {
        toast.success("Vendor updated successfully");

        queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: vendorKeys.detail(variables.vendorId),
        });
        queryClient.invalidateQueries({ queryKey: vendorKeys.stats() });
      } else {
        toast.error(data.message || "Failed to update vendor");
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message || "An error occurred while updating vendor"
      );
      console.error("Vendor update error:", err.response?.data?.message);
    },
  });

  return { updateVendor: updateVendorMutation, isPending, isError };
};

export const useUpdateVendorStatus = () => {
  const queryClient = useQueryClient();

  const {
    mutate: updateVendorStatusMutation,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({
      vendorId,
      data,
    }: {
      vendorId: string;
      data: { status: string; comment?: string };
    }) => updateVendorStatus(vendorId, data),

    onSuccess: (data, variables) => {
      if (data.status === 200) {
        toast.success(`Vendor ${variables.data.status} successfully`);

        queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: vendorKeys.detail(variables.vendorId),
        });
        queryClient.invalidateQueries({ queryKey: vendorKeys.stats() });
        queryClient.invalidateQueries({
          queryKey: vendorKeys.approvalSummary(),
        });
      } else {
        toast.error(data.message || "Failed to update vendor status");
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message ||
          "An error occurred while updating vendor status"
      );
      console.error("Vendor status update error:", err.response?.data?.message);
    },
  });

  return { updateVendorStatus: updateVendorStatusMutation, isPending, isError };
};

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();

  const {
    mutate: deleteVendorMutation,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (vendorId: string) => deleteVendor(vendorId),

    onSuccess: (data) => {
      if ((data.status as any) === 200) {
        toast.success("Vendor deleted successfully");

        queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
        queryClient.invalidateQueries({ queryKey: vendorKeys.stats() });
        queryClient.invalidateQueries({
          queryKey: vendorKeys.approvalSummary(),
        });
      } else {
        toast.error(data.message || "Failed to delete vendor");
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message || "An error occurred while deleting vendor"
      );
      console.error("Vendor deletion error:", err.response?.data?.message);
    },
  });

  return { deleteVendor: deleteVendorMutation, isPending, isError };
};

export const useExportVendorsToExcel = () => {
  const {
    mutate: exportVendorsMutation,
    isPending: isExporting,
    isError: isExportError,
    isSuccess: isExportSuccess,
  } = useMutation({
    mutationFn: exportVendorsToExcel,

    onSuccess: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `vendors_export_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Vendors exported successfully");
    },

    onError: (err: ApiError) => {
      const errorMessage =
        err.response?.data?.message ||
        "An error occurred while exporting vendors";
      toast.error(errorMessage);
      console.error("Vendor export error:", errorMessage);
    },
  });

  return {
    exportVendors: exportVendorsMutation,
    isExporting,
    isExportError,
    isExportSuccess,
  };
};
