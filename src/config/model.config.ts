// src/config/model.config.ts

// ─── Status Definitions ─────────────────────────────────────────────────────
export type WorkflowStatus = 'draft' | 'pending' | 'reviewed' | 'approved' | 'rejected';
export type ProjectStatus = 'ongoing' | 'completed' | 'cancelled';
export type ReviewDecision = 'pending' | 'approved' | 'rejected';
export type RFQStatus = 'preview' | 'draft' | 'sent' | 'cancelled';
export type PaymentVoucherStatus =
  'draft' | 'pending' | 'reviewed' | 'approved' | 'rejected' | 'paid';
export type StrategyStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type AppraisalStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type LeaveStatus = 'draft' | 'pending' | 'reviewed' | 'approved' | 'rejected';
export type ReportStatus = 'draft' | 'pending' | 'reviewed' | 'approved' | 'rejected';
export type POStatus = 'pending' | 'approved' | 'rejected';
export type GRNStatus = 'pending' | 'completed';

// ─── Model Configuration Interface ─────────────────────────────────────────
export interface ModelConfig {
  // The model name (used in DB queries, API endpoints)
  modelName: string;

  // The display name (used in UI)
  displayName: string;

  // Frontend route path
  routePath: string;

  // File attachment settings
  fileAttachment: {
    // Can files be managed (uploaded/deleted)
    canManageFiles: boolean;

    // Statuses where file management is blocked
    blockedStatuses?: string[];

    // Statuses where file management is always allowed (override)
    alwaysAllowStatuses?: string[];

    // Allowed file types
    allowedFileTypes?: string[];

    // Max file size in MB
    maxFileSizeMB?: number;
  };

  // Workflow settings
  workflow: {
    // Does this model use workflow (review/approval process)
    hasWorkflow: boolean;

    // Available statuses
    statuses: string[];

    // Default status
    defaultStatus: string;

    // Status flow (next statuses from current)
    statusFlow?: Record<string, string[]>;
  };

  // API endpoints
  api: {
    // Base path
    basePath: string;

    // Upload endpoint (if different from base)
    uploadPath?: string;
  };
}

// ─── Blocked Statuses (shared) ─────────────────────────────────────────────
const WORKFLOW_BLOCKED_STATUSES = ['reviewed', 'approved', 'rejected'];

