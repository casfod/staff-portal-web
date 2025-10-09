// useGoodsReceived.ts - Updated with file upload
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
// import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AxiosError, AxiosResponse } from "axios";
import {
  getAllGoodsReceived,
  getGoodsReceived,
  getGoodsReceivedByPurchaseOrder,
  createGoodsReceived,
  updateGoodsReceived,
  deleteGoodsReceived,
  checkGRNExists,
  addFilesToGoodsReceived,
} from "../../../services/apiGoodsReceived";
import {
  CreateGoodsReceivedType,
  GoodsReceivedType,
  UseGoodsReceived,
  UseGoodsReceivedType,
} from "../../../interfaces";

interface ErrorResponse {
  message: string;
}

interface ApiError extends AxiosError {
  response?: AxiosResponse<ErrorResponse>;
}

// Query keys
export const goodsReceivedKeys = {
  all: ["goods-received"] as const,
  lists: () => [...goodsReceivedKeys.all, "list"] as const,
  list: (filters: any) => [...goodsReceivedKeys.lists(), filters] as const,
  details: () => [...goodsReceivedKeys.all, "detail"] as const,
  detail: (id: string) => [...goodsReceivedKeys.details(), id] as const,
  byPurchaseOrder: (purchaseOrderId: string) =>
    [...goodsReceivedKeys.all, "purchase-order", purchaseOrderId] as const,
  exists: (purchaseOrderId: string) =>
    [...goodsReceivedKeys.all, "exists", purchaseOrderId] as const,
};

// Hooks
export const useGoodsReceived = (
  queryParams: {
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
  },
  options?: UseQueryOptions<UseGoodsReceivedType, Error>
) => {
  return useQuery({
    queryKey: goodsReceivedKeys.list(queryParams),
    queryFn: () => getAllGoodsReceived(queryParams),
    staleTime: 2 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    ...options,
  });
};

export const useGoodsReceivedByPurchaseOrder = (
  purchaseOrderId: string,
  options?: UseQueryOptions<UseGoodsReceivedType, Error>
) => {
  return useQuery({
    queryKey: goodsReceivedKeys.byPurchaseOrder(purchaseOrderId),
    queryFn: () => getGoodsReceivedByPurchaseOrder(purchaseOrderId),
    enabled: !!purchaseOrderId,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

export const useGoodsReceivedDetail = (
  goodsReceivedId: string,
  options?: UseQueryOptions<UseGoodsReceived, Error>
) => {
  return useQuery({
    queryKey: goodsReceivedKeys.detail(goodsReceivedId),
    queryFn: () => getGoodsReceived(goodsReceivedId),
    enabled: !!goodsReceivedId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCheckGRNExists = (
  purchaseOrderId: string,
  options?: UseQueryOptions<
    {
      status: number;
      message: string;
      data: { exists: boolean; grn: GoodsReceivedType; isCompleted: boolean };
    },
    Error
  >
) => {
  return useQuery({
    queryKey: goodsReceivedKeys.exists(purchaseOrderId),
    queryFn: () => checkGRNExists(purchaseOrderId),
    enabled: !!purchaseOrderId,
    staleTime: 1 * 60 * 1000,
    ...options,
  });
};

export const useCreateGoodsReceived = () => {
  const queryClient = useQueryClient();
  // const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: ({
      data,
      files = [],
    }: {
      data: CreateGoodsReceivedType;
      files?: File[];
    }) => createGoodsReceived(data, files),

    onSuccess: (data, variables) => {
      if (data.status.toString() === "201") {
        toast.success("Goods Received Note created successfully");
        queryClient.invalidateQueries({ queryKey: goodsReceivedKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: goodsReceivedKeys.byPurchaseOrder(
            variables.data.purchaseOrder
          ),
        });
        queryClient.invalidateQueries({
          queryKey: goodsReceivedKeys.exists(variables.data.purchaseOrder),
        });
      } else {
        toast.error(data.message || "Failed to create Goods Received Note");
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message ||
          "An error occurred while creating Goods Received Note"
      );
    },
  });

  return {
    createGoodsReceived: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
};

export const useUpdateGoodsReceived = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      goodsReceivedId,
      data,
      files = [],
    }: {
      goodsReceivedId: string;
      data: Partial<CreateGoodsReceivedType>;
      files?: File[];
    }) => updateGoodsReceived(goodsReceivedId, data, files),

    onSuccess: (data, variables) => {
      if (data.status.toString() === "200") {
        toast.success("Goods Received Note updated successfully");
        queryClient.invalidateQueries({ queryKey: goodsReceivedKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: goodsReceivedKeys.detail(variables.goodsReceivedId),
        });
        // Invalidate exists query if we have purchaseOrder info
        if (data.data && typeof data.data.purchaseOrder === "object") {
          queryClient.invalidateQueries({
            queryKey: goodsReceivedKeys.exists(data.data.purchaseOrder.id),
          });
        }
      } else {
        toast.error(data.message || "Failed to update Goods Received Note");
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message ||
          "An error occurred while updating Goods Received Note"
      );
    },
  });

  return {
    updateGoodsReceived: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
};

// Add this to your useGoodsReceived.ts hook
export const useAddFilesToGoodsReceived = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      goodsReceivedId,
      files = [],
    }: {
      goodsReceivedId: string;
      files: File[];
    }) => addFilesToGoodsReceived(goodsReceivedId, files),

    onSuccess: (data, variables) => {
      if (data.status.toString() === "200") {
        toast.success("Files added to Goods Received Note successfully");
        queryClient.invalidateQueries({
          queryKey: goodsReceivedKeys.detail(variables.goodsReceivedId),
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
    addFilesToGoodsReceived: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
};

// export const useAddFilesToGoodsReceived = () => {
//   const queryClient = useQueryClient();

//   const mutation = useMutation({
//     mutationFn: ({
//       goodsReceivedId,
//       files = [],
//     }: {
//       goodsReceivedId: string;
//       files: File[];
//     }) => addFilesToGoodsReceived(goodsReceivedId, files),

//     onSuccess: (data, variables) => {
//       if (data.status.toString() === "200") {
//         toast.success("Files added to Goods Received Note successfully");
//         queryClient.invalidateQueries({
//           queryKey: goodsReceivedKeys.detail(variables.goodsReceivedId),
//         });
//       } else {
//         toast.error(data.message || "Failed to add files");
//       }
//     },

//     onError: (err: ApiError) => {
//       toast.error(
//         err.response?.data?.message || "An error occurred while adding files"
//       );
//     },
//   });

//   return {
//     addFilesToGoodsReceived: mutation.mutate,
//     isPending: mutation.isPending,
//     isError: mutation.isError,
//   };
// };

export const useDeleteGoodsReceived = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (goodsReceivedId: string) =>
      deleteGoodsReceived(goodsReceivedId),

    onSuccess: (data) => {
      if (data.status.toString() === "200") {
        toast.success("Goods Received Note deleted successfully");
        queryClient.invalidateQueries({ queryKey: goodsReceivedKeys.lists() });
      } else {
        toast.error(data.message || "Failed to delete Goods Received Note");
      }
    },

    onError: (err: ApiError) => {
      toast.error(
        err.response?.data?.message ||
          "An error occurred while deleting Goods Received Note"
      );
    },
  });

  return {
    deleteGoodsReceived: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
};
