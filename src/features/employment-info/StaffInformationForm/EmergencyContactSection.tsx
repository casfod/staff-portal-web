// src/features/employment-info/StaffInformationForm/EmergencyContactSection.tsx
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
import { Phone, CheckCircle } from 'lucide-react';
import { relationshipOptions } from './constants';
import { IEmploymentInfo } from '../../../interfaces';
import { FormChangeHandler, FormErrors } from './types';

interface EmergencyContactSectionProps {
  formData: IEmploymentInfo;
  errors: FormErrors;
  onFormChange: FormChangeHandler;
  isCompleted: boolean;
}

export const EmergencyContactSection: React.FC<EmergencyContactSectionProps> = ({
  formData,
  errors,
  onFormChange,
  isCompleted,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Emergency Contact</h2>
          {isCompleted && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
        </div>
      </div>

      <div className="p-6 space-y-4">
        <Row cols="grid-cols-1 lg:grid-cols-2">
          <FormRow label="Relationship *" error={errors['emergencyContact.relationship']}>
            <Select
              value={formData.emergencyContact?.relationship || ''}
              onValueChange={value => onFormChange('emergencyContact', 'relationship', value)}
            >
              <SelectTrigger
                className={errors['emergencyContact.relationship'] ? 'border-red-500' : ''}
              >
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                {relationshipOptions.map(option => (
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
            label="Emergency Contact Full Name *"
            type="wide"
            error={errors['emergencyContact.fullName']}
          >
            <Input
              type="text"
              required
              placeholder="Enter emergency contact's full name"
              value={formData.emergencyContact?.fullName || ''}
              onChange={e => onFormChange('emergencyContact', 'fullName', e.target.value)}
              className={errors['emergencyContact.fullName'] ? 'border-red-500' : ''}
            />
          </FormRow>
        </Row>

        <Row>
          <FormRow
            label="Emergency Contact Address *"
            type="wide"
            error={errors['emergencyContact.address']}
          >
            <textarea
              className="border-2 h-32 min-h-32 rounded-lg focus:outline-none p-3 w-full"
              maxLength={4000}
              required
              value={formData.emergencyContact?.address || ''}
              onChange={e => onFormChange('emergencyContact', 'address', e.target.value)}
            />
          </FormRow>
        </Row>

        <Row cols="grid-cols-1 lg:grid-cols-2">
          <FormRow label="Primary Phone *" error={errors['emergencyContact.primaryPhone']}>
            <Input
              type="tel"
              required
              placeholder="Enter primary phone number"
              value={formData.emergencyContact?.primaryPhone || ''}
              onChange={e => onFormChange('emergencyContact', 'primaryPhone', e.target.value)}
              maxLength={11}
              className={errors['emergencyContact.primaryPhone'] ? 'border-red-500' : ''}
            />
          </FormRow>
          <FormRow label="Alternate Phone">
            <Input
              type="tel"
              placeholder="Enter alternate phone number"
              value={formData.emergencyContact?.cellPhone || ''}
              onChange={e => onFormChange('emergencyContact', 'cellPhone', e.target.value)}
              maxLength={11}
            />
          </FormRow>
        </Row>
      </div>
    </div>
  );
};