// ─── Model Configurations ──────────────────────────────────────────────────
export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  // ── Advance Request ──────────────────────────────────────────────────────
  advanceRequest: {
    modelName: 'AdvanceRequest',
    displayName: 'Advance Request',
    routePath: '/procurement/advance-requests',
    fileAttachment: {
      canManageFiles: true,
      blockedStatuses: WORKFLOW_BLOCKED_STATUSES,
      allowedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
      maxFileSizeMB: 10,
    },
    workflow: {
      hasWorkflow: true,
      statuses: ['draft', 'pending', 'reviewed', 'approved', 'rejected'],
      defaultStatus: 'draft',
      statusFlow: {
        draft: ['pending'],
        pending: ['reviewed', 'rejected'],
        reviewed: ['approved', 'rejected'],
        approved: [],
        rejected: [],
      },
    },
    api: {
      basePath: '/advance-requests',
    },
  },

  // ── Appraisal ─────────────────────────────────────────────────────────────
  appraisal: {
    modelName: 'Appraisal',
    displayName: 'Appraisal',
    routePath: '/hr/appraisals',
    fileAttachment: {
      canManageFiles: true,
      blockedStatuses: ['approved', 'rejected'],
      allowedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'],
      maxFileSizeMB: 10,
    },
    workflow: {
      hasWorkflow: true,
      statuses: ['draft', 'pending', 'approved', 'rejected'],
      defaultStatus: 'draft',
      statusFlow: {
        draft: ['pending'],
        pending: ['approved', 'rejected'],
        approved: [],
        rejected: [],
      },
    },
    api: {
      basePath: '/appraisals',
    },
  },

  // ── Concept Note ─────────────────────────────────────────────────────────
  conceptNote: {
    modelName: 'ConceptNote',
    displayName: 'Concept Note',
    routePath: '/procurement/concept-notes',
    fileAttachment: {
      canManageFiles: true,
      blockedStatuses: WORKFLOW_BLOCKED_STATUSES,
      allowedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
      maxFileSizeMB: 10,
    },
    workflow: {
      hasWorkflow: true,
      statuses: ['draft', 'pending', 'reviewed', 'approved', 'rejected'],
      defaultStatus: 'draft',
      statusFlow: {
        draft: ['pending'],
        pending: ['reviewed', 'rejected'],
        reviewed: ['approved', 'rejected'],
        approved: [],
        rejected: [],
      },
    },
    api: {
      basePath: '/concept-notes',
    },
  },

  // ── Expense Claim ────────────────────────────────────────────────────────
  expenseClaim: {
    modelName: 'ExpenseClaims',
    displayName: 'Expense Claim',
    routePath: '/finance/expense-claims',
    fileAttachment: {
      canManageFiles: true,
      blockedStatuses: WORKFLOW_BLOCKED_STATUSES,
      allowedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
      maxFileSizeMB: 10,
    },
    workflow: {
      hasWorkflow: true,
      statuses: ['draft', 'pending', 'reviewed', 'approved', 'rejected'],
      defaultStatus: 'draft',
      statusFlow: {
        draft: ['pending'],
        pending: ['reviewed', 'rejected'],
        reviewed: ['approved', 'rejected'],
        approved: [],
        rejected: [],
      },
    },
    api: {
      basePath: '/expense-claims',
    },
  },

  // ── Goods Received ──────────────────────────────────────────────────────
  goodsReceived: {
    modelName: 'GoodsReceived',
    displayName: 'Goods Received',
    routePath: '/procurement/goods-received',
    fileAttachment: {
      canManageFiles: true,
      blockedStatuses: ['completed'],
      allowedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf'],
      maxFileSizeMB: 10,
    },
    workflow: {
      hasWorkflow: false,
      statuses: ['pending', 'completed'],
      defaultStatus: 'pending',
    },
    api: {
      basePath: '/goods-received',
    },
  },

  // ── Leave ─────────────────────────────────────────────────────────────────
  leave: {
    modelName: 'Leave',
    displayName: 'Leave Request',
    routePath: '/hr/leaves',
    fileAttachment: {
      canManageFiles: true,
      blockedStatuses: ['reviewed', 'approved', 'rejected'],
      allowedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf'],
      maxFileSizeMB: 5,
    },
    workflow: {
      hasWorkflow: true,
      statuses: ['draft', 'pending', 'reviewed', 'approved', 'rejected'],
      defaultStatus: 'draft',
      statusFlow: {
        draft: ['pending'],
        pending: ['reviewed', 'rejected'],
        reviewed: ['approved', 'rejected'],
        approved: [],
        rejected: [],
      },
    },
    api: {
      basePath: '/leaves',
    },
  },

  // ── Leave Balance ────────────────────────────────────────────────────────
  leaveBalance: {
    modelName: 'LeaveBalance',
    displayName: 'Leave Balance',
    routePath: '/hr/leave-balances',
    fileAttachment: {
      canManageFiles: false, // Leave balances don't have file attachments
      blockedStatuses: [],
      allowedFileTypes: [],
      maxFileSizeMB: 0,
    },
    workflow: {
      hasWorkflow: false,
      statuses: [],
      defaultStatus: '',
    },
    api: {
      basePath: '/leave-balances',
    },
  },

  // ── Payment Request ──────────────────────────────────────────────────────
  paymentRequest: {
    modelName: 'PaymentRequest',
    displayName: 'Payment Request',
    routePath: '/finance/payment-requests',
    fileAttachment: {
      canManageFiles: true,
      blockedStatuses: WORKFLOW_BLOCKED_STATUSES,
      allowedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
      maxFileSizeMB: 10,
    },
    workflow: {
      hasWorkflow: true,
      statuses: ['draft', 'pending', 'reviewed', 'approved', 'rejected'],
      defaultStatus: 'draft',
      statusFlow: {
        draft: ['pending'],
        pending: ['reviewed', 'rejected'],
        reviewed: ['approved', 'rejected'],
        approved: [],
        rejected: [],
      },
    },
    api: {
      basePath: '/payment-requests',
    },
  },

  // ── Payment Voucher ─────────────────────────────────────────────────────
  paymentVoucher: {
    modelName: 'PaymentVoucher',
    displayName: 'Payment Voucher',
    routePath: '/finance/payment-vouchers',
    fileAttachment: {
      canManageFiles: true,
      blockedStatuses: ['reviewed', 'approved', 'rejected', 'paid'],
      allowedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf'],
      maxFileSizeMB: 10,
    },
    workflow: {
      hasWorkflow: true,
      statuses: ['draft', 'pending', 'reviewed', 'approved', 'rejected', 'paid'],
      defaultStatus: 'draft',
      statusFlow: {
        draft: ['pending'],
        pending: ['reviewed', 'rejected'],
        reviewed: ['approved', 'rejected'],
        approved: ['paid'],
        rejected: [],
        paid: [],
      },
    },
    api: {
      basePath: '/payment-vouchers',
    },
  },

  // ── Project ──────────────────────────────────────────────────────────────
  project: {
    modelName: 'Project',
    displayName: 'Project',
    routePath: '/admin/projects',
    fileAttachment: {
      canManageFiles: true,
      blockedStatuses: [],
      alwaysAllowStatuses: ['ongoing', 'completed', 'cancelled'],
      allowedFileTypes: [
        '.jpg',
        '.jpeg',
        '.png',
        '.pdf',
        '.doc',
        '.docx',
        '.xls',
        '.xlsx',
        '.pptx',
      ],
      maxFileSizeMB: 20,
    },
    workflow: {
      hasWorkflow: false,
      statuses: ['ongoing', 'completed', 'cancelled'],
      defaultStatus: 'ongoing',
    },
    api: {
      basePath: '/admin/projects',
    },
  },

  // ── Purchase Order ──────────────────────────────────────────────────────
  purchaseOrder: {
    modelName: 'PurchaseOrder',
    displayName: 'Purchase Order',
    routePath: '/procurement/purchase-orders',
    fileAttachment: {
      canManageFiles: true,
      blockedStatuses: ['approved', 'rejected'],
      allowedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf'],
      maxFileSizeMB: 10,
    },
    workflow: {
      hasWorkflow: false,
      statuses: ['pending', 'approved', 'rejected'],
      defaultStatus: 'pending',
    },
    api: {
      basePath: '/purchase-orders',
    },
  },

  // ── Purchase Request ────────────────────────────────────────────────────
  purchaseRequest: {
    modelName: 'PurchaseRequest',
    displayName: 'Purchase Request',
    routePath: '/procurement/purchase-requests',
    fileAttachment: {
      canManageFiles: true,
      blockedStatuses: WORKFLOW_BLOCKED_STATUSES,
      allowedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
      maxFileSizeMB: 10,
    },
    workflow: {
      hasWorkflow: true,
      statuses: ['draft', 'pending', 'reviewed', 'approved', 'rejected'],
      defaultStatus: 'draft',
      statusFlow: {
        draft: ['pending'],
        pending: ['reviewed', 'rejected'],
        reviewed: ['approved', 'rejected'],
        approved: [],
        rejected: [],
      },
    },
    api: {
      basePath: '/purchase-requests',
    },
  },

  // ── Report ──────────────────────────────────────────────────────────────
  report: {
    modelName: 'Report',
    displayName: 'Report',
    routePath: '/reports',
    fileAttachment: {
      canManageFiles: true,
      blockedStatuses: WORKFLOW_BLOCKED_STATUSES,
      allowedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
      maxFileSizeMB: 10,
    },
    workflow: {
      hasWorkflow: true,
      statuses: ['draft', 'pending', 'reviewed', 'approved', 'rejected'],
      defaultStatus: 'draft',
      statusFlow: {
        draft: ['pending'],
        pending: ['reviewed', 'rejected'],
        reviewed: ['approved', 'rejected'],
        approved: [],
        rejected: [],
      },
    },
    api: {
      basePath: '/reports',
    },
  },

  // ── RFQ ──────────────────────────────────────────────────────────────────
  rfq: {
    modelName: 'RFQ',
    displayName: 'Request for Quotation',
    routePath: '/procurement/rfqs',
    fileAttachment: {
      canManageFiles: true,
      blockedStatuses: ['sent', 'cancelled'],
      allowedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
      maxFileSizeMB: 10,
    },
    workflow: {
      hasWorkflow: false,
      statuses: ['preview', 'draft', 'sent', 'cancelled'],
      defaultStatus: 'draft',
    },
    api: {
      basePath: '/rfqs',
    },
  },

  // ── Staff Strategy ──────────────────────────────────────────────────────
  staffStrategy: {
    modelName: 'StaffStrategy',
    displayName: 'Staff Strategy',
    routePath: '/hr/staff-strategies',
    fileAttachment: {
      canManageFiles: true,
      blockedStatuses: ['approved', 'rejected'],
      allowedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'],
      maxFileSizeMB: 10,
    },
    workflow: {
      hasWorkflow: true,
      statuses: ['draft', 'pending', 'approved', 'rejected'],
      defaultStatus: 'draft',
      statusFlow: {
        draft: ['pending'],
        pending: ['approved', 'rejected'],
        approved: [],
        rejected: [],
      },
    },
    api: {
      basePath: '/staff-strategies',
    },
  },

  // ── System Settings ─────────────────────────────────────────────────────
  systemSettings: {
    modelName: 'SystemSettings',
    displayName: 'System Settings',
    routePath: '/admin/settings',
    fileAttachment: {
      canManageFiles: false, // System settings don't have file attachments
      blockedStatuses: [],
      allowedFileTypes: [],
      maxFileSizeMB: 0,
    },
    workflow: {
      hasWorkflow: false,
      statuses: [],
      defaultStatus: '',
    },
    api: {
      basePath: '/admin/settings',
    },
  },

  // ── Travel Request ──────────────────────────────────────────────────────
  travelRequest: {
    modelName: 'TravelRequests',
    displayName: 'Travel Request',
    routePath: '/finance/travel-requests',
    fileAttachment: {
      canManageFiles: true,
      blockedStatuses: WORKFLOW_BLOCKED_STATUSES,
      allowedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
      maxFileSizeMB: 10,
    },
    workflow: {
      hasWorkflow: true,
      statuses: ['draft', 'pending', 'reviewed', 'approved', 'rejected'],
      defaultStatus: 'draft',
      statusFlow: {
        draft: ['pending'],
        pending: ['reviewed', 'rejected'],
        reviewed: ['approved', 'rejected'],
        approved: [],
        rejected: [],
      },
    },
    api: {
      basePath: '/travel-requests',
    },
  },

  // ── User ──────────────────────────────────────────────────────────────────
  user: {
    modelName: 'User',
    displayName: 'User',
    routePath: '/users',
    fileAttachment: {
      canManageFiles: false, // User avatar is handled separately via /files/avatar
      blockedStatuses: [],
      allowedFileTypes: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
      maxFileSizeMB: 5,
    },
    workflow: {
      hasWorkflow: false,
      statuses: ['active', 'inactive'],
      defaultStatus: 'active',
    },
    api: {
      basePath: '/users',
      uploadPath: '/files/avatar',
    },
  },

  // ── Vendor ──────────────────────────────────────────────────────────────
  vendor: {
    modelName: 'Vendor',
    displayName: 'Vendor',
    routePath: '/admin/vendors',
    fileAttachment: {
      canManageFiles: true,
      blockedStatuses: [],
      alwaysAllowStatuses: [], // Vendors don't have status-based blocking
      allowedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf'],
      maxFileSizeMB: 5,
    },
    workflow: {
      hasWorkflow: false,
      statuses: [],
      defaultStatus: '',
    },
    api: {
      basePath: '/admin/vendors',
    },
  },
};

