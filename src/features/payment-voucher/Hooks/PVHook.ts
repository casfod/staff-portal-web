// hooks/PVHook.ts
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
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
} from "../../../services/apiPaymentVoucher.ts";
import { AxiosError, AxiosResponse } from "axios";
import { useState } from "react";
import { copyTo as copyToApi } from "../../../services/apiPaymentVoucher.ts";
import { deletePaymentVoucher as deletePaymentVoucherAPI } from "../../../services/apiPaymentVoucher.ts";
import { savePaymentVouchers as savePaymentVouchersApi } from "../../../services/apiPaymentVoucher.ts";
import { sendPaymentVouchers as sendPaymentVouchersApi } from "../../../services/apiPaymentVoucher.ts";
import { updatePaymentVoucher as updatePaymentVoucherApi } from "../../../services/apiPaymentVoucher.ts";
import { updateStatus as updateStatusApi } from "../../../services/apiPaymentVoucher.ts";

import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface ErrorResponse {
  message: string;
}

interface LoginError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

interface FetchError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

export function useAllPaymentVouchers(
  search?: string,
  sort?: string,
  page?: number,
  limit?: number,
  options?: UseQueryOptions<usePaymentVoucherType, Error>
) {
  return useQuery<usePaymentVoucherType, Error>({
    queryKey: ["all-payment-vouchers", search, sort, page, limit],
    queryFn: () => getAllPaymentVouchers({ search, sort, page, limit }),
    staleTime: 0,
    ...options,
  });
}

export function useCopy(voucherId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: copyto,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: { userIds: string[] }) => copyToApi(voucherId, data),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Copied successfully");

        //Invalidate
        queryClient.invalidateQueries({
          queryKey: ["payment-voucher", voucherId],
        });
      } else if (data.status !== 200) {
        toast.error("Copy not successful");
        setErrorMessage(data.message);
        console.error("Error:", data.message);
      }
    },

    onError: (err: LoginError) => {
      toast.error("Error");
      const error = err.response?.data.message || "An error occurred";

      console.error("Copy Error:", error);
      setErrorMessage(error);
    },
  });

  return { copyto, isPending, isError, errorMessage };
}

export function useDeletePaymentVoucher(
  search?: string,
  sort?: string,
  page?: number,
  limit?: number
) {
  const queryClient = useQueryClient();

  const {
    mutate: deletePaymentVoucher,
    isPending: isDeleting,
    isError: isErrorDeleting,
    error: errorDeleting,
  } = useMutation<void, FetchError, string>({
    mutationFn: async (userID: string) => {
      await deletePaymentVoucherAPI(userID);
    },
    onSuccess: () => {
      toast.success("Payment Voucher deleted");

      queryClient.invalidateQueries({
        queryKey: ["all-payment-vouchers", search, sort, page, limit],
      });
    },

    onError: (error) => {
      toast.error("Error deleting Payment Voucher");

      const errorMessage =
        error.response?.data.message ||
        "An error occurred while deleting the Payment Voucher.";
      console.error("Delete Payment Voucher Error:", errorMessage);
    },
  });

  return {
    deletePaymentVoucher,
    isDeleting,
    isErrorDeleting,
    errorDeleting,
  };
}

export function usePaymentVoucher(id: string) {
  return useQuery<UsePaymentVoucher, Error>({
    queryKey: ["payment-voucher", id],
    queryFn: () => getPaymentVoucher(id),
    staleTime: 0,
  });
}

export function usePaymentVoucherStats(
  options?: UseQueryOptions<UsePaymentVoucherStatsType, Error>
) {
  return useQuery<UsePaymentVoucherStatsType, Error>({
    queryKey: ["payment-vouchers-stats"],
    queryFn: () => getPaymentVoucherStats(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useSavePaymentVoucher() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: savePaymentVoucher,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: Partial<PaymentVoucherType>) =>
      savePaymentVouchersApi(data),

    onSuccess: (data) => {
      if (data.status === 201) {
        toast.success("Payment Voucher saved successfully");
        queryClient.invalidateQueries({ queryKey: ["all-payment-vouchers"] });
        navigate(-1);
      } else {
        toast.error(data.message);
      }
    },

    onError: (err: LoginError) => {
      toast.error(err.response?.data.message || "An error occurred");
      console.error("Payment Voucher save Error:", err.response?.data.message);
    },
  });

  return { savePaymentVoucher, isPending, isError };
}

export function useSendPaymentVoucher() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: sendPaymentVoucher,
    isPending,
    isError,
  } = useMutation({
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
        queryClient.invalidateQueries({ queryKey: ["all-payment-vouchers"] });
        navigate(-1);
      } else {
        toast.error(data.message);
      }
    },

    onError: (err: LoginError) => {
      toast.error(err.response?.data.message || "An error occurred");
      console.error("Payment Voucher send Error:", err.response?.data.message);
    },
  });

  return { sendPaymentVoucher, isPending, isError };
}

export function useUpdatePaymentVoucher(voucherId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: updatePaymentVoucher,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({
      data,
      files,
    }: {
      data: Partial<PaymentVoucherType>;
      files: File[];
    }) => updatePaymentVoucherApi(voucherId, data, files),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Payment Voucher updated successfully");
        queryClient.invalidateQueries({
          queryKey: ["payment-voucher", voucherId],
        });
      } else if (data.status !== 200) {
        toast.error("Payment Voucher update not successful");
        setErrorMessage(data.message);
        console.error("Login Error:", data.message);
      }
    },

    onError: (err: LoginError) => {
      toast.error("Error updating Payment Voucher");
      const error = err.response?.data.message || "An error occurred";

      console.error("PaymentVoucher Error:", error);
      setErrorMessage(error);
    },
  });

  return { updatePaymentVoucher, isPending, isError, errorMessage };
}

export function useUpdateStatus(voucherId: string) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    mutate: updateStatus,
    isPending,
    isError,
  } = useMutation({
    mutationFn: (data: { status: string; comment: string }) =>
      updateStatusApi(voucherId, data),

    onSuccess: (data) => {
      if (data.status === 200) {
        toast.success("Status updated successfully");
        queryClient.invalidateQueries({
          queryKey: ["payment-voucher", voucherId],
        });
      } else if (data.status !== 200) {
        toast.error("Status update not successful");
        setErrorMessage(data.message);
        console.error("Login Error:", data.message);
      }
    },

    onError: (err: LoginError) => {
      toast.error("Error updating Status");
      const error = err.response?.data.message || "An error occurred";

      console.error("Status update Error:", error);
      setErrorMessage(error);
    },
  });

  return { updateStatus, isPending, isError, errorMessage };
}
