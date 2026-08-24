// src/services/apiGoodsReceived.ts
import {
  IGoodsReceived,
  ICreateGoodsReceivedPayload,
  IGoodsReceivedListResponse,
  IGoodsReceivedSingleResponse,
} from '../interfaces';
import apiClient, { handleError, QueryParams } from './apiClient';

// API Functions
export const getAllGoodsReceived = async function (
  queryParams: QueryParams
): Promise<IGoodsReceivedListResponse> {
  try {
    const response = await apiClient.get<IGoodsReceivedListResponse>(
      `/procurement/goods-received`,
      {
        params: queryParams,
      }
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getGoodsReceived = async function (
  goodsReceivedId: string
): Promise<IGoodsReceivedSingleResponse> {
  try {
    const response = await apiClient.get<IGoodsReceivedSingleResponse>(
      `/procurement/goods-received/${goodsReceivedId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getGoodsReceivedByPurchaseOrder = async function (
  purchaseOrderId: string
): Promise<IGoodsReceivedListResponse> {
  try {
    const response = await apiClient.get<IGoodsReceivedListResponse>(
      `/procurement/goods-received/by-po/${purchaseOrderId}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const checkGRNExists = async function (purchaseOrderId: string): Promise<{
  status: number;
  message: string;
  data: { exists: boolean; grn: IGoodsReceived; isCompleted: boolean };
}> {
  try {
    const response = await apiClient.get<{
      status: number;
      message: string;
      data: { exists: boolean; grn: IGoodsReceived; isCompleted: boolean };
    }>(`/procurement/goods-received/check/${purchaseOrderId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const createGoodsReceived = async function (
  data: ICreateGoodsReceivedPayload
): Promise<IGoodsReceivedSingleResponse> {
  try {
    const response = await apiClient.post<IGoodsReceivedSingleResponse>(
      `/procurement/goods-received`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateGoodsReceived = async function (
  goodsReceivedId: string,
  data: Partial<ICreateGoodsReceivedPayload>,
  files: File[] = []
): Promise<IGoodsReceivedSingleResponse> {
  try {
    const formData = new FormData();

    if (data.purchaseOrder) {
      formData.append('purchaseOrder', data.purchaseOrder);
    }
    if (data.grnItems) {
      formData.append('grnItems', JSON.stringify(data.grnItems));
    }

    files.forEach(file => formData.append('files', file));

    const response = await apiClient.put<IGoodsReceivedSingleResponse>(
      `/procurement/goods-received/${goodsReceivedId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const addFilesToGoodsReceived = async function (
  goodsReceivedId: string,
  files: File[] = []
): Promise<IGoodsReceivedSingleResponse> {
  try {
    const formData = new FormData();

    files.forEach(file => formData.append('files', file));

    const response = await apiClient.post<IGoodsReceivedSingleResponse>(
      `/procurement/goods-received/${goodsReceivedId}/files`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteGoodsReceived = async function (
  goodsReceivedId: string
): Promise<{ status: string; message: string }> {
  try {
    const response = await apiClient.delete<{
      status: string;
      message: string;
    }>(`/procurement/goods-received/${goodsReceivedId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