// ─── Helper Functions ──────────────────────────────────────────────────────

/**
 * Get model config by model name or key
 */
export function getModelConfig(modelNameOrKey: string): ModelConfig | undefined {
  // Try direct lookup by model name (e.g., 'AdvanceRequest')
  const byModelName = Object.values(MODEL_CONFIGS).find(
    config => config.modelName === modelNameOrKey
  );
  if (byModelName) return byModelName;

  // Try lookup by key (e.g., 'advanceRequest')
  return MODEL_CONFIGS[modelNameOrKey];
}

/**
 * Check if file management is allowed for a model with given status
 */
export function canManageFiles(modelNameOrKey: string, status: string): boolean {
  const config = getModelConfig(modelNameOrKey);
  if (!config) return false;
  if (!config.fileAttachment.canManageFiles) return false;

  const { blockedStatuses, alwaysAllowStatuses } = config.fileAttachment;

  // If status is in alwaysAllow, allow
  if (alwaysAllowStatuses?.includes(status)) return true;

  // If status is blocked, deny
  if (blockedStatuses?.includes(status)) return false;

  // Default: allow
  return true;
}

/**
 * Get allowed file types for a model
 */
export function getAllowedFileTypes(modelNameOrKey: string): string[] {
  const config = getModelConfig(modelNameOrKey);
  return config?.fileAttachment.allowedFileTypes || ['.jpg', '.jpeg', '.png', '.pdf'];
}

