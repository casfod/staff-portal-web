// src/services/apiPurchaseOrder.ts
import {
  IPurchaseOrdersListResponse,
  ICreatePurchaseOrderPayload,
  IPurchaseOrderSingleResponse,
  IItemGroup,
} from '../interfaces';
import apiClient, { CommentData, handleError, QueryParams } from './apiClient';

// API Functions

export const getAllPurchaseOrders = async function (
  queryParams: QueryParams
): Promise<IPurchaseOrdersListResponse> {
  try {
    const response = await apiClient.get<IPurchaseOrdersListResponse>(
      `/procurement/purchase-orders`,
      {
        params: queryParams,
      }
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getPurchaseOrder = async function (
  purchaseOrderId: string
): Promise<IPurchaseOrderSingleResponse> {
  try {
    const response = await apiClient.get<IPurchaseOrderSingleResponse>(
      `/procurement/purchase-orders/${purchaseOrderId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const createPurchaseOrderFromRFQ = async function (
  rfqId: string,
  vendorId: string,
  data: {
    itemGroups: IItemGroup[];
    approvedBy?: string;
    deliveryDate?: string;
    poDate?: string;
    casfodAddressId: string;
    vat: number;
    rfqTitle?: string;
  }
): Promise<IPurchaseOrderSingleResponse> {
  console.log('Creating purchase order from RFQ with data:', data);
  try {
    const response = await apiClient.post<IPurchaseOrderSingleResponse>(
      `/procurement/purchase-orders/rfq/${rfqId}/vendor/${vendorId}`,
      data
    );

    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const createIndependentPurchaseOrder = async function (
  data: ICreatePurchaseOrderPayload
): Promise<IPurchaseOrderSingleResponse> {
  console.log('Creating independent purchase order with data:', data);
  try {
    const response = await apiClient.post<IPurchaseOrderSingleResponse>(
      `/procurement/purchase-orders`,
      data
    );

    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updatePurchaseOrder = async function (
  purchaseOrderId: string,
  data: ICreatePurchaseOrderPayload,
  files: File[] = []
): Promise<IPurchaseOrderSingleResponse> {
  try {
    const formData = new FormData();

    // The backend expects these field names in FormData
    if (data.rfqTitle !== undefined) formData.append('rfqTitle', data.rfqTitle);
    if (data.vat !== undefined) formData.append('vat', data.vat.toString());
    if (data.casfodAddressId !== undefined) formData.append('casfodAddressId', data.casfodAddressId);
    if (data.selectedVendor !== undefined) {
      formData.append('selectedVendor', data.selectedVendor);
    }
    if (data.poDate !== undefined) formData.append('poDate', data.poDate);
    if (data.deliveryDate !== undefined) formData.append('deliveryDate', data.deliveryDate);

    if (data.itemGroups && Array.isArray(data.itemGroups)) {
      formData.append('itemGroups', JSON.stringify(data.itemGroups));
    }

    if (data.copiedTo && Array.isArray(data.copiedTo)) {
      data.copiedTo.forEach(vendorId => {
        formData.append('copiedTo', vendorId);
      });
    }

    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await apiClient.patch<IPurchaseOrderSingleResponse>(
      `/procurement/purchase-orders/${purchaseOrderId}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// FIX: previously sent the signed PO PDF as multipart FormData on this same
// call. The PDF is now uploaded separately, first, via useFileUpload()/
// apiFile.ts's uploadFiles() (associatedModel: 'PurchaseOrders',
// associatedId: purchaseOrderId) — this call only needs to reference the
// resulting file IDs, so it's a plain JSON PATCH instead of multipart.
export const updatePurchaseOrderStatus = async function (
  purchaseOrderId: string,
  status: string,
  comment?: string,
  fileIds: string[] = []
): Promise<IPurchaseOrderSingleResponse> {
  try {
    const response = await apiClient.patch<IPurchaseOrderSingleResponse>(
      `/procurement/purchase-orders/${purchaseOrderId}/status`,
      { status, comment, fileIds }
    );

    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const sendPurchaseOrderToVendor = async function (
  purchaseOrderId: string,
  vendorId: string,
  fileIds: string[] = []
): Promise<IPurchaseOrderSingleResponse> {
  console.log('Sending purchase order to vendor with data:', {
    purchaseOrderId,
    vendorId,
    fileIds,
  });

  try {
    if (!vendorId) {
      throw new Error('vendorId is required');
    }

    const response = await apiClient.post<IPurchaseOrderSingleResponse>(
      `/procurement/purchase-orders/${purchaseOrderId}/send-to-vendor`,
      { vendorId, fileIds }
    );
    return response.data;
  } catch (err) {
    console.error('Error in sendPurchaseOrderToVendor:', err);
    return handleError(err);
  }
};

export const deletePurchaseOrder = async function (
  purchaseOrderId: string
): Promise<{ status: string; message: string }> {
  try {
    const response = await apiClient.delete<{
      status: string;
      message: string;
    }>(`/procurement/purchase-orders/${purchaseOrderId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const addCommentApi = async function (purchaseOrderId: string, data: CommentData) {
  try {
    const response = await apiClient.post(
      `procurement/purchase-orders/${purchaseOrderId}/comments`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateCommentApi = async (purchaseOrderId: string, commentId: string, data: { text: string }) => {
  const response = await apiClient.patch(
    `/procurement/purchase-orders/${purchaseOrderId}/comments/${commentId}`,
    data
  );
  return response.data;
};

export const deleteCommentApi = async (purchaseOrderId: string, commentId: string) => {
  const response = await apiClient.delete(
    `/procurement/purchase-orders/${purchaseOrderId}/comments/${commentId}`
  );
  return response.data;
};
