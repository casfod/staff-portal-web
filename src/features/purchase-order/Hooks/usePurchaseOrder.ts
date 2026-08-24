// usePurchaseOrder.ts

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AxiosError, AxiosResponse } from 'axios';
import {
  getAllPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrderFromRFQ,
  createIndependentPurchaseOrder,
  updatePurchaseOrder,
  updatePurchaseOrderStatus,
  deletePurchaseOrder,
  sendPurchaseOrderToVendor, // Add this
} from '../../../services/apiPurchaseOrder';
import {
  IPurchaseOrdersListResponse,
  IPurchaseOrderSingleResponse,
  ICreatePurchaseOrderPayload,
  IItemGroup,
  IHookError,
} from '../../../interfaces';

interface ErrorResponse {
  message: string;
}

interface ApiError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

// Query keys
export const purchaseOrderKeys = {
  all: ['purchase-orders'] as const,
  lists: () => [...purchaseOrderKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...purchaseOrderKeys.lists(), filters] as const,
  details: () => [...purchaseOrderKeys.all, 'detail'] as const,
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
  options?: UseQueryOptions<IPurchaseOrdersListResponse, Error>
) => {
  return useQuery({
    queryKey: purchaseOrderKeys.list(queryParams),
    queryFn: () => getAllPurchaseOrders(queryParams),
    staleTime: 2 * 60 * 1000,
    placeholderData: previousData => previousData,
    ...options,
  });
};

export const usePurchaseOrder = (
  purchaseOrderId: string,
  options?: UseQueryOptions<IPurchaseOrderSingleResponse, Error>
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
      approvedBy,
    }: {
      rfqId: string;
      vendorId: string;
      data: {
        vat: number;
        poDate?: string;
        casfodAddressId: string;
        itemGroups: IItemGroup[];
        deliveryDate: string;
        rfqTitle?: string;
      };
      approvedBy: string;
      files?: File[];
    }) =>
      createPurchaseOrderFromRFQ(rfqId, vendorId, {
        ...data,
        approvedBy,
      }),

    onSuccess: data => {
      if (data.statusCode === 201 || data.statusCode === 200) {
        toast.success('Purchase Order created successfully from RFQ');
        queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
        navigate('/procurement/purchase-order/purchase-orders');
      } else {
        toast.error(data.message || 'Failed to create Purchase Order');
      }
    },

    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message || 'An error occurred while creating Purchase Order');
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
    mutationFn: ({ data }: { data: ICreatePurchaseOrderPayload; files?: File[] }) =>
      createIndependentPurchaseOrder(data),

    onSuccess: data => {
      if (data.statusCode === 201 || data.statusCode === 200) {
        toast.success('Purchase Order created successfully');
        queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
        navigate('/procurement/purchase-order/purchase-orders');
      } else {
        toast.error(data.message || 'Failed to create Purchase Order');
      }
    },

    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message || 'An error occurred while creating Purchase Order');
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
      purchaseOrderId: id,
      data,
      files = [],
    }: {
      purchaseOrderId: string;
      data: ICreatePurchaseOrderPayload;
      files?: File[];
    }) => updatePurchaseOrder(id, data, files),

    onSuccess: (data, variables) => {
      if (data.statusCode === 200) {
        toast.success('Purchase Order updated successfully');
        queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
        if (variables.purchaseOrderId) {
          queryClient.invalidateQueries({
            queryKey: purchaseOrderKeys.detail(variables.purchaseOrderId),
          });
        }
      } else {
        toast.error(data.message || 'Failed to update Purchase Order');
      }
    },

    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message || 'An error occurred while updating Purchase Order');
    },
  });

  return {
    updatePurchaseOrder: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
};

// FIX: pdfFile (raw File, sent as multipart) replaced with fileIds — the
// signed PO document is now uploaded first via useFileUpload()
// (associatedModel: 'PurchaseOrders', associatedId: purchaseOrderId), and
// this mutation just references the resulting file IDs.
export const useUpdatePurchaseOrderStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      purchaseOrderId,
      status,
      comment,
      fileIds,
    }: {
      purchaseOrderId: string;
      status: string;
      comment?: string;
      fileIds?: string[];
    }) => updatePurchaseOrderStatus(purchaseOrderId, status, comment, fileIds),

    onSuccess: (data, variables) => {
      if (data.statusCode === 200) {
        toast.success('Purchase Order status updated successfully');
        queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: purchaseOrderKeys.detail(variables.purchaseOrderId),
        });
      } else {
        toast.error(data.message || 'Failed to update Purchase Order status');
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message || 'An error occurred while updating Purchase Order status'
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
    mutationFn: (purchaseOrderId: string) => deletePurchaseOrder(purchaseOrderId),

    onSuccess: data => {
      if (data.status === '200') {
        toast.success('Purchase Order deleted successfully');
        queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
      } else {
        toast.error(data.message || 'Failed to delete Purchase Order');
      }
    },

    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message || 'An error occurred while deleting Purchase Order');
    },
  });

  return {
    deletePurchaseOrder: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
};

export const useSendPurchaseOrderToVendor = () => {
  const queryClient = useQueryClient();

  const {
    mutate: sendToVendor,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({
      purchaseOrderId,
      vendorId,
      fileIds,
    }: {
      purchaseOrderId: string;
      vendorId: string;
      fileIds?: string[];
    }) => sendPurchaseOrderToVendor(purchaseOrderId, vendorId, fileIds),

    onSuccess: (data, variables) => {
      if (data.statusCode === 200) {
        toast.success('Purchase Order sent to vendor successfully');
        queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: purchaseOrderKeys.detail(variables.purchaseOrderId),
        });
      } else {
        toast.error(data.message || 'Failed to send Purchase Order to vendor');
      }
    },

    onError: (err: IHookError) => {
      toast.error(err.response?.data?.message || 'An error occurred while sending Purchase Order');
    },
  });

  return { sendToVendor, isPending, isError };
};
