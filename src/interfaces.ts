// =============================================
// COMMON / SHARED TYPES
// =============================================

import { AxiosError, AxiosResponse } from 'axios';

// src/types/filters.ts

export interface IFilterOption {
  value: string;
  label: string;
}

export interface IFilterConfig {
  key: string;
  label: string;
  type: 'select' | 'date' | 'text' | 'multiselect';
  options?: IFilterOption[];
  placeholder?: string;
}

export interface IFilterState {
  [key: string]: string | string[] | Date | null;
}

export interface IFilterPreset {
  id: string;
  name: string;
  filters: IFilterState;
}

export const STATUS_OPTIONS: IFilterOption[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export const REVIEW_STATUS_OPTIONS: IFilterOption[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export const SORT_OPTIONS: IFilterOption[] = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'createdAt', label: 'Oldest First' },
  { value: '-updatedAt', label: 'Recently Updated' },
  { value: 'updatedAt', label: 'Least Recently Updated' },
  { value: 'status', label: 'By Status' },
  { value: '-status', label: 'By Status (Desc)' },
];

export interface IRequestDetailFormData {
  approvedBy?: string | null | undefined;
}

interface IErrorResponse {
  message: string;
}

export interface IHookError extends AxiosError {
  response?: AxiosResponse<IErrorResponse>;
}

export interface IQueryParams {
  search?: string;
  sort?: string;
  limit?: number;
  page?: number;
}

export type TableHeaderConfig = {
  label: string;
  showOnMobile: boolean;
  showOnTablet?: boolean;
  minWidth: string;
};

export interface IComment {
  id: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  text: string;
  edited: boolean;
  deleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IUserReference {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  position?: string;
}

export interface IBaseQueryParams {
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export type WorkflowStatus = 'draft' | 'pending' | 'reviewed' | 'approved' | 'rejected';

export interface IApiListResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  timestamp: string;
  data: T[];
  count: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

export interface IApiSingleResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  timestamp: string;
  data: T;
}

export interface IApiStatsResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  timestamp: string;
  amount?: number;
  data: T;
}

export interface IFile {
  id: string;
  _id: string;
  name: string;
  url: string;
  cloudinaryId: string;
  publicId: string;
  format: string;
  resourceType: string;
  size: number;
  originalName: string;
  folder: string;
  mimeType: string;
  fileType: 'image' | 'pdf' | 'spreadsheet' | 'document' | 'other';
  description?: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
  };
  userId?: string;
  associatedTo?: {
    model: string;
    id: string;
  };
  createdAt: string;
  updatedAt: string;
}
// ─── File API Response Types ─────────────────────────────────────────────────

