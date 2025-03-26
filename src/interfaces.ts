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
  periodOfActivity: string;
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
}

export interface ImplementationPeriod {
  from: string;
  to: string;
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

export interface ConceptNote {
  id?: string;
  staff_name?: string;
  staff_role?: string;
  project_code: string;
  activity_title: string;
  activity_location: string;
  activity_period: {
    from: string;
    to: string;
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
}

export interface UseConceptNoteType {
  status: number;
  message: string;
  data: {
    conceptNotes: ConceptNote[];
    totalConceptNotes: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface ConceptNoteStats {
  totalConceptNotes: number;
  totalApprovedConceptNotes: number;
}

export interface UseConceptNoteStatsType {
  status: number;
  message: string;
  amount: number;
  data: ConceptNoteStats;
}

///////////////////////
//SUB-INTERFACE
///////////////////////
import { ChangeEvent } from "react";

export interface FormValues {
  departmentalCode: string;
  pvNumber: string;
  payingStation: string;
  date: string;
  payTo: string;
  being: string;
  amountInWords: string;
  grantCode: string;
  grossAmount: string;
  vat: string;
  wht: string;
  devLevy: string;
  otherDeductions: string;
  netAmount: string;
  chartOfAccountCategories: string;
  chartOfAccount: string;
  chartOfAccountCode: string;
  projBudgetLine: string;
  note: string;
  mandateReference: string;
  preparedBy: string;
  checkedBy: string;
}

export interface FormValues2 {
  date: string;
  department: string;
  suggestedSupplier: string;
  requestedBy: string;
  city: string;
  periodOfActivity: string;
  activityDescription: string;
  expenseChargedTo: string;
  accountCode: string;
  reviewedBy: string;
  address: string;
  finalDeliveryPoint: string;
  approvedBy: string;
  description: string;
  frequency: string;
  quantity: string;
  unit: string;
  unitCost: string;
  total: string;
}

export interface ItemGroup {
  description: string;
  frequency: string;
  quantity: string;
  unit: string;
  unitCost: string;
  total: any;
  disabled: boolean;
}

export interface ButtonProps {
  size: "small" | "medium" | "large";
  type: any;
}

export interface StyledFormRowProps {
  type?: "small" | "medium" | "large" | "wide";
}

export interface RowProps {
  type?: "horizontal";
}
export interface OptionProps {
  position: string;
  code: string;
}

export interface SelectProps {
  id: string;
  type: string;
  options: Filter[] | undefined;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  // data: OptionProps[];
}
export interface FormProps {
  type?: "regular" | "modal";
}

export interface FormRowProps {
  label: string;
  error: any;
  children: any;
  type: "small" | "medium" | "large" | "wide";
}
/*
 error:
    | string
    | FieldError
    | Merge<FieldError, FieldErrorsImpl<any>>
    | undefined;
*/

export interface Filter {
  position: string;
  code: string;
}

// export type StyledInputProps = {
//   reset: UseFormReset<FormValues>;
// };
