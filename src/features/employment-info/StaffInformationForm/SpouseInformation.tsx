// src/features/employment-info/StaffInformationForm/SpouseInformation.tsx
import React from 'react';
import { Input } from '../../../components/ui/input';
import { NumberInput } from '../../../components/custom/NumberInput';
import FormRow from '../../../components/custom/FormRow';
import Row from '../../../components/custom/Row';
import { GoPeople } from 'react-icons/go';
import { IEmploymentInfo } from '../../../interfaces';
import { FormChangeHandler } from './types';

interface SpouseInformationProps {
  formData: IEmploymentInfo;
  onFormChange: FormChangeHandler;
}

export const SpouseInformation: React.FC<SpouseInformationProps> = ({ formData, onFormChange }) => {
  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <GoPeople className="h-5 w-5 text-blue-500" />
        <h3 className="text-md font-medium text-gray-900">Spouse Information</h3>
      </div>
      <div className="space-y-3">
        <Row cols="grid-cols-1 lg:grid-cols-2">
          <FormRow label="Spouse's Full Name">
            <Input
              type="text"
              placeholder="Enter spouse's full name"
              value={formData.personalDetails?.spouseName || ''}
              onChange={e => onFormChange('personalDetails', 'spouseName', e.target.value)}
            />
          </FormRow>
          <FormRow label="Spouse's Phone">
            <Input
              type="tel"
              placeholder="Enter spouse's phone number"
              value={formData.personalDetails?.spousePhone || ''}
              onChange={e => onFormChange('personalDetails', 'spousePhone', e.target.value)}
              maxLength={11}
            />
          </FormRow>
        </Row>
        <Row>
          <FormRow label="Spouse's Address" type="wide">
            <Input
              type="text"
              placeholder="Enter spouse's address"
              value={formData.personalDetails?.spouseAddress || ''}
              onChange={e => onFormChange('personalDetails', 'spouseAddress', e.target.value)}
            />
          </FormRow>
        </Row>
        <Row cols="grid-cols-1 lg:grid-cols-2">
          <FormRow label="Number of Children">
            <NumberInput
              inputSize="md"
              min={0}
              step={1}
              placeholder="Enter number of children"
              value={formData.personalDetails?.numberOfChildren || 0}
              onChange={value => onFormChange('personalDetails', 'numberOfChildren', value ?? 0)}
            />
          </FormRow>
        </Row>
      </div>
    </div>
  );
};