// For listing files (array response)
export interface IFileListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  timestamp: string;
  data: {
    files: IFile[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// For single file response
export interface IFileSingleResponse {
  success: boolean;
  statusCode: number;
  message: string;
  timestamp: string;
  data: IFile;
}

// For file upload response (multiple files)
export interface IFileUploadResponse {
  success: boolean;
  statusCode: number;
  message: string;
  timestamp: string;
  data: IFile[];
}

// For avatar upload response
export interface IAvatarResponse {
  success: boolean;
  statusCode: number;
  message: string;
  timestamp: string;
  data: {
    url: string;
    publicId: string;
  };
}

// For file delete response (no data)
export interface IFileDeleteResponse {
  success: boolean;
  statusCode: number;
  message: string;
  timestamp: string;
  data: null;
}

// ─── Legacy/Compat Types (if needed for backward compatibility) ─────────────

// This is a wrapper for when the API returns { file: IFile } instead of just IFile
export interface IFileWrapper {
  file: IFile;
}

// For API responses that return { files: IFile[] } in data
export type FileListResponse = IFileListResponse;
export type FileSingleResponse = IFileSingleResponse;
export type FileUploadResponse = IFileUploadResponse;

// =============================================
// USER TYPES
// =============================================

export interface IPasswordReset {
  token: string;
  password: string;
  passwordConfirm?: string;
}

export interface IPasswordForgot {
  email: string;
}

export interface IRolePermissions {
  canCreate: boolean;
  canView: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface IPersonalDetails {
  fullName?: string;
  stateOfOrigin?: string;
  lga?: string;
  religion?: string;
  gender?: 'male' | 'female';
  address?: string;
  homePhone?: string;
  cellPhone?: string;
  emailAddress?: string;
  ninNumber?: string;
  birthDate?: string | Date;
  maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  spouseName?: string;
  spouseAddress?: string;
  spousePhone?: string;
  numberOfChildren?: number;
}

export interface IJobDetails {
  title?: string;
  idNo?: string;
  staffTaxIdNo?: string;
  workLocation?: string;
  workEmail?: string;
  workPhone?: string;
  workCellPhone?: string;
  startDate?: string | Date;
  endDate?: string | Date | null;
  supervisor?: string;
  supervisorId?: Partial<IUser>
}

export interface IEmergencyContact {
  fullName?: string;
  address?: string;
  primaryPhone?: string;
  cellPhone?: string;
  relationship?: string;
}

export interface IBankDetails {
  bankName?: string;
  accountName?: string;
  bankSortCode?: string;
  accountNumber?: string;
}

export interface IEmploymentInfo {
  isProfileComplete: boolean;
  isEmploymentInfoLocked: boolean;
  personalDetails?: IPersonalDetails;
  jobDetails?: IJobDetails;
  emergencyContact?: IEmergencyContact;
  bankDetails?: IBankDetails;
}

export interface IUserAvatar {
  url: string;
  publicId: string;
}
export interface IUserSignature {
  url: string;
  publicId: string;
}

export type IUserRole = 'SUPER-ADMIN' | 'ADMIN' | 'REVIEWER' | 'STAFF';

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: IUserRole;
  procurementRole: IRolePermissions;
  financeRole: IRolePermissions;
  position?: string;
  avatar: IUserAvatar;
  signature: IUserSignature;
  isActive: boolean;
  isDeleted: boolean;
  employmentInfo: IEmploymentInfo;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  password?: string;
  passwordConfirm?: string;
}

export interface ISystemSettings {
  globalEmploymentInfoLock: boolean;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// API Response Types
export type IUsersListResponse = IApiListResponse<IUser>;
export type IUserSingleResponse = IApiSingleResponse<IUser>;
export type IAdminsListResponse = IApiListResponse<IUser>;
export type IEmploymentInfoResponse = IApiSingleResponse<{
  employmentInfo: IEmploymentInfo;
  isProfileComplete: boolean;
  canUpdate: boolean;
  isLocked: boolean;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
}>;
export type IEmploymentInfoStatusResponse = IApiSingleResponse<
  Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    employmentInfo: {
      isProfileComplete?: boolean;
      isEmploymentInfoLocked?: boolean;
      personalDetails?: {
        fullName?: string;
      };
      jobDetails?: {
        title?: string;
      };
    };
  }>
>;
export type ISystemSettingsResponse = IApiSingleResponse<ISystemSettings>;

// =============================================
// PROJECT TYPES
// =============================================

export interface IAccountCode {
  name: string;
}

export interface ISector {
  name: 'Education' | 'Protection' | 'WASH' | 'Nutrition/Health' | 'Livelihood';
  percentage: number;
}

export interface IImplementationPeriod {
  from: string;
  to: string;
}

export interface IMilestone {
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
}

export interface IProject {
  id: string;
  projectTitle: string;
  donor: string;
  projectPartners: string[];
  projectCode: string;
  implementationPeriod: IImplementationPeriod;
  projectBudget: number;
  accountCodes: IAccountCode[];
  sectors: ISector[];
  projectLocations: string[]; // ✅ Keep as plural
  targetBeneficiaries: string[];
  projectObjectives: string;
  milestones?: IMilestone[];
  projectSummary: string;
  status: 'ongoing' | 'completed' | 'cancelled'; // ✅ Add missing field
  createdAt: string;
  updatedAt: string;
  files?: IFile[];
}

export interface IProjectStats {
  totalProjects: number;
}

// API Response Types
export type IProjectsListResponse = IApiListResponse<IProject>;
export type IProjectSingleResponse = IApiSingleResponse<IProject>;
export type IProjectStatsResponse = IApiStatsResponse<IProjectStats>;

// =============================================
// CONCEPT NOTE TYPES
// =============================================

export interface IActivityPeriod {
  from: string;
  to: string;
}

export interface IConceptNote {
  id: string;
  cnNumber: string;
  expenseChargedTo: string;
  accountCode: string;
  project?: Partial<IProject> | string | null;
  activityTitle: string;
  activityLocation: string;
  activityPeriod: IActivityPeriod;
  backgroundContext: string;
  objectivesPurpose: string;
  detailedActivityDescription: string;
  strategicPlan: string;
  benefitsOfProject: string;
  activityBudget: number;
  meansOfVerification: string;
  createdBy: Partial<IUser>;
  reviewedBy?: Partial<IUser>;
  approvedBy?: Partial<IUser>;
  status: WorkflowStatus;
  comments: IComment[];
  copiedTo: IUser[];
  files?: IFile[];
  createdAt: string;
  updatedAt: string;
}

export interface IConceptNoteStats {
  totalRequests: number;
  totalApprovedRequests: number;
}

// API Response Types
export type IConceptNotesListResponse = IApiListResponse<IConceptNote>;
export type IConceptNoteSingleResponse = IApiSingleResponse<IConceptNote>;
export type IConceptNoteStatsResponse = IApiStatsResponse<IConceptNoteStats>;

// =============================================
// ITEM GROUP TYPES
// =============================================

export interface IItemGroup {
  id?: string;
  itemName?: string;
  description: string;
  frequency: number;
  quantity: number;
  unitCost: number;
  unit: string;
  total?: number;
}

export interface IExpenseItem {
  id?: string;
  expense: string;
  description?: string;
  frequency: number;
  quantity: number;
  unit: string;
  unitCost: number;
  total: number;
}

export type IUnifiedItem = IItemGroup | IExpenseItem;

// =============================================
// ADVANCE REQUEST TYPES
// =============================================

export interface IAdvanceRequest {
  id: string;
  arNumber: string;
  department: string;
  suggestedSupplier: string;
  address: string;
  finalDeliveryPoint: string;
  city: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  expenseChargedTo: string;
  accountCode: string;
  project?: Partial<IProject> | string | null;
  periodOfActivity: IActivityPeriod;
  activityDescription: string;
  approvedBy?: Partial<IUser>;
  reviewedBy?: Partial<IUser>;
  itemGroups: IItemGroup[];
  comments: IComment[];
  copiedTo: IUser[];
  status: WorkflowStatus;
  createdBy: Partial<IUser>;
  files?: IFile[];
  createdAt: string;
  updatedAt: string;
}

export interface IAdvanceRequestStats {
  totalRequests: number;
  totalApprovedRequests: number;
}

// API Response Types
export type IAdvanceRequestsListResponse = IApiListResponse<IAdvanceRequest>;
export type IAdvanceRequestSingleResponse = IApiSingleResponse<IAdvanceRequest>;
export type IAdvanceRequestStatsResponse = IApiStatsResponse<IAdvanceRequestStats>;

// =============================================
// PURCHASE REQUEST TYPES
// =============================================

export type ReviewDecision = 'pending' | 'approved' | 'rejected';

export interface IPurchaseRequest {
  id: string;
  pcrNumber: string;
  department: string;
  suggestedSupplier: string;
  address: string;
  finalDeliveryPoint: string;
  city: string;
  periodOfActivity: IActivityPeriod;
  activityDescription: string;
  expenseChargedTo: string;
  accountCode: string;
  project?: Partial<IProject> | string | null;
  financeReviewBy?: Partial<IUser>;
  financeReviewStatus: ReviewDecision;
  procurementReviewBy?: Partial<IUser>;
  procurementReviewStatus: ReviewDecision;
  reviewedBy?: Partial<IUser>;
  approvedBy?: Partial<IUser>;
  itemGroups: IItemGroup[];
  comments: IComment[];
  copiedTo: IUser[];
  status: WorkflowStatus;
  createdBy: Partial<IUser>;
  files?: IFile[];
  createdAt: string;
  updatedAt: string;
}

export interface IPurchaseRequestStats {
  totalRequests: number;
  totalApprovedRequests: number;
}

// API Response Types
export type IPurchaseRequestsListResponse = IApiListResponse<IPurchaseRequest>;
export type IPurchaseRequestSingleResponse = IApiSingleResponse<IPurchaseRequest>;
export type IPurchaseRequestStatsResponse = IApiStatsResponse<IPurchaseRequestStats>;

// =============================================
// TRAVEL REQUEST TYPES
// =============================================

export interface ITravelPeriod {
  from: string;
  to: string;
}

export interface ITravelRequest {
  id: string;
  trNumber: string;
  staffName: string;
  travelRequest: ITravelPeriod;
  expenseChargedTo: string;
  accountCode: string;
  project?: Partial<IProject> | string | null;
  budget: number;
  amountInWords: string;
  travelReason: string;
  dayOfDeparture: string;
  dayOfReturn: string;
  expenses: IExpenseItem[];
  createdBy: Partial<IUser>;
  reviewedBy?: Partial<IUser>;
  approvedBy?: Partial<IUser>;
  status: WorkflowStatus;
  comments: IComment[];
  copiedTo: IUser[];
  files?: IFile[];
  createdAt: string;
  updatedAt: string;
}

export interface ITravelRequestStats {
  totalRequests: number;
  totalApprovedRequests: number;
}

// API Response Types
export type ITravelRequestsListResponse = IApiListResponse<ITravelRequest>;
export type ITravelRequestSingleResponse = IApiSingleResponse<ITravelRequest>;
export type ITravelRequestStatsResponse = IApiStatsResponse<ITravelRequestStats>;

// =============================================
// EXPENSE CLAIM TYPES
// =============================================

export interface IClaimPeriod {
  from: string;
  to: string;
}

export interface IExpenseClaim {
  id: string;
  ecNumber: string;
  staffName: string;
  expenseClaim: IClaimPeriod;
  expenseChargedTo: string;
  accountCode: string;
  project?: Partial<IProject> | string | null;
  budget: number;
  amountInWords: string;
  expenseReason: string;
  dayOfDeparture: string;
  dayOfReturn: string;
  expenses: IExpenseItem[];
  createdBy: Partial<IUser>;
  reviewedBy?: Partial<IUser>;
  approvedBy?: Partial<IUser>;
  status: WorkflowStatus;
  comments: IComment[];
  copiedTo: IUser[];
  files?: IFile[];
  createdAt: string;
  updatedAt: string;
}

export interface IExpenseClaimStats {
  totalRequests: number;
  totalApprovedRequests: number;
}

// API Response Types
export type IExpenseClaimsListResponse = IApiListResponse<IExpenseClaim>;
export type IExpenseClaimSingleResponse = IApiSingleResponse<IExpenseClaim>;
export type IExpenseClaimStatsResponse = IApiStatsResponse<IExpenseClaimStats>;

// =============================================
// PAYMENT REQUEST TYPES
// =============================================

export interface IPaymentRequest {
  id: string;
  pmrNumber: string;
  amountInFigure: number;
  amountInWords: string;
  purposeOfExpense: string;
  grantCode: string;
  dateOfExpense: string;
  specialInstruction: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  createdBy?: Partial<IUser>;
  requestedAt?: string;
  reviewedBy?: Partial<IUser>;
  reviewedAt?: string;
  approvedBy?: Partial<IUser>;
  approvedAt?: string;
  comments: IComment[];
  copiedTo: IUser[];
  status: WorkflowStatus;
  files?: IFile[];
  createdAt: string;
  updatedAt: string;
}

export interface IPaymentRequestStats {
  totalRequests: number;
  totalApprovedRequests: number;
}

// API Response Types
export type IPaymentRequestsListResponse = IApiListResponse<IPaymentRequest>;
export type IPaymentRequestSingleResponse = IApiSingleResponse<IPaymentRequest>;
export type IPaymentRequestStatsResponse = IApiStatsResponse<IPaymentRequestStats>;

// =============================================
// VENDOR TYPES
// =============================================

export interface IVendor {
  id: string;
  businessName: string;
  businessType: string;
  businessRegNumber: string;
  businessState: string;
  operatingLga?: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  address: string;
  email: string;
  businessPhoneNumber: string;
  contactPhoneNumber: string;
  categories: string[];
  contactPerson: string;
  createdBy: Partial<IUser>;
  approvedBy?: Partial<IUser>;
  position: string;
  vendorCode: string;
  tinNumber: string;
  status: string;
  files?: File[];
  comments?: IComment[];
  createdAt: string;
  updatedAt: string;
}

export interface IVendorStats {
  totalVendors: number;
  activeVendors: number;
  vendorsByCategory: { category: string; count: number }[];
}

export interface ICreateVendorPayload {
  businessName: string;
  businessType: string;
  address: string;
  email: string;
  businessPhoneNumber: string;
  contactPhoneNumber: string;
  categories?: string[];
  contactPerson: string;
  position: string;
  tinNumber: string;
  businessRegNumber: string;
  businessState: string;
  operatingLga?: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  files?: IFile[];
}

export interface IUpdateVendorPayload {
  businessName?: string;
  businessType?: string;
  address?: string;
  email?: string;
  businessPhoneNumber?: string;
  contactPhoneNumber?: string;
  categories?: string[];
  contactPerson?: string;
  position?: string;
  tinNumber?: string;
  businessRegNumber?: string;
  businessState?: string;
  operatingLga?: string;
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
  files?: IFile[];
}

// API Response Types
export type IVendorsListResponse = IApiListResponse<IVendor>;
export type IVendorSingleResponse = IApiSingleResponse<IVendor>;
export type IVendorStatsResponse = IApiSingleResponse<IVendorStats>;

// =============================================
// RFQ TYPES
// =============================================

export interface IRFQItemGroup {
  id?: string;
  description: string;
  itemName?: string;
  frequency: number;
  quantity: number;
  unit: string;
  unitCost: number;
  total: number;
}

export type RFQStatus = 'preview' | 'draft' | 'sent' | 'cancelled';

export interface IRFQ {
  id: string;
  rfqTitle: string;
  rfqCode: string;
  itemGroups: IRFQItemGroup[];
  copiedTo: (string | IVendor)[];
  deadlineDate: string;
  rfqDate: string;
  casfodAddressId: string;
  pdfUrl: string;
  cloudinaryId: string;
  createdBy: Partial<IUser>;
  status: RFQStatus;
  files?: IFile[];
  createdAt: string;
  updatedAt: string;
}

export interface IRFQStats {
  totalRFQs: number;
  totalSentRFQs: number;
  totalDraftRFQs: number;
}

export interface ICreateRFQPayload {
  rfqTitle: string;
  deadlineDate: string;
  rfqDate: string;
  casfodAddressId: string;
  itemGroups: IRFQItemGroup[];
  copiedTo: string[];
  files?: IFile[];
}

export interface IUpdateRFQPayload {
  rfqTitle?: string;
  deadlineDate?: string;
  rfqDate?: string;
  casfodAddressId?: string;
  itemGroups?: IRFQItemGroup[];
  copiedTo?: string[];
  files?: IFile[];
}

// API Response Types
export type IRFQsListResponse = IApiListResponse<IRFQ>;
export type IRFQSingleResponse = IApiSingleResponse<IRFQ>;
export type IRFQStatsResponse = IApiSingleResponse<IRFQStats>;

// =============================================
// PURCHASE ORDER TYPES
// =============================================

export interface IPOItemGroup {
  // id?: string;
  _id?: string;
  description?: string;
  itemName?: string;
  frequency: number;
  quantity: number;
  unit: string;
  unitCost: number;
  total: number;
}

export interface IPurchaseOrder {
  id: string;
  rfqTitle: string;
  rfqCode: string;
  poCode: string;
  itemGroups: IPOItemGroup[];
  copiedTo: (string | IVendor)[];
  selectedVendor?: IVendor;
  deliveryDate: string;
  poDate: string;
  casfodAddressId: string;
  totalAmount: number;
  vat: number;
  pdfUrl: string;
  cloudinaryId: string;
  createdBy: Partial<IUser>;
  status: 'pending' | 'approved' | 'rejected';
  isFromRfq: boolean;
  comments: IComment[];
  approvedBy?: Partial<IUser>;
  files?: File[];
  createdAt: string;
  updatedAt: string;
}

export interface ICreatePurchaseOrderPayload {
  rfqTitle: string;
  itemGroups: IPOItemGroup[];
  deliveryDate?: string;
  poDate?: string;
  casfodAddressId: string;
  vat: number;
  copiedTo?: string[];
  selectedVendor: string;
  approvedBy?: string;
  files?: IFile[];
}

export interface IUpdatePurchaseOrderPayload {
  rfqTitle?: string;
  itemGroups?: IPOItemGroup[];
  deliveryDate?: string;
  poDate?: string;
  casfodAddressId?: string;
  vat?: number;
  status?: string;
  copiedTo?: string[];
  selectedVendor?: string;
  files?: IFile[];
  comment?: string;
}

// API Response Types
export type IPurchaseOrdersListResponse = IApiListResponse<IPurchaseOrder>;
export type IPurchaseOrderSingleResponse = IApiSingleResponse<IPurchaseOrder>;

// =============================================
// GOODS RECEIVED TYPES
// =============================================

export interface IGRNItem {
  itemId: string;
  numberOrdered: number;
  numberReceived: number;
  difference: number;
  isFullyReceived: boolean;
}

export interface IGoodsReceived {
  id: string;
  grdCode: string;
  purchaseOrder: string | IPurchaseOrder;
  grnItems: IGRNItem[];
  createdBy: Partial<IUser>;
  status: WorkflowStatus;
  isCompleted: boolean;
  files?: IFile[];
  createdAt: string;
  updatedAt: string;
}

export interface ICreateGoodsReceivedPayload {
  purchaseOrder: string;
  grnItems: {
    itemId: string;
    numberOrdered: number;
    numberReceived: number;
  }[];
  files?: IFile[];
}

// API Response Types
export type IGoodsReceivedListResponse = IApiListResponse<IGoodsReceived>;
export type IGoodsReceivedSingleResponse = IApiSingleResponse<IGoodsReceived>;

// =============================================
// PAYMENT VOUCHER TYPES
// =============================================

export type PaymentVoucherStatus =
  'draft' | 'pending' | 'reviewed' | 'approved' | 'rejected' | 'paid';

export interface IPaymentVoucher {
  id: string;
  pvNumber: string;
  payingStation: string;
  payTo: string;
  being: string;
  pvDate: string;
  amountInWords: string;
  accountCode: string;
  projectCode: string;
  project: string;
  grossAmount: number;
  vat: number;
  wht: number;
  devLevy: number;
  otherDeductions: number;
  netAmount: number;
  chartOfAccountCategories: string;
  organisationalChartOfAccount: string;
  chartOfAccountCode: string;
  note: string;
  createdBy: Partial<IUser>;
  reviewedBy?: Partial<IUser>;
  approvedBy?: Partial<IUser>;
  comments: IComment[];
  copiedTo: IUser[];
  status: PaymentVoucherStatus;
  files?: IFile[];
  createdAt: string;
  updatedAt: string;
}

export interface IPaymentVoucherStats {
  totalVouchers: number;
  totalApprovedVouchers: number;
  totalPaidVouchers: number;
  totalAmount: number;
}

export interface IPaymentVoucherFormData {
  payingStation: string;
  payTo: string;
  being: string;
  pvDate?: string;
  amountInWords: string;
  accountCode: string;
  grossAmount: number;
  vat: number;
  wht: number;
  devLevy: number;
  otherDeductions: number;
  netAmount: number;
  chartOfAccountCategories: string;
  organisationalChartOfAccount: string;
  chartOfAccountCode: string;
  project: string;
  projectCode: string;
  note: string;
  reviewedBy?: string | null;
  approvedBy?: string | null;
}

// API Response Types
export type IPaymentVouchersListResponse = IApiListResponse<IPaymentVoucher>;
export type IPaymentVoucherSingleResponse = IApiSingleResponse<IPaymentVoucher>;
export type IPaymentVoucherStatsResponse = IApiSingleResponse<IPaymentVoucherStats>;

// =============================================
// LEAVE MANAGEMENT TYPES
// =============================================

export type ILeaveEnum =
  | 'Annual leave'
  | 'Compassionate leave'
  | 'Sick leave'
  | 'Maternity leave'
  | 'Paternity leave'
  | 'Emergency leave'
  | 'Study Leave'
  | 'Leave without pay';

export interface IILeaveConfig {
  maxDays: number;
  description?: string;
  isCalendarDays: boolean;
}

export interface ILeaveCover {
  nameOfCover?: string;
  signature?: string;
}

export interface ILeave {
  id: string;
  leaveNumber: string;
  user: string | IUser;
  staffName: string;
  staffRole: string;
  leaveType: ILeaveEnum;
  ILeaveConfig: IILeaveConfig;
  startDate: string;
  endDate: string;
  totalDaysApplied: number;
  leaveBalanceAtApplication: number;
  amountAccruedLeave: number;
  createdBy?: Partial<IUser>;
  reviewedBy?: Partial<IUser>;
  approvedBy?: Partial<IUser>;
  status: string;
  comments: IComment[];
  copiedTo: IUser[];
  leaveCover?: ILeaveCover;
  reasonForLeave?: string;
  contactDuringLeave?: string;
  isDeleted: boolean;
  files?: IFile[];
  createdAt: string;
  updatedAt: string;
}

export interface ILeaveFormData {
  leaveType?: ILeaveEnum;
  startDate?: string;
  endDate?: string;
  reasonForLeave?: string;
  contactDuringLeave?: string;
  approvedBy?: string | null;
  leaveCover?: {
    nameOfCover?: string;
    signature?: string;
  };
}

export interface IILeaveBalance {
  maxDays: number;
  totalApplied: number;
  accrued: number;
  balance: number;
  year: number;
}

export interface ILeaveBalance {
  id: string;
  user: string | IUser;
  annualLeave: IILeaveBalance;
  compassionateLeave: IILeaveBalance;
  sickLeave: IILeaveBalance;
  maternityLeave: IILeaveBalance;
  paternityLeave: IILeaveBalance;
  emergencyLeave: IILeaveBalance;
  studyLeave: IILeaveBalance;
  leaveWithoutPay: IILeaveBalance;
  lastResetYear: number;
  createdAt: string;
  updatedAt: string;
}

export interface ILeaveStats {
  totalRequests: number;
  totalApprovedRequests: number;
  totalPendingRequests: number;
  totalReviewedRequests: number;
  totalRejectedRequests: number;
  totalDaysApproved: number;
}

// API Response Types
export type ILeavesListResponse = IApiListResponse<ILeave>;
export type ILeaveSingleResponse = IApiSingleResponse<ILeave>;
export type ILeaveBalanceResponse = IApiSingleResponse<ILeaveBalance>;
export type ILeaveStatsResponse = IApiSingleResponse<ILeaveStats>;

// =============================================
// STAFF STRATEGY TYPES
// =============================================

export type StrategyStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface IObjective {
  objective: string;
  timeline: string;
  expectedOutcome: string;
  kpi: string;
  possibleChallenges?: string;
  supportRequired?: string;
}

export interface IAccountabilityArea {
  areaName: string;
  objectives: IObjective[];
}

export interface IStaffStrategy {
  id: string;
  strategyCode: string;
  // staffName/jobTitle are NOT sent by the API — read them off the
  // populated `staffId` (firstName/lastName, employmentInfo.jobDetails.title).
  staffId?: string | IUser;
  department: string;
  // `approvedBy` is the single supervisor reference (populated). There is
  // no separate `supervisor`/`supervisorId` — those were dead duplicates.
  date: string;
  period: string;
  accountabilityAreas: IAccountabilityArea[];
  comments: IComment[];
  createdBy: Partial<IUser>;
  status: StrategyStatus;
  approvedBy?: Partial<IUser>;
  copiedTo: IUser[];
  pdfUrl: string;
  cloudinaryId: string;
  files?: IFile[];
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export type IStaffStrategiesListResponse = IApiListResponse<IStaffStrategy>;
export type IStaffStrategySingleResponse = IApiSingleResponse<IStaffStrategy>;

// =============================================
// APPRAISAL TYPES
// =============================================

export type ObjectiveRating = '' | 'Achieved' | 'Partly Achieved' | 'Not Achieved';
export type PerformanceRating =
  'Pending' | 'Needs Improvement' | 'Meets Expectations' | 'Exceeds Expectations';
export type OverallRating =
  'Pending' | 'Meets Requirements' | 'Partly Meets Requirements' | 'Does Not Meet Requirements';
export type CompletionStatus = 'pending' | 'completed';
export type AppraisalStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface IEmployeeRating {
  rating: ObjectiveRating;
  achievements: string;
}

export interface IObjectiveRating {
  objective: string;
  employeeRating: IEmployeeRating;
  supervisorRating: ObjectiveRating;
  employeePoints: number;
  supervisorPoints: number;
  supervisorRatingStatus: CompletionStatus;
}

export interface IPerformanceArea {
  area:
    | 'Job Knowledge'
    | 'Judgement'
    | 'Reliability'
    | 'Quality & Quantity of Work'
    | 'Interpersonal and Communication Skills'
    | 'Teamwork';
  rating: PerformanceRating;
  supervisorStatus: CompletionStatus;
}

export interface ISafeguarding {
  actionsTaken: string;
  trainingCompleted: 'Yes' | 'Partly' | 'No';
  areasNotUnderstood: string[];
  supervisorStatus: CompletionStatus;
}

export interface ISignatures {
  staffSignature: boolean;
  staffSignatureDate?: string;
  staffComments?: string;
  supervisorSignature: boolean;
  supervisorSignatureDate?: string;
  hrComments?: string;
}

export interface IAppraisalScores {
  employeeTotal: number;
  supervisorTotal: number;
  performanceAreasCount: {
    needsImprovement: number;
    meetsExpectations: number;
    exceedsExpectations: number;
  };
}

// In interfaces.ts, update IAppraisal to match the backend model:
export interface IAppraisal {
  id: string;
  appraisalCode: string;
  // staffName/position are NOT sent by the API — read them off the
  // populated `staffId` (firstName/lastName, employmentInfo.jobDetails.title).
  staffId?: string | IUser;
  department: string;
  lengthOfTimeInPosition?: string;
  appraisalPeriod: string;
  dateOfAppraisal: string;
  // supervisorId is populated on read (IUser) and a plain id string on
  // write. supervisorName is NOT sent — read it off supervisorId.
  supervisorId?: string | IUser;
  lengthOfTimeSupervised?: string;
  supervisorStatus: CompletionStatus;
  objectives: IObjectiveRating[];
  safeguarding: ISafeguarding;
  performanceAreas: IPerformanceArea[];
  supervisorComments?: string;
  overallRating: OverallRating;
  futureGoals?: string;
  signatures: ISignatures;
  scores: IAppraisalScores;
  comments: IComment[];
  createdBy: Partial<IUser>;
  staffStrategy?: string | IStaffStrategy;
  status: AppraisalStatus;
  approvedBy?: Partial<IUser>;
  copiedTo: IUser[];
  submittedByEmployee: boolean;
  submittedBySupervisor: boolean;
  completedAt?: string;
  pdfUrl: string;
  cloudinaryId: string;
  files?: IFile[];
  createdAt: string;
  updatedAt: string;
}

export interface IAppraisalStats {
  byStatus: Array<{
    _id: string;
    count: number;
    avgEmployeeScore: number;
    avgSupervisorScore: number;
  }>;
  overall: {
    total: number;
    completed: number;
    pending: number;
    draft: number;
  };
}

// API Response Types
export type IAppraisalsListResponse = IApiListResponse<IAppraisal>;
export type IAppraisalSingleResponse = IApiSingleResponse<IAppraisal>;
export type IAppraisalStatsResponse = IApiSingleResponse<IAppraisalStats>;

// =============================================
// REPORT TYPES
// =============================================

export interface IReportingPeriod {
  from: string | Date | null;
  to: string | Date | null;
}

export interface IReport {
  id: string;
  reportNumber?: string;
  activityType: 'Workshop' | 'Training' | 'Sector Meeting' | 'Other';
  otherActivitySpecification?: string;
  reportType:
    'Weekly Report' | 'Monthly Report' | 'Quarterly Report' | 'Annual Report' | 'Activity report';
  reportTitle: string;
  reportingPeriod?: IReportingPeriod;
  project?: Partial<IProject> | string | null;
  reviewedBy?: Partial<IUser>;
  approvedBy?: Partial<IUser>;
  comments: IComment[];
  status: WorkflowStatus;
  createdBy: Partial<IUser>;
  files?: IFile[];
  copiedTo: IUser[];
  createdAt: string;
  updatedAt: string;
}

export interface IReportStats {
  totalReports: number;
  totalApprovedReports: number;
}

// API Response Types
export type IReportsListResponse = IApiListResponse<IReport>;
export type IReportSingleResponse = IApiSingleResponse<IReport>;
export type IReportStatsResponse = IApiStatsResponse<IReportStats>;