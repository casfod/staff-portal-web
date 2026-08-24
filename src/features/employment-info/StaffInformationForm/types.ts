// src/features/employment-info/StaffInformationForm/types.ts
import { IEmploymentInfo, IUser } from '../../../interfaces';

export interface StaffInformationFormProps {
  onClose?: () => void;
  staffInfo?: IUser;
  isAdminView?: boolean;
}

export interface SectionCompletion {
  personal: boolean;
  job: boolean;
  emergency: boolean;
  bank: boolean;
}

export type FormSection = keyof IEmploymentInfo;
export type FormErrors = Record<string, string>;

export interface FormChangeHandler {
  (
    section: keyof IEmploymentInfo,
    field: string,
    value: string | number | Date | null | undefined
  ): void;
}
