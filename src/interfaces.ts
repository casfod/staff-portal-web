///////////////////////
//File
///////////////////////

// First, define a type for your file object
export interface FileType {
  name: string;
  url: string;
  cloudinaryId: string;
  mimeType: string;
  size: number;
  fileType: string;
  createdAt: string;
  updatedAt: string;
  id: string;
}

///////////////////////
//Comment
///////////////////////

export interface Comment {
  _id: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
  text: string;
  edited: boolean;
  deleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

///////////////////////
//User
///////////////////////

export interface useAdminsType {
  status: number;
  message: string;
  amount: number;
  data: UserType[];
}
export interface useUsersType {
  status: number;
  message: string;
  data: {
    users: UserType[];
    totalUsers: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface UserType {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;

  procurementRole?: {
    canCreate?: boolean;
    canView?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
  };

  financeRole?: {
    canCreate?: boolean;
    canView?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
  };
  position?: string;

  isDeleted?: boolean;
  password?: string;
  passwordConfirm?: string;
}

export interface PasswordResetTypes {
  password: string;
  passwordConfirm: string;
}
export interface PasswordForgotTypes {
  email: string;
}

///////////////////////
//PurChaseRequest
///////////////////////
export interface PurchaseRequestStats {
  totalRequests: number;
  totalApprovedRequests: number;
}

export interface UsePurchaseStatsType {
  status: number;
  message: string;
  amount: number;
  data: PurchaseRequestStats;
}

export interface UsePurChaseRequest {
  status: number;
  message: string;
  data: PurChaseRequestType;
}

export interface usePurChaseRequestType {
  status: number;
  message: string;
  data: {
    purchaseRequests: PurChaseRequestType[];
    total: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface PurChaseRequestType {
  id?: string;
  department: string;
  suggestedSupplier: string;
  requestedBy?: string;
  address: string;
  finalDeliveryPoint: string;
  city: string;
  periodOfActivity: {
    from: any;
    to: any;
  };
  activityDescription: string;
  expenseChargedTo: string;
  accountCode: string;
  project?: Partial<Project> | string | null;
  reviewedBy?: any;
  approvedBy?: any;
  itemGroups?: PurchaseRequesItemGroupType[];
  comments?: Comment[];
  status?: string;
  createdBy?: Partial<UserType>;
  createdAt?: string;
  updatedAt?: string;
  files?: [];
  copiedTo?: UserType[];
}

export interface PurchaseRequesItemGroupType {
  id?: string;
  description: string;
  frequency: number;
  quantity: number;
  unit: string;
  unitCost: number;
  total: number;
}
///////////////////////
//AdvanceRequest
///////////////////////
export interface AdvanceRequestStats {
  totalRequests: number;
  totalApprovedRequests: number;
}

export interface UseAdvanceStatsType {
  status: number;
  message: string;
  amount: number;
  data: AdvanceRequestStats;
}

export interface UseAdvanceRequest {
  status: number;
  message: string;
  data: AdvanceRequestType;
}

export interface UseAdvanceRequestType {
  status: number;
  message: string;
  data: {
    advanceRequests: AdvanceRequestType[];
    total: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface AdvanceRequestType {
  id?: string;
  department: string;
  suggestedSupplier: string;
  requestedBy?: string;
  address: string;
  finalDeliveryPoint: string;
  city: string;
  periodOfActivity: {
    from: any;
    to: any;
  };
  activityDescription: string;
  expenseChargedTo: string;
  accountCode: string;
  project?: Partial<Project> | string | null;

  accountNumber: string;
  accountName: string;
  bankName: string;
  reviewedBy?: any;
  approvedBy?: any;
  itemGroups?: AdvanceRequesItemGroupType[];
  comments?: Comment[];
  status?: string;
  createdBy?: Partial<UserType>;
  createdAt?: string;
  updatedAt?: string;
  files?: [];
  copiedTo?: UserType[];
}

export interface AdvanceRequesItemGroupType {
  id?: string;
  description: string;
  frequency: number;
  quantity: number;
  unit: string;
  unitCost: number;
  total: number;
}

///////////////////////
//TravelRequest
///////////////////////

export interface TravelRequestStats {
  totalRequests: number;
  totalApprovedRequests: number;
}

export interface UseTravelStatsType {
  status: number;
  message: string;
  amount: number;
  data: TravelRequestStats;
}

export interface UseTravelRequest {
  status: number;
  message: string;
  data: TravelRequestType;
}

export interface useTravelRequestType {
  status: number;
  message: string;
  data: {
    travelRequests: TravelRequestType[];
    total: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface TravelRequestItemGroup {
  id?: string;
  expense: string;
  frequency: number;
  quantity: number;
  unit: string;
  unitCost: number;
  total: number;
}

export interface TravelRequestType {
  id?: string;
  staffName?: string;
  travelRequest: {
    from: string;
    to: string;
  };
  expenseChargedTo: string;
  accountCode: string;
  project?: Partial<Project> | string | null;

  budget: number;
  amountInWords: string;
  travelReason: string;
  dayOfDeparture: Date | undefined;
  dayOfReturn: Date | string | null;
  expenses: TravelRequestItemGroup[];

  comments?: Comment[];
  status?: string;
  createdBy?: Partial<UserType>;
  createdAt?: string;
  updatedAt?: string;
  reviewedBy?: any;
  approvedBy?: any;
  files?: [];
  copiedTo?: UserType[];
}

///////////////////////
//ExpenseClaim
///////////////////////

export interface ExpenseClaimStats {
  totalRequests: number;
  totalApprovedRequests: number;
}

export interface UseExpenseClaimStatsType {
  status: number;
  message: string;
  amount: number;
  data: ExpenseClaimStats;
}
export interface UseExpenseClaim {
  status: number;
  message: string;
  data: ExpenseClaimType;
}

export interface useExpenseClaimType {
  status: number;
  message: string;
  data: {
    expenseClaims: ExpenseClaimType[];
    total: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface ExpenseClaimItemGroup {
  id?: string;
  expense: string;
  frequency: number;
  quantity: number;
  unit: string;
  unitCost: number;
  total: number;
}

export interface ExpenseClaimType {
  id?: string;
  staffName?: string;
  expenseClaim: {
    from: any;
    to: any;
  };
  expenseChargedTo: string;
  accountCode: string;
  project?: Partial<Project> | string | null;
  budget: number;
  amountInWords: string;
  expenseReason: string;
  dayOfDeparture: Date | string | null;
  dayOfReturn: Date | string | null;
  expenses: ExpenseClaimItemGroup[];

  comments?: Comment[];
  status?: string;
  createdBy?: Partial<UserType>;
  createdAt?: string;
  updatedAt?: string;
  reviewedBy?: any;
  approvedBy?: any;
  files?: [];
  copiedTo?: UserType[];
}

///////////////////////
//PaymentRequest
///////////////////////

export interface PaymentRequestStats {
  totalRequests: number;
  totalApprovedRequests: number;
}

export interface UsePaymentStatsType {
  status: number;
  message: string;
  amount: number;
  data: PaymentRequestStats;
}

export interface UsePaymentRequest {
  status: number;
  message: string;
  data: PaymentRequestType;
}

export interface usePaymentRequestType {
  status: number;
  message: string;
  data: {
    paymentRequests: PaymentRequestType[];
    total: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface PaymentRequestType {
  id?: string;
  requestBy: string;
  amountInFigure: number;
  amountInWords: string;
  purposeOfExpense: string;
  grantCode: string;
  dateOfExpense: Date | string | null;
  specialInstruction: string;
  accountNumber: string;
  accountName: string;
  bankName: string;

  requestedBy?: Partial<UserType>;
  requestedAt?: string;

  reviewedBy?: any;
  reviewedAt?: string;

  approvedBy?: any;
  approvedAt?: string;

  comments?: Comment[];
  status: string;

  // Mongoose timestamps (auto-generated)
  createdAt?: string;
  updatedAt?: string;
  files?: [];
  copiedTo?: UserType[];
}

///////////////////////
//Project
///////////////////////

export interface ProjectStats {
  totalProjects: number;
}
export interface UseProjectStatsType {
  status: number;
  message: string;
  amount: number;
  data: ProjectStats;
}

export interface UseProject {
  status: number;
  message: string;
  data: Project;
}

export interface useProjectType {
  status: number;
  message: string;
  data: {
    projects: Project[];
    totalProjects: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface Project {
  id?: string;
  project_title: string;
  donor: string;
  project_partners: string[];
  project_code: string;
  implementation_period: ImplementationPeriod;
  project_budget: number;
  account_code: AccountCode[];
  sectors: Sector[];
  project_locations: string[];
  target_beneficiaries: string[];
  // target_beneficiaries: TargetBeneficiaries;
  project_objectives: string;
  project_summary: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  files?: [];
}

export interface ImplementationPeriod {
  from: any;
  to: any;
}

export interface AccountCode {
  name: string;
  // code?: string;
}
export interface Sector {
  name: string;
  percentage: number;
}

export interface TargetBeneficiaries {
  women: number;
  girls: number;
  boys: number;
  men: number;
}

///////////////////////
//ConceptNote //
///////////////////////
export interface ConceptNoteStats {
  totalRequests: number;
  totalApprovedRequests: number;
}

export interface UseConceptNoteStatsType {
  status: number;
  message: string;
  amount: number;
  data: ConceptNoteStats;
}

export interface UseConceptNote {
  status: number;
  message: string;
  data: ConceptNoteType;
}

export interface UseConceptNoteType {
  status: number;
  message: string;
  data: {
    conceptNotes: ConceptNoteType[];
    total: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface ConceptNoteType {
  id?: string;
  staff_name?: string;
  staff_role?: string;
  // project_code: string;
  activity_title: string;
  activity_location: string;
  expense_Charged_To: string;
  account_Code: string;
  project?: Partial<Project> | string | null;
  activity_period: {
    from: any;
    to: any;
  };
  background_context: string;
  // objectives_purpose: string[];
  objectives_purpose: string;
  detailed_activity_description: string;
  // detailed_activity_description: {
  //   title: string;
  //   description: string;
  // }[];
  strategic_plan: string;
  // benefits_of_project: string[];
  benefits_of_project: string;
  means_of_verification: string;
  activity_budget: number;
  comments?: Comment[];
  reviewedBy?: any;
  preparedBy?: any;
  approvedBy?: any;
  status?: "pending" | "approved" | "rejected" | "reviewed" | "draft";
  createdAt?: string;
  updatedAt?: string;

  files?: [];
  copiedTo?: UserType[];
}

///////////////////////
//Vendor //
///////////////////////
export interface VendorType {
  id: string;
  businessName: string;
  businessType: string;
  address: string;
  email: string;
  businessPhoneNumber: string;
  contactPhoneNumber: string;
  categories?: string[];
  contactPerson: string;
  position: string;
  vendorCode: string;
  tinNumber: string;
  createdAt: string;
  updatedAt: string;
  businessRegNumber: string;
  businessState: string;
  operatingLGA: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  files?: [];
}

export interface UseVendorType {
  status: string;
  message: string;
  data: {
    vendors: VendorType[];
    totalVendors: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface UseVendor {
  status: string;
  message: string;
  data: {
    vendor: VendorType;
  };
}

export interface UseVendorStatsType {
  status: number;
  message: string;
  data: {
    totalVendors: number;
    activeVendors: number;
    vendorsByCategory: { category: string; count: number }[];
  };
}

export interface CreateVendorType {
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
  operatingLGA?: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  files?: File[];
}

export interface UpdateVendorType {
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
  operatingLGA?: string;
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
  files?: File[];
}

///////////////////////
//RFQ //
///////////////////////

export interface ItemGroupType {
  description: string;
  frequency: number;
  quantity: number;
  unit: string;
  unitCost: number;
  total: number;
}

export interface RFQItemGroupType {
  description: string;
  itemName: string;
  frequency: number;
  quantity: number;
  unit: string;
  unitCost: number;
  total: number;
  _id?: string;
}

export interface RFQType {
  deliveryDate: string;
  poDate: string;
  id: string;
  RFQTitle: string;
  RFQCode: string;
  itemGroups: RFQItemGroupType[];
  copiedTo: string[] | VendorType[];
  deadlineDate: string;
  rfqDate: string;
  pdfUrl?: string;
  casfodAddressId: string;
  cloudinaryId?: string;
  status: "draft" | "preview" | "sent" | "cancelled";
  createdBy: UserType;
  createdAt: string;
  updatedAt: string;
  approvedBy: Partial<UserType> | string;
  files?: FileType[];
}

export interface CreateRFQType {
  RFQTitle: string;
  deadlineDate: string;
  rfqDate: string;
  casfodAddressId: string;
  itemGroups: RFQItemGroupType[];
  copiedTo: string[];
  files?: File[];
}

export interface UpdateRFQType {
  RFQTitle?: string;
  deadlineDate?: string;
  rfqDate?: string;
  casfodAddressId?: string;
  itemGroups?: RFQItemGroupType[];
  copiedTo?: string[];
  files?: File[];
}

export interface UseRFQ {
  status: number;
  message: string;
  data: {
    rfq: RFQType;
  };
}

export interface UseRFQType {
  status: number;
  message: string;
  data: {
    rfqs: RFQType[];
    total: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface UseRFQStatsType {
  status: number;
  message: string;
  data: {
    totalRFQs: number;
    totalSentRFQs: number;
    totalDraftRFQs: number;
  };
}

///////////////////////////////////
// PURCHASE ORDER
///////////////////////////////////

// Keep the old Comment interface for backward compatibility
export interface OldComment {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
  text: string;
  createdAt?: string;
}

export interface PurchaseOrderType {
  id: string;
  RFQTitle: string;
  RFQCode: string;
  POCode: string;
  deliveryDate?: string;
  poDate?: string;
  itemGroups: RFQItemGroupType[];
  copiedTo: Array<{
    id: string;
    businessName: string;
    email: string;
    contactPerson: string;
    businessPhoneNumber?: string;
    address?: string;
  }>;
  selectedVendor: {
    vendorName: string;
    id: string;
    businessName: string;
    email: string;
    contactPerson: string;
    businessPhoneNumber?: string;
    contactPhoneNumber?: string;
    address?: string;
  };

  casfodAddressId: string;
  totalAmount: number;
  VAT: number;
  pdfUrl: string;
  cloudinaryId: string;
  createdBy: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
  status: "pending" | "approved" | "rejected";
  isFromRFQ: boolean;
  comments: Comment[] | OldComment[]; // Support both new and old comment formats
  approvedBy?: Partial<UserType>;
  createdAt: string;
  updatedAt: string;
  files?: FileType[];
}

export interface CreatePurchaseOrderType {
  RFQTitle: string;
  itemGroups: RFQItemGroupType[];
  deliveryDate?: string;
  casfodAddressId: string;
  VAT: number;
  poDate?: string;
  copiedTo?: string[];
  selectedVendor: string;
  approvedBy?: Partial<UserType> | string;

  files?: FileType[];
}

export interface UpdatePurchaseOrderType {
  RFQTitle?: string;
  itemGroups?: RFQItemGroupType[];
  deliveryDate?: string;
  poDate?: string;
  casfodAddressId: string;
  VAT: number;
  status?: string;
  copiedTo?: string[];
  selectedVendor?: string;
  approvedBy: Partial<UserType> | string;
  files?: File[];
  comment?: string;
}

export interface UsePurchaseOrder {
  status: string;
  message: string;
  data: PurchaseOrderType;
}

export interface UsePurchaseOrderType {
  status: string;
  message: string;
  data: {
    purchaseOrders: PurchaseOrderType[];
    total: number;
    totalPages: number;
    currentPage: number;
  };
}

///////////////////////////////////
// GOODS RECIEVED
///////////////////////////////////
// Add to your existing interfaces.ts
export interface GoodsReceivedItemsType {
  isFullyReceived: boolean;
  itemid: string;
  numberOrdered: number;
  numberReceived: number;
  difference: number;
}

export interface GoodsReceivedType {
  isCompleted: boolean; // Changed from 'any' to 'boolean'
  id: string;
  GRDCode: string;
  files?: FileType[];
  purchaseOrder: PurchaseOrderType | string;
  GRNitems: GoodsReceivedItemsType[];
  createdBy: UserType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoodsReceivedType {
  purchaseOrder: string;
  files?: File[];
  GRNitems: {
    itemid: string;
    numberOrdered: number;
    numberReceived: number;
  }[];
}

export interface UseGoodsReceived {
  status: string;
  message: string;
  data: GoodsReceivedType;
}

export interface UseGoodsReceivedType {
  status: string;
  message: string;
  data: {
    goodsReceived: GoodsReceivedType[];
    totalPages: number;
    currentPage: number;
    totalCount: number;
  };
}

///////////////////////////////////
//Payment Voucher
///////////////////////////////////
// interfaces.ts - Update the PaymentVoucherType interface
export interface PaymentVoucherType {
  id?: string;
  pvNumber: string;
  pvDate: string;
  payingStation: string;
  payTo: string;
  being: string;
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
  createdBy?: Partial<UserType>; // Made optional for form creation
  reviewedBy?: UserType[] | any; // Changed to string for form handling
  approvedBy?: UserType[] | any; // Changed to string for form handling
  status?: "draft" | "pending" | "reviewed" | "approved" | "rejected" | "paid"; // Made optional
  comments?: Comment[];
  copiedTo?: UserType[];
  files?: FileType[];
  createdAt?: string;
  updatedAt?: string;
}

// Add a separate interface for form data
export interface PaymentVoucherFormData {
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

export interface UsePaymentVoucherStatsType {
  status: number;
  message: string;
  data: {
    totalVouchers: number;
    totalApprovedVouchers: number;
    totalPaidVouchers: number;
    totalAmount: number;
  };
}

export interface usePaymentVoucherType {
  status: number;
  message: string;
  data: {
    paymentVouchers: PaymentVoucherType[];
    total: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface UsePaymentVoucher {
  status: number;
  message: string;
  data: PaymentVoucherType;
}
