// src/hooks/useModelConfig.ts
import { useMemo } from 'react';
import {
  MODEL_CONFIGS,
  getModelConfig,
  canManageFiles,
  getAllowedFileTypes,
  getMaxFileSizeMB,
  getBlockedStatuses,
  hasWorkflow,
} from '../config/model.config';

export function useModelConfig(modelNameOrKey: string) {
  const config = useMemo(() => getModelConfig(modelNameOrKey), [modelNameOrKey]);

  return {
    config,
    getConfig: () => config,
    canManageFiles: (status: string) => canManageFiles(modelNameOrKey, status),
    getAllowedFileTypes: () => getAllowedFileTypes(modelNameOrKey),
    getMaxFileSizeMB: () => getMaxFileSizeMB(modelNameOrKey),
    getBlockedStatuses: () => getBlockedStatuses(modelNameOrKey),
    hasWorkflow: () => hasWorkflow(modelNameOrKey),
    displayName: config?.displayName || modelNameOrKey,
    routePath: config?.routePath || '',
    modelName: config?.modelName || modelNameOrKey,
  };
}

// ─── Select all models with attachments ────────────────────────────────────
export function useAttachmentModels() {
  return useMemo(() => {
    return Object.values(MODEL_CONFIGS)
      .filter(config => config.fileAttachment.canManageFiles)
      .map(config => ({
        key:
          Object.keys(MODEL_CONFIGS).find(k => MODEL_CONFIGS[k].modelName === config.modelName) ||
          '',
        ...config,
      }));
  }, []);
}
