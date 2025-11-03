// hooks/PVHook.ts - Fixed version with all missing hooks
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  PaymentVoucherType,
  UsePaymentVoucher,
  usePaymentVoucherType,
  UsePaymentVoucherStatsType,
} from "../../../interfaces.ts";
import {
  getAllPaymentVouchers,
  getPaymentVoucher,
  getPaymentVoucherStats,
  copyTo as copyToApi,
  deletePaymentVoucher as deletePaymentVoucherAPI,
  savePaymentVouchers as savePaymentVouchersApi,
  sendPaymentVouchers as sendPaymentVouchersApi,
  updatePaymentVoucher as updatePaymentVoucherApi,
  updateStatus as updateStatusApi,
  addFilesTosPaymentVoucher,
} from "../../../services/apiPaymentVoucher.ts";
import { useState } from "react";

interface ErrorResponse {
  message: string;
}

interface ApiError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

// Query keys - Following the same pattern as useGoodsReceived.ts
// Ensure query keys match the purchase request pattern
export const paymentVoucherKeys = {
  all: ["payment-vouchers"] as const,
  lists: () => [...paymentVoucherKeys.all, "list"] as const,
  list: (filters: {
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) => [...paymentVoucherKeys.lists(), filters] as const,
  details: () => [...paymentVoucherKeys.all, "detail"] as const,
  detail: (id: string) => [...paymentVoucherKeys.details(), id] as const,
  stats: () => [...paymentVoucherKeys.all, "stats"] as const,
};
// Hooks - Following the same pattern as useGoodsReceived.ts

// Replace the current useAllPaymentVouchers hook to match purchase request pattern
export const useAllPaymentVouchers = (
  search?: string,
  sort?: string,
  page?: number,
  limit?: number,
  options?: UseQueryOptions<usePaymentVoucherType, Error>
) => {
  return useQuery({
    queryKey: paymentVoucherKeys.list({ search, sort, page, limit }),
    queryFn: () => getAllPaymentVouchers({ search, sort, page, limit }),
    staleTime: 2 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    ...options,
  });
};

export const usePaymentVoucherDetail = (
  voucherId: string,
  options?: UseQueryOptions<UsePaymentVoucher, Error>
) => {
  return useQuery({
    queryKey: paymentVoucherKeys.detail(voucherId),
    queryFn: () => getPaymentVoucher(voucherId),
    enabled: !!voucherId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const usePaymentVoucherStats = (
  options?: UseQueryOptions<UsePaymentVoucherStatsType, Error>
) => {
  return useQuery({
    queryKey: paymentVoucherKeys.stats(),
    queryFn: () => getPaymentVoucherStats(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// Add proper error state handling to match purchase request hooks
export const useSavePaymentVoucher = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: Partial<PaymentVoucherType>) =>
      savePaymentVouchersApi(data),

    onSuccess: (data) => {
      if (data.status === 201) {
        toast.success("Payment Voucher saved successfully");
        queryClient.invalidateQueries({ queryKey: paymentVoucherKeys.lists() });
        setErrorMessage(null);

        navigate(-1);
      } else {
        const errorMsg = data.message || "Failed to save Payment Voucher";
        toast.error(errorMsg);
        setErrorMessage(errorMsg);
      }
    },

    onError: (err: ApiError) => {
      const errorMsg =
        err.response?.data?.message ||
        "An error occurred while saving Payment Voucher";
      toast.error(errorMsg);
      setErrorMessage(errorMsg);
    },
  });

  return {
    savePaymentVoucher: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage,
  };
};

// Add similar error handling to other mutation hooks
export const useSendPaymentVoucher = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: ({
      data,
      files,
    }: {
      data: Partial<PaymentVoucherType>;
      files: File[];
    }) => sendPaymentVouchersApi(data, files),

    onSuccess: (data) => {
      if (data.status === 201) {
        toast.success("Payment Voucher sent successfully");
        queryClient.invalidateQueries({ queryKey: paymentVoucherKeys.lists() });
        setErrorMessage(null);
        navigate(-1);
      } else {
        const errorMsg = data.message || "Failed to send Payment Voucher";
        toast.error(errorMsg);
        setErrorMessage(errorMsg);
      }
    },

    onError: (err: ApiError) => {
      const errorMsg =
        err.response?.data?.message ||
        "An error occurred while sending Payment Voucher";
      toast.error(errorMsg);
      setErrorMessage(errorMsg);
    },
  });

  return {
    sendPaymentVoucher: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage,
  };
};

export const useUpdatePaymentVoucher = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      voucherId,
      data,
      files = [],
    }: {
      voucherId: string;
      data: Partial<PaymentVoucherType>;
      files?: File[];
    }) => updatePaymentVoucherApi(voucherId, data, files),

    onSuccess: (data, variables) => {
      if (data.status === 200) {
        toast.success("Payment Voucher updated successfully");
        queryClient.invalidateQueries({ queryKey: paymentVoucherKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: paymentVoucherKeys.detail(variables.voucherId),
        });
      } else {
        toast.error(data.message || "Failed to update Payment Voucher");
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message ||
          "An error occurred while updating Payment Voucher"
      );
    },
  });

  return {
    updatePaymentVoucher: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
};

export const useUpdatePaymentVoucherStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      voucherId,
      data,
    }: {
      voucherId: string;
      data: { status: string; comment: string };
    }) => updateStatusApi(voucherId, data),

    onSuccess: (data, variables) => {
      if (data.status === 200) {
        toast.success("Status updated successfully");
        queryClient.invalidateQueries({
          queryKey: paymentVoucherKeys.detail(variables.voucherId),
        });
        queryClient.invalidateQueries({ queryKey: paymentVoucherKeys.lists() });
      } else {
        toast.error(data.message || "Failed to update status");
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message || "An error occurred while updating status"
      );
    },
  });

  return {
    updatePaymentVoucherStatus: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
};

export const useCopyPaymentVoucher = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      voucherId,
      data,
    }: {
      voucherId: string;
      data: { userIds: string[] };
    }) => copyToApi(voucherId, data),

    onSuccess: (data, variables) => {
      if (data.status === 200) {
        toast.success("Copied successfully");
        queryClient.invalidateQueries({
          queryKey: paymentVoucherKeys.detail(variables.voucherId),
        });
      } else {
        toast.error(data.message || "Copy not successful");
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message || "An error occurred while copying"
      );
    },
  });

  return {
    copyPaymentVoucher: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
};

// Update useDeletePaymentVoucher to match purchase request pattern
export const useDeletePaymentVoucher = (
  search?: string,
  sort?: string,
  page?: number,
  limit?: number
) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (voucherId: string) => deletePaymentVoucherAPI(voucherId),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Payment Voucher deleted successfully");
        queryClient.invalidateQueries({
          queryKey: paymentVoucherKeys.list({ search, sort, page, limit }),
        });
      } else {
        toast.error(data.message || "Failed to delete Payment Voucher");
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message ||
          "An error occurred while deleting Payment Voucher"
      );
    },
  });

  return {
    deletePaymentVoucher: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
};

export const useAddFilesToPaymentVoucher = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      paymentVoucherId,
      files = [],
    }: {
      paymentVoucherId: string;
      files: File[];
    }) => addFilesTosPaymentVoucher(paymentVoucherId, files),

    onSuccess: (data, variables) => {
      if (data.status === 200) {
        toast.success("Files added to Payment Voucher successfully");
        queryClient.invalidateQueries({
          queryKey: paymentVoucherKeys.detail(variables.paymentVoucherId),
        });
      } else {
        toast.error(data.message || "Failed to add files");
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message || "An error occurred while adding files"
      );
    },
  });

  return {
    addFilesToPaymentVoucher: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
};

// Legacy hooks for backward compatibility - FIXED DUPLICATES
export const usePaymentVoucher = (id: string) => {
  return usePaymentVoucherDetail(id);
};

export const useUpdateStatus = (voucherId: string) => {
  const { updatePaymentVoucherStatus, isPending, isError } =
    useUpdatePaymentVoucherStatus();

  const updateStatus = (data: { status: string; comment: string }) => {
    return updatePaymentVoucherStatus({ voucherId, data });
  };

  return {
    updateStatus,
    isPending,
    isError,
  };
};

export const useCopy = (voucherId: string) => {
  const { copyPaymentVoucher, isPending, isError } = useCopyPaymentVoucher();

  const copyto = (data: { userIds: string[] }) => {
    return copyPaymentVoucher({ voucherId, data });
  };

  return {
    copyto,
    isPending,
    isError,
  };
};

// Legacy hook for specific component usage - FIXED: Removed duplicate function
export const useUpdatePaymentVoucherLegacy = (voucherId: string) => {
  const { updatePaymentVoucher, isPending, isError } =
    useUpdatePaymentVoucher();

  const updatePaymentVoucherLegacy = ({
    data,
    files,
  }: {
    data: Partial<PaymentVoucherType>;
    files: File[];
  }) => {
    return updatePaymentVoucher({ voucherId, data, files });
  };

  return {
    updatePaymentVoucher: updatePaymentVoucherLegacy,
    isPending,
    isError,
  };
};

// NEW HOOKS - Added the missing hooks that were being imported
export const useCreatePaymentVoucher = () => {
  return useSavePaymentVoucher();
};

export const useUpdatePaymentVoucherStatusLegacy = () => {
  return useUpdatePaymentVoucherStatus();
};
