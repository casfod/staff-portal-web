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
  updateVendor,
  deleteVendor,
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
};

// Hooks
export const useVendorsStats = (options?: UseQueryOptions<any, Error>) => {
  return useQuery({
    queryKey: vendorKeys.stats(),
    queryFn: () => getVendorsStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    staleTime: 2 * 60 * 1000, // 2 minutes
    // Use placeholderData instead of keepPreviousData for newer React Query versions
    placeholderData: (previousData) => previousData,
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
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    mutationFn: (data: CreateVendorType) => createVendor(data),

    onSuccess: (data) => {
      // Check based on your API response structure
      if (data.status.toString() === "201") {
        toast.success("Vendor created successfully");

        queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
        queryClient.invalidateQueries({ queryKey: vendorKeys.stats() });
        navigate(-1);
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
    }) => updateVendor(vendorId, data),

    onSuccess: (data, variables) => {
      // Check based on your API response structure
      if (data.status.toString() === "200") {
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

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();

  const {
    mutate: deleteVendorMutation,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (vendorId: string) => deleteVendor(vendorId),

    onSuccess: (data) => {
      // Check based on your API response structure
      if (data.status.toString() === "200") {
        toast.success("Vendor deleted successfully");

        queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
        queryClient.invalidateQueries({ queryKey: vendorKeys.stats() });
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
