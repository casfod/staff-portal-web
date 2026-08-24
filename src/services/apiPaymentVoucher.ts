// src/services/apiPaymentVoucher.ts
import {
  IPaymentVoucher,
  IPaymentVouchersListResponse,
  IPaymentVoucherSingleResponse,
  IPaymentVoucherStatsResponse,
} from '../interfaces';
import apiClient, { handleError, QueryParams, StatusUpdateData, CopyToData } from './apiClient';

// API Functions

export const getAllPaymentVouchers = async function (queryParams: QueryParams) {
  try {
    const response = await apiClient.get<IPaymentVouchersListResponse>(
      `/finance/payment-vouchers`,
      {
        params: queryParams,
      }
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getPaymentVoucher = async function (voucherId: string) {
  try {
    const response = await apiClient.get<IPaymentVoucherSingleResponse>(
      `/finance/payment-vouchers/${voucherId}`
    );
    console.log('API Response:', response.data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getPaymentVoucherStats = async function () {
  try {
    const response = await apiClient.get<IPaymentVoucherStatsResponse>(
      `/finance/payment-vouchers/stats`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const savePaymentVouchers = async function (data: Partial<IPaymentVoucher>) {
  try {
    const response = await apiClient.post<IPaymentVoucherSingleResponse>(
      `/finance/payment-vouchers/save`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const sendPaymentVouchers = async function (data: Partial<IPaymentVoucher>) {
  try {
    const response = await apiClient.post<IPaymentVoucherSingleResponse>(
      `/finance/payment-vouchers`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const copyTo = async function (voucherId: string, data: CopyToData) {
  try {
    const response = await apiClient.post<Partial<IPaymentVoucher>>(
      `/finance/payment-vouchers/${voucherId}/copy`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updatePaymentVoucher = async function (
  voucherId: string,
  data: Partial<IPaymentVoucher>
) {
  try {
    const response = await apiClient.patch<Partial<IPaymentVoucher>>(
      `/finance/payment-vouchers/${voucherId}`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateStatus = async function (voucherId: string, data: StatusUpdateData) {
  try {
    const response = await apiClient.patch<Partial<IPaymentVoucher>>(
      `/finance/payment-vouchers/${voucherId}/status`,
      data
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deletePaymentVoucher = async function (voucherID: string) {
  try {
    const response = await apiClient.delete<IPaymentVoucher>(
      `/finance/payment-vouchers/${voucherID}`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const addFilesTosPaymentVoucher = async function (
  paymentVoucherId: string
): Promise<IPaymentVoucherSingleResponse> {
  try {
    const response = await apiClient.post<IPaymentVoucherSingleResponse>(
      `/finance/payment-vouchers/${paymentVoucherId}/files`
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
