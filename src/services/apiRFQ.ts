// src/services/apiRFQ.ts
import {
  IRFQ,
  IRFQsListResponse,
  IRFQSingleResponse,
  IRFQStatsResponse,
  IVendor,
} from '../interfaces';
import apiClient, { handleError, QueryParams } from './apiClient';

// API Functions

export const getRFQsStats = async function (): Promise<IRFQStatsResponse> {
  try {
    const response = await apiClient.get<IRFQStatsResponse>(`procurement/rfqs/stats`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getAllRFQs = async function (queryParams: QueryParams): Promise<IRFQsListResponse> {
  try {
    const response = await apiClient.get<IRFQsListResponse>(`procurement/rfqs`, {
      params: queryParams,
    });
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getRFQ = async function (rfqId: string): Promise<IRFQSingleResponse> {
  try {
    const response = await apiClient.get<IRFQSingleResponse>(`procurement/rfqs/${rfqId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const getRFQByCode = async function (rfqCode: string): Promise<IRFQSingleResponse> {
  try {
    const response = await apiClient.get<IRFQSingleResponse>(`procurement/rfqs/code/${rfqCode}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const createRFQ = async function (data: Partial<IRFQ>): Promise<IRFQSingleResponse> {
  try {
    const response = await apiClient.post<IRFQSingleResponse>(`procurement/rfqs/draft`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const createAndSendRFQ = async function (data: Partial<IRFQ>): Promise<IRFQSingleResponse> {
  try {
    const response = await apiClient.post<IRFQSingleResponse>(`procurement/rfqs`, data);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const updateRFQ = async function (
  rfqId: string,
  data: Partial<IRFQ>,
  files: File[] = []
): Promise<IRFQSingleResponse> {
  try {
    // If there are files, use FormData; otherwise use JSON
    if (files && files.length > 0) {
      const formData = new FormData();

      const rfqFields: (keyof Partial<IRFQ>)[] = [
        'rfqTitle',
        'casfodAddressId',
        'deadlineDate',
        'rfqDate',
        'itemGroups',
        'copiedTo',
      ];

      rfqFields.forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          if (key === 'itemGroups' && Array.isArray(data[key])) {
            formData.append(key, JSON.stringify(data[key]));
          } else if (key === 'copiedTo' && Array.isArray(data[key])) {
            data[key].forEach((item: string | IVendor) => {
              const vendorId = typeof item === 'string' ? item : item.id;
              formData.append('copiedTo', vendorId);
            });
          } else {
            formData.append(key as string, String(data[key]));
          }
        }
      });

      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await apiClient.patch<IRFQSingleResponse>(
        `procurement/rfqs/${rfqId}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return response.data;
    } else {
      // No files, use JSON
      const response = await apiClient.patch<IRFQSingleResponse>(`procurement/rfqs/${rfqId}`, data);
      return response.data;
    }
  } catch (err) {
    return handleError(err);
  }
};

export const updateRFQStatus = async function (
  rfqId: string,
  status: string
): Promise<IRFQSingleResponse> {
  try {
    const response = await apiClient.patch<IRFQSingleResponse>(
      `procurement/rfqs/update-status/${rfqId}`,
      { status }
    );
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

// apiRFQ.ts
//
// FIX: previously uploaded the PDF as multipart FormData on this same call.
// The PDF is now uploaded separately, first, via useFileUpload()/apiFile.ts's
// uploadFiles() (associatedModel: 'RFQs', associatedId: rfqId) — this call
// only needs to reference the resulting file IDs, so it's a plain JSON POST.
export const copyRFQToVendors = async function (
  rfqId: string,
  recipients: string[],
  fileIds: string[] = []
): Promise<IRFQSingleResponse> {
  try {
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      throw new Error('recipients must be a non-empty array');
    }

    const response = await apiClient.post<IRFQSingleResponse>(`procurement/rfqs/${rfqId}/send`, {
      recipients,
      fileIds,
    });
    return response.data;
  } catch (err) {
    console.error('Error in copyRFQToVendors:', err);
    return handleError(err);
  }
};

export const exportRFQsToExcel = async function (): Promise<Blob> {
  try {
    const response = await apiClient.get(`procurement/rfqs/export/excel`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};

export const deleteRFQ = async function (rfqId: string): Promise<IRFQSingleResponse> {
  try {
    const response = await apiClient.delete<IRFQSingleResponse>(`procurement/rfqs/${rfqId}`);
    return response.data;
  } catch (err) {
    return handleError(err);
  }
};
