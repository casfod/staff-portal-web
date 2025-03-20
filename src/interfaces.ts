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
  code: string;
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
