// usePurchaseOrder.ts
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
  getAllPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrderFromRFQ,
  createIndependentPurchaseOrder,
  updatePurchaseOrder,
  updatePurchaseOrderStatus,
  deletePurchaseOrder,
} from "../../../services/apiPurchaseOrder";
import {
  CreatePurchaseOrderType,
  UpdatePurchaseOrderType,
  UsePurchaseOrder,
  UsePurchaseOrderType,
} from "../../../interfaces";

interface ErrorResponse {
  message: string;
}

interface ApiError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

// Query keys
export const purchaseOrderKeys = {
  all: ["purchase-orders"] as const,
  lists: () => [...purchaseOrderKeys.all, "list"] as const,
  list: (filters: any) => [...purchaseOrderKeys.lists(), filters] as const,
  details: () => [...purchaseOrderKeys.all, "detail"] as const,
  detail: (id: string) => [...purchaseOrderKeys.details(), id] as const,
};

// Hooks
export const usePurchaseOrders = (
  queryParams: {
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
  },
  options?: UseQueryOptions<UsePurchaseOrderType, Error>
) => {
  return useQuery({
    queryKey: purchaseOrderKeys.list(queryParams),
    queryFn: () => getAllPurchaseOrders(queryParams),
    staleTime: 2 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    ...options,
  });
};

export const usePurchaseOrder = (
  purchaseOrderId: string,
  options?: UseQueryOptions<UsePurchaseOrder, Error>
) => {
  return useQuery({
    queryKey: purchaseOrderKeys.detail(purchaseOrderId),
    queryFn: () => getPurchaseOrder(purchaseOrderId),
    enabled: !!purchaseOrderId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreatePurchaseOrderFromRFQ = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: ({
      rfqId,
      vendorId,
      data,
      files = [],
      approvedBy,
    }: {
      rfqId: string;
      vendorId: string;
      data: {
        VAT: number;
        poDate?: string;
        casfodAddressId: string;
        itemGroups: any[];
        deliveryDate: string;
      };
      approvedBy: string;
      files?: File[];
    }) =>
      createPurchaseOrderFromRFQ(
        rfqId,
        vendorId,
        {
          ...data,
          approvedBy,
        },
        files
      ),

    onSuccess: (data) => {
      if (data.status.toString() === "201") {
        toast.success("Purchase Order created successfully from RFQ");
        queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
        navigate("/procurement/purchase-order/purchase-orders");
      } else {
        toast.error(data.message || "Failed to create Purchase Order");
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message ||
          "An error occurred while creating Purchase Order"
      );
    },
  });

  return {
    createPurchaseOrderFromRFQ: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
};

export const useCreateIndependentPurchaseOrder = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: ({
      data,
      files = [],
    }: {
      data: CreatePurchaseOrderType;
      files?: File[];
    }) => createIndependentPurchaseOrder(data, files),

    onSuccess: (data) => {
      if (data.status.toString() === "201") {
        toast.success("Purchase Order created successfully");
        queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
        navigate("/procurement/purchase-order/purchase-orders");
      } else {
        toast.error(data.message || "Failed to create Purchase Order");
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message ||
          "An error occurred while creating Purchase Order"
      );
    },
  });

  return {
    createIndependentPurchaseOrder: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
};

export const useUpdatePurchaseOrder = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      purchaseOrderId,
      data,
      files = [],
    }: {
      purchaseOrderId: string;
      data: UpdatePurchaseOrderType;
      files?: File[];
    }) => updatePurchaseOrder(purchaseOrderId, data, files),

    onSuccess: (data, variables) => {
      if (data.status.toString() === "200") {
        toast.success("Purchase Order updated successfully");
        queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: purchaseOrderKeys.detail(variables.purchaseOrderId),
        });
      } else {
        toast.error(data.message || "Failed to update Purchase Order");
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message ||
          "An error occurred while updating Purchase Order"
      );
    },
  });

  return {
    updatePurchaseOrder: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
};

export const useUpdatePurchaseOrderStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      purchaseOrderId,
      status,
      comment,
      pdfFile,
    }: {
      purchaseOrderId: string;
      status: string;
      comment?: string;
      pdfFile?: File;
    }) => updatePurchaseOrderStatus(purchaseOrderId, status, comment, pdfFile),

    onSuccess: (data, variables) => {
      if (data.status.toString() === "200") {
        toast.success("Purchase Order status updated successfully");
        queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: purchaseOrderKeys.detail(variables.purchaseOrderId),
        });
      } else {
        toast.error(data.message || "Failed to update Purchase Order status");
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message ||
          "An error occurred while updating Purchase Order status"
      );
    },
  });

  return {
    updatePurchaseOrderStatus: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
};

export const useDeletePurchaseOrder = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (purchaseOrderId: string) =>
      deletePurchaseOrder(purchaseOrderId),

    onSuccess: (data) => {
      if (data.status.toString() === "200") {
        toast.success("Purchase Order deleted successfully");
        queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
      } else {
        toast.error(data.message || "Failed to delete Purchase Order");
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message ||
          "An error occurred while deleting Purchase Order"
      );
    },
  });

  return {
    deletePurchaseOrder: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
};