/**
 * Get max file size for a model
 */
export function getMaxFileSizeMB(modelNameOrKey: string): number {
  const config = getModelConfig(modelNameOrKey);
  return config?.fileAttachment.maxFileSizeMB || 10;
}

/**
 * Get the model key from a model name (for lookups)
 */
export function getModelKey(modelName: string): string {
  const entry = Object.entries(MODEL_CONFIGS).find(([, config]) => config.modelName === modelName);
  return entry?.[0] || '';
}

/**
 * Get blocked statuses for a model
 */
export function getBlockedStatuses(modelNameOrKey: string): string[] {
  const config = getModelConfig(modelNameOrKey);
  return config?.fileAttachment.blockedStatuses || [];
}

/**
 * Check if a model uses workflow
 */
export function hasWorkflow(modelNameOrKey: string): boolean {
  const config = getModelConfig(modelNameOrKey);
  return config?.workflow.hasWorkflow || false;
}

/**
 * Get all model names that have file attachments
 */
export function getModelsWithAttachments(): string[] {
  return Object.values(MODEL_CONFIGS)
    .filter(config => config.fileAttachment.canManageFiles)
    .map(config => config.modelName);
}

/**
 * Get model config by route path
 */
export function getModelByRoutePath(routePath: string): ModelConfig | undefined {
  return Object.values(MODEL_CONFIGS).find(config => config.routePath === routePath);
}
