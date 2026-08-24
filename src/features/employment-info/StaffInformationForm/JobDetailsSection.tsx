// src/features/employment-info/StaffInformationForm/JobDetailsSection.tsx
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
import DatePicker from '../../../features/datePicker/DatePicker'; // ✅ FIXED: Use the fixed DatePicker
import SpinnerMini from '../../../components/custom/SpinnerMini';
import { Briefcase, CheckCircle } from 'lucide-react';
import { IEmploymentInfo } from '../../../interfaces';
import { FormChangeHandler, FormErrors } from './types';

interface JobDetailsSectionProps {
  formData: IEmploymentInfo;
  errors: FormErrors;
  isLoadingUsers: boolean;
  userOptions: Array<{ id: string; name: string }>;
  getSelectedsupervisor: () => string;
  handleSupervisorChange: (selectedId: string) => void;
  onFormChange: FormChangeHandler;
  onDateChange: (section: keyof IEmploymentInfo, field: string, date: Date | null) => void;
  isCompleted: boolean;
}

export const JobDetailsSection: React.FC<JobDetailsSectionProps> = ({
  formData,
  errors,
  isLoadingUsers,
  userOptions,
  getSelectedsupervisor,
  handleSupervisorChange,
  onFormChange,
  onDateChange,
  isCompleted,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Job Information</h2>
          {isCompleted && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
        </div>
      </div>

      <div className="p-6 space-y-4">
        <Row cols="grid-cols-1 lg:grid-cols-2">
          <FormRow label="Job Title *" error={errors['jobDetails.title']}>
            <Input
              type="text"
              required
              placeholder="Enter job title"
              value={formData.jobDetails?.title || ''}
              onChange={e => onFormChange('jobDetails', 'title', e.target.value)}
              className={errors['jobDetails.title'] ? 'border-red-500' : ''}
            />
          </FormRow>
          <FormRow label="Supervisor">
            {isLoadingUsers ? (
              <SpinnerMini />
            ) : (
              <Select value={getSelectedsupervisor()} onValueChange={handleSupervisorChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {userOptions.map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormRow>
        </Row>

        <Row cols="grid-cols-1 lg:grid-cols-2">
          <FormRow label="Staff Tax ID No.">
            <Input
              type="text"
              placeholder="Enter staff Tax ID number"
              value={formData.jobDetails?.staffTaxIdNo || ''}
              onChange={e => onFormChange('jobDetails', 'staffTaxIdNo', e.target.value)}
            />
          </FormRow>
          <FormRow label="Staff ID No.">
            <Input
              type="text"
              placeholder="Enter staff ID number"
              value={formData.jobDetails?.idNo || ''}
              onChange={e => onFormChange('jobDetails', 'idNo', e.target.value)}
            />
          </FormRow>
        </Row>

        <Row cols="grid-cols-1 lg:grid-cols-2">
          <FormRow label="Work Location">
            <Input
              type="text"
              placeholder="Enter work location"
              value={formData.jobDetails?.workLocation || ''}
              onChange={e => onFormChange('jobDetails', 'workLocation', e.target.value)}
            />
          </FormRow>
          <FormRow label="Work Email">
            <Input
              type="email"
              placeholder="Enter work email address"
              value={formData.jobDetails?.workEmail || ''}
              onChange={e => onFormChange('jobDetails', 'workEmail', e.target.value)}
            />
          </FormRow>
        </Row>

        <Row cols="grid-cols-1 lg:grid-cols-2">
          <FormRow label="Work Phone">
            <Input
              type="tel"
              placeholder="Enter work phone number"
              value={formData.jobDetails?.workPhone || ''}
              onChange={e => onFormChange('jobDetails', 'workPhone', e.target.value)}
            />
          </FormRow>
          <FormRow label="Work Cell Phone">
            <Input
              type="tel"
              placeholder="Enter work mobile number"
              value={formData.jobDetails?.workCellPhone || ''}
              onChange={e => onFormChange('jobDetails', 'workCellPhone', e.target.value)}
            />
          </FormRow>
        </Row>

        <Row cols="grid-cols-1 lg:grid-cols-2">
          <FormRow label="Start Date *" error={errors['jobDetails.startDate']}>
            <DatePicker
              selected={formData.jobDetails?.startDate || null}
              onChange={date => onDateChange('jobDetails', 'startDate', date)}
              variant="secondary"
              placeholder="Select start date"
            />
          </FormRow>
          <FormRow label="End Date (if applicable)">
            <DatePicker
              selected={formData.jobDetails?.endDate || null}
              onChange={date => onDateChange('jobDetails', 'endDate', date)}
              variant="secondary"
              placeholder="Select end date"
            />
          </FormRow>
        </Row>
      </div>
    </div>
  );
};
