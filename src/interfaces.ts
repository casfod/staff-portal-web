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
  comments?: [{ user: Partial<UserType>; text: string }];
  status?: string;
  createdBy?: Partial<UserType>;
  createdAt?: string;
  updatedAt?: string;
  files?: [];
  copiedTo?: [UserType];
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

export interface useAdvanceRequestType {
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
  comments?: [{ user: Partial<UserType>; text: string }];
  status?: string;
  createdBy?: Partial<UserType>;
  createdAt?: string;
  updatedAt?: string;
  files?: [];
  copiedTo?: [UserType];
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

  comments?: [{ user: Partial<UserType>; text: string }];
  status?: string;
  createdBy?: Partial<UserType>;
  createdAt?: string;
  updatedAt?: string;
  reviewedBy?: any;
  approvedBy?: any;
  files?: [];
  copiedTo?: [UserType];
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

  comments?: [{ user: Partial<UserType>; text: string }];
  status?: string;
  createdBy?: Partial<UserType>;
  createdAt?: string;
  updatedAt?: string;
  reviewedBy?: any;
  approvedBy?: any;
  files?: [];
  copiedTo?: [UserType];
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

  comments?: [{ user: Partial<UserType>; text: string }];
  status: string;

  // Mongoose timestamps (auto-generated)
  createdAt?: string;
  updatedAt?: string;
  files?: [];
  copiedTo?: [UserType];
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
  code?: string;
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
  comments?: [{ user: Partial<UserType>; text: string }];

  preparedBy?: any;
  approvedBy?: any;
  status?: "pending" | "approved" | "rejected" | "draft";
  createdAt?: string;
  updatedAt?: string;

  files?: [];
  copiedTo?: [UserType];
}
