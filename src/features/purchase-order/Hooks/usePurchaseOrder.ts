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

// UPDATED: Now properly handles timeline fields
export const useCreatePurchaseOrderFromRFQ = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: createPurchaseOrderFromRFQMutation,
    isPending,
    isError,
  } = useMutation({
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
        itemGroups: any[];
        deliveryPeriod: string;
        bidValidityPeriod: string;
        guaranteePeriod: string;
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
    createPurchaseOrderFromRFQ: createPurchaseOrderFromRFQMutation,
    isPending,
    isError,
  };
};

// UPDATED: Now properly handles the data structure
export const useCreateIndependentPurchaseOrder = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: createIndependentPurchaseOrderMutation,
    isPending,
    isError,
  } = useMutation({
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
    createIndependentPurchaseOrder: createIndependentPurchaseOrderMutation,
    isPending,
    isError,
  };
};

// UPDATED: Now properly handles the data structure
export const useUpdatePurchaseOrder = () => {
  const queryClient = useQueryClient();

  const {
    mutate: updatePurchaseOrderMutation,
    isPending,
    isError,
  } = useMutation({
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
    updatePurchaseOrder: updatePurchaseOrderMutation,
    isPending,
    isError,
  };
};

// UPDATED: Status update hook with PDF support
export const useUpdatePurchaseOrderStatus = () => {
  const queryClient = useQueryClient();

  const {
    mutate: updatePurchaseOrderStatusMutation,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({
      purchaseOrderId,
      status,
      comment,
      pdfFile, // NEW: Accept PDF file
    }: {
      purchaseOrderId: string;
      status: string;
      comment?: string;
      pdfFile?: File; // NEW: PDF file parameter
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
    updatePurchaseOrderStatus: updatePurchaseOrderStatusMutation,
    isPending,
    isError,
  };
};

export const useDeletePurchaseOrder = () => {
  const queryClient = useQueryClient();

  const {
    mutate: deletePurchaseOrderMutation,
    isPending,
    isError,
  } = useMutation({
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
    deletePurchaseOrder: deletePurchaseOrderMutation,
    isPending,
    isError,
  };
};
