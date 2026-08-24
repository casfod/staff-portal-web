// src/features/employment-info/StaffInformationForm/PersonalDetailsSection.tsx
import React from 'react';
import { Input } from '../../../components/ui/input';
// import { NumberInput } from "../../../components/custom/NumberInput";
import FormRow from '../../../components/custom/FormRow';
import Row from '../../../components/custom/Row';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import DatePicker from '../../../features/datePicker/DatePicker'; // ✅ FIXED: Use the fixed DatePicker
import { User, CheckCircle } from 'lucide-react';
import { maritalStatusOptions, nigeriaStateOptions, religionOptions } from './constants';
import { IEmploymentInfo } from '../../../interfaces';
import { SpouseInformation } from './SpouseInformation';
import { FormChangeHandler, FormErrors } from './types';

interface PersonalDetailsSectionProps {
  formData: IEmploymentInfo;
  errors: FormErrors;
  getLgaOptions: () => Array<{ id: string; name: string }>;
  onFormChange: FormChangeHandler;
  onDateChange: (section: keyof IEmploymentInfo, field: string, date: Date | null) => void;
  isCompleted: boolean;
}

export const PersonalDetailsSection: React.FC<PersonalDetailsSectionProps> = ({
  formData,
  errors,
  getLgaOptions,
  onFormChange,
  onDateChange,
  isCompleted,
}) => {
  const maritalStatus = formData.personalDetails?.maritalStatus;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Personal Details</h2>
          {isCompleted && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
        </div>
      </div>

      <div className="p-6 space-y-4">
        <Row cols="grid-cols-1 lg:grid-cols-2">
          <FormRow label="Full Name *" error={errors['personalDetails.fullName']}>
            <Input
              type="text"
              required
              placeholder="Enter your full name"
              value={formData.personalDetails?.fullName || ''}
              onChange={e => onFormChange('personalDetails', 'fullName', e.target.value)}
              className={errors['personalDetails.fullName'] ? 'border-red-500' : ''}
            />
          </FormRow>
          <FormRow label="Date of Birth">
            <DatePicker
              selected={formData.personalDetails?.birthDate || null}
              onChange={date => onDateChange('personalDetails', 'birthDate', date)}
              variant="secondary"
              placeholder="Select date of birth"
            />
          </FormRow>
        </Row>

        <Row cols="grid-cols-1 lg:grid-cols-2">
          <FormRow label="State of Origin">
            <Select
              value={formData.personalDetails?.stateOfOrigin || ''}
              onValueChange={value => onFormChange('personalDetails', 'stateOfOrigin', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {nigeriaStateOptions.map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
          {formData.personalDetails?.stateOfOrigin && (
            <FormRow label="LGA">
              <Select
                value={formData.personalDetails?.lga || ''}
                onValueChange={value => onFormChange('personalDetails', 'lga', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select LGA" />
                </SelectTrigger>
                <SelectContent>
                  {getLgaOptions().map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormRow>
          )}
        </Row>

        <Row cols="grid-cols-1 lg:grid-cols-2">
          <FormRow label="Religion">
            <Select
              value={formData.personalDetails?.religion || ''}
              onValueChange={value => onFormChange('personalDetails', 'religion', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select religion" />
              </SelectTrigger>
              <SelectContent>
                {religionOptions.map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
          <FormRow label="Marital Status">
            <Select
              value={formData.personalDetails?.maritalStatus || ''}
              onValueChange={value => onFormChange('personalDetails', 'maritalStatus', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select marital status" />
              </SelectTrigger>
              <SelectContent>
                {maritalStatusOptions.map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
        </Row>

        <Row cols="grid-cols-1 lg:grid-cols-2">
          <FormRow label="Gender">
            <Select
              value={formData.personalDetails?.gender || ''}
              onValueChange={value => onFormChange('personalDetails', 'gender', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                {[
                  { id: 'Male', name: 'Male' },
                  { id: 'Female', name: 'Female' },
                ].map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
        </Row>

        <Row>
          <FormRow
            label="Residential Address *"
            type="wide"
            error={errors['personalDetails.address']}
          >
            <textarea
              className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3 w-full"
              maxLength={4000}
              value={formData.personalDetails?.address || ''}
              onChange={e => onFormChange('personalDetails', 'address', e.target.value)}
            />
          </FormRow>
        </Row>

        <Row cols="grid-cols-1 lg:grid-cols-2">
          <FormRow label="Home Phone">
            <Input
              type="tel"
              placeholder="Enter home phone number"
              value={formData.personalDetails?.homePhone || ''}
              onChange={e => onFormChange('personalDetails', 'homePhone', e.target.value)}
            />
          </FormRow>
          <FormRow label="Cell Phone *" error={errors['personalDetails.cellPhone']}>
            <Input
              type="tel"
              required
              placeholder="Enter mobile phone number"
              value={formData.personalDetails?.cellPhone || ''}
              onChange={e => onFormChange('personalDetails', 'cellPhone', e.target.value)}
              maxLength={11}
              className={errors['personalDetails.cellPhone'] ? 'border-red-500' : ''}
            />
          </FormRow>
        </Row>

        <Row cols="grid-cols-1 lg:grid-cols-2">
          <FormRow label="Personal Email">
            <Input
              type="email"
              placeholder="Enter personal email address"
              value={formData.personalDetails?.emailAddress || ''}
              onChange={e => onFormChange('personalDetails', 'emailAddress', e.target.value)}
            />
          </FormRow>
          <FormRow label="NIN Number *" error={errors['personalDetails.ninNumber']}>
            <Input
              type="text"
              required
              placeholder="Enter 11-digit NIN number"
              value={formData.personalDetails?.ninNumber || ''}
              onChange={e => onFormChange('personalDetails', 'ninNumber', e.target.value)}
              maxLength={11}
              className={errors['personalDetails.ninNumber'] ? 'border-red-500' : ''}
            />
          </FormRow>
        </Row>

        {maritalStatus === 'Married' && (
          <SpouseInformation formData={formData} onFormChange={onFormChange} />
        )}
      </div>
    </div>
  );
};
