// src/features/employment-info/StaffInformationForm/BankDetailsSection.tsx
import React from 'react';
import { Input } from '../../../components/ui/input';
import FormRow from '../../../components/custom/FormRow';
import Row from '../../../components/custom/Row';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Banknote, CheckCircle } from 'lucide-react';
import { bankOptions } from './constants';
import { IEmploymentInfo } from '../../../interfaces';
import { FormChangeHandler, FormErrors } from './types';

interface BankDetailsSectionProps {
  formData: IEmploymentInfo;
  errors: FormErrors;
  onFormChange: FormChangeHandler;
  isCompleted: boolean;
}

export const BankDetailsSection: React.FC<BankDetailsSectionProps> = ({
  formData,
  errors,
  onFormChange,
  isCompleted,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Banknote className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Bank Details</h2>
          {isCompleted && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
        </div>
      </div>

      <div className="p-6 pb-36 space-y-4">
        <Row cols="grid-cols-1 lg:grid-cols-2">
          <FormRow label="Bank Name *" error={errors['bankDetails.bankName']}>
            <Select
              value={formData.bankDetails?.bankName || ''}
              onValueChange={value => onFormChange('bankDetails', 'bankName', value)}
            >
              <SelectTrigger className={errors['bankDetails.bankName'] ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select bank" />
              </SelectTrigger>
              <SelectContent>
                {bankOptions.map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
          <FormRow label="Account Name *" error={errors['bankDetails.accountName']}>
            <Input
              type="text"
              required
              placeholder="Enter account holder's name"
              value={formData.bankDetails?.accountName || ''}
              onChange={e => onFormChange('bankDetails', 'accountName', e.target.value)}
              className={errors['bankDetails.accountName'] ? 'border-red-500' : ''}
            />
          </FormRow>
        </Row>

        <Row cols="grid-cols-1 lg:grid-cols-2">
          <FormRow label="Bank Sort Code">
            <Input
              type="text"
              placeholder="Enter bank sort code"
              value={formData.bankDetails?.bankSortCode || ''}
              onChange={e => onFormChange('bankDetails', 'bankSortCode', e.target.value)}
            />
          </FormRow>
          <FormRow label="Account Number *" error={errors['bankDetails.accountNumber']}>
            <Input
              type="text"
              required
              placeholder="10-digit account number"
              value={formData.bankDetails?.accountNumber || ''}
              onChange={e => onFormChange('bankDetails', 'accountNumber', e.target.value)}
              maxLength={10}
              minLength={10}
              className={errors['bankDetails.accountNumber'] ? 'border-red-500' : ''}
            />
          </FormRow>
        </Row>
      </div>
    </div>
  );
};
