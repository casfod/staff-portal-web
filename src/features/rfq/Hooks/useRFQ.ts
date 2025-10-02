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
  getRFQsStats,
  getAllRFQs,
  getRFQ,
  getRFQByCode,
  createRFQ,
  createAndSendRFQ,
  updateRFQ,
  updateRFQStatus,
  copyRFQToVendors,
  exportRFQsToExcel,
  deleteRFQ,
} from "../../../services/apiRFQ";
import {
  CreateRFQType,
  UpdateRFQType,
  UseRFQ,
  UseRFQType,
} from "../../../interfaces";

interface ErrorResponse {
  message: string;
}

interface ApiError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

// Query keys
export const rfqKeys = {
  all: ["rfqs"] as const,
  lists: () => [...rfqKeys.all, "list"] as const,
  list: (filters: any) => [...rfqKeys.lists(), filters] as const,
  details: () => [...rfqKeys.all, "detail"] as const,
  detail: (id: string) => [...rfqKeys.details(), id] as const,
  stats: () => [...rfqKeys.all, "stats"] as const,
  export: () => [...rfqKeys.all, "export"] as const,
};

// Hooks
export const useRFQsStats = (options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: rfqKeys.stats(),
    queryFn: () => getRFQsStats(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useRFQs = (
  queryParams: {
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
  },
  options?: UseQueryOptions<UseRFQType, Error>
) => {
  return useQuery({
    queryKey: rfqKeys.list(queryParams),
    queryFn: () => getAllRFQs(queryParams),
    staleTime: 2 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    ...options,
  });
};

export const useRFQ = (
  rfqId: string,
  options?: UseQueryOptions<UseRFQ, Error>
) => {
  return useQuery({
    queryKey: rfqKeys.detail(rfqId),
    queryFn: () => getRFQ(rfqId),
    enabled: !!rfqId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useRFQByCode = (
  rfqCode: string,
  options?: UseQueryOptions<UseRFQ, Error>
) => {
  return useQuery({
    queryKey: [...rfqKeys.details(), "code", rfqCode],
    queryFn: () => getRFQByCode(rfqCode),
    enabled: !!rfqCode,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateRFQ = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: createRFQMutation,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: CreateRFQType) => createRFQ(data, data.files),

    onSuccess: (data) => {
      if (data.status.toString() === "201") {
        toast.success("RFQ created successfully");
        queryClient.invalidateQueries({ queryKey: rfqKeys.lists() });
        queryClient.invalidateQueries({ queryKey: rfqKeys.stats() });
        navigate("/procurement/rfq");
      } else {
        toast.error(data.message || "Failed to create RFQ");
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message || "An error occurred while creating RFQ"
      );
    },
  });

  return { createRFQ: createRFQMutation, isPending, isError };
};

export const useCreateAndSendRFQ = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: createAndSendRFQMutation,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: CreateRFQType) => createAndSendRFQ(data, data.files),

    onSuccess: (data) => {
      if (data.status.toString() === "201") {
        toast.success("RFQ created and sent to vendors successfully");
        queryClient.invalidateQueries({ queryKey: rfqKeys.lists() });
        queryClient.invalidateQueries({ queryKey: rfqKeys.stats() });
        navigate("/procurement/rfq");
      } else {
        toast.error(data.message || "Failed to create and send RFQ");
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message || "An error occurred while sending RFQ"
      );
    },
  });

  return { createAndSendRFQ: createAndSendRFQMutation, isPending, isError };
};

export const useUpdateRFQ = () => {
  const queryClient = useQueryClient();

  const {
    mutate: updateRFQMutation,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({ rfqId, data }: { rfqId: string; data: UpdateRFQType }) =>
      updateRFQ(rfqId, data, data.files),

    onSuccess: (data, variables) => {
      if (data.status.toString() === "200") {
        toast.success("RFQ updated successfully");
        queryClient.invalidateQueries({ queryKey: rfqKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: rfqKeys.detail(variables.rfqId),
        });
        queryClient.invalidateQueries({ queryKey: rfqKeys.stats() });
      } else {
        toast.error(data.message || "Failed to update RFQ");
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message || "An error occurred while updating RFQ"
      );
    },
  });

  return { updateRFQ: updateRFQMutation, isPending, isError };
};

export const useUpdateRFQStatus = () => {
  const queryClient = useQueryClient();

  const {
    mutate: updateRFQStatusMutation,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({ rfqId, status }: { rfqId: string; status: string }) =>
      updateRFQStatus(rfqId, status),

    onSuccess: (data, variables) => {
      if (data.status.toString() === "200") {
        toast.success("RFQ status updated successfully");
        queryClient.invalidateQueries({ queryKey: rfqKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: rfqKeys.detail(variables.rfqId),
        });
      } else {
        toast.error(data.message || "Failed to update RFQ status");
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message ||
          "An error occurred while updating RFQ status"
      );
    },
  });

  return { updateRFQStatus: updateRFQStatusMutation, isPending, isError };
};

// Enhanced useCopyRFQToVendors
export const useCopyRFQToVendors = () => {
  const queryClient = useQueryClient();

  const {
    mutate: copyRFQToVendorsMutation,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({
      rfqId,
      vendorIds,
      file,
    }: {
      rfqId: string;
      vendorIds: string[];
      file: File;
    }) => copyRFQToVendors(rfqId, vendorIds, file),

    onSuccess: (data, variables) => {
      if (data.status === 200) {
        toast.success("RFQ sent to vendors successfully");
        queryClient.invalidateQueries({ queryKey: rfqKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: rfqKeys.detail(variables.rfqId),
        });
        queryClient.invalidateQueries({ queryKey: rfqKeys.stats() });
      } else {
        toast.error(data.message || "Failed to send RFQ to vendors");
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message || "An error occurred while sending RFQ"
      );
    },
  });

  return { copyRFQToVendors: copyRFQToVendorsMutation, isPending, isError };
};

export const useDeleteRFQ = () => {
  const queryClient = useQueryClient();

  const {
    mutate: deleteRFQMutation,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (rfqId: string) => deleteRFQ(rfqId),

    onSuccess: (data) => {
      if (data.status.toString() === "200") {
        toast.success("RFQ deleted successfully");
        queryClient.invalidateQueries({ queryKey: rfqKeys.lists() });
        queryClient.invalidateQueries({ queryKey: rfqKeys.stats() });
      } else {
        toast.error(data.message || "Failed to delete RFQ");
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message || "An error occurred while deleting RFQ"
      );
    },
  });

  return { deleteRFQ: deleteRFQMutation, isPending, isError };
};

export const useExportRFQsToExcel = () => {
  const {
    mutate: exportRFQsMutation,
    isPending: isExporting,
    isError: isExportError,
    isSuccess: isExportSuccess,
  } = useMutation({
    mutationFn: exportRFQsToExcel,

    onSuccess: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `rfqs_export_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("RFQs exported successfully");
    },

    onError: (err: ApiError) => {
      const errorMessage =
        err.response?.data?.message || "An error occurred while exporting RFQs";
      toast.error(errorMessage);
    },
  });

  return {
    exportRFQs: exportRFQsMutation,
    isExporting,
    isExportError,
    isExportSuccess,
  };
};
