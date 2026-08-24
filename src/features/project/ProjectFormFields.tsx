// ProjectFormFields.tsx - Optimized with Radix UI
import { IProject, IFile, IMilestone } from '../../interfaces';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { NumberInput } from '../../components/custom/NumberInput';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Loader2, Plus, X } from 'lucide-react';
import DatePicker from '../datePicker/DatePicker'; // ✅ Fixed import
import { sectorOptions } from './projectFormOptions';
import React from 'react';

interface ProjectFormFieldsProps {
  formData: IProject;
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  handleFormChange: (field: keyof IProject, value: string | string[] | number) => void;
  handleNestedChange: (
    parentField: keyof IProject,
    field: string,
    value: Date | string | number | null
  ) => void;
  handleSectorChange: (
    index: number,
    field: keyof IProject['sectors'][0],
    value: string | number
  ) => void;
  handleAccountCodeChange: (
    index: number,
    field: keyof IProject['accountCodes'][0],
    value: string
  ) => void;
  addSector: () => void;
  removeSector: (index: number) => void;
  addAccountCode: () => void;
  removeAccountCode: (index: number) => void;
  addMilestone: () => void;
  removeMilestone: (index: number) => void;
  updateMilestone: (index: number, field: keyof IMilestone, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  submitLabel: string;
  submitSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  existingFiles?: IFile[];
}

const FormRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">{label}</Label>
    {children}
  </div>
);

const ProjectFormFields = ({
  formData,
  handleFormChange,
  handleNestedChange,
  handleSectorChange,
  handleAccountCodeChange,
  addSector,
  removeSector,
  addAccountCode,
  removeAccountCode,
  addMilestone,
  removeMilestone,
  updateMilestone,
  onSubmit,
  isPending,
  submitLabel,
  submitSize = 'md',
}: ProjectFormFieldsProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Project Title and Donor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Project Title *">
          <Input
            inputSize="sm"
            type="text"
            required
            value={formData.projectTitle}
            onChange={e => handleFormChange('projectTitle', e.target.value)}
          />
        </FormRow>

        <FormRow label="Donor *">
          <Input
            inputSize="sm"
            type="text"
            required
            value={formData.donor}
            onChange={e => handleFormChange('donor', e.target.value)}
          />
        </FormRow>
      </div>

      {/* Project Code and Partners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Project Code *">
          <Input
            inputSize="sm"
            type="text"
            required
            value={formData.projectCode}
            onChange={e => handleFormChange('projectCode', e.target.value)}
          />
        </FormRow>

        <FormRow label="Project Partner(s) *">
          <Input
            inputSize="sm"
            type="text"
            required
            value={formData.projectPartners.join(', ')}
            onChange={e => handleFormChange('projectPartners', e.target.value.split(', '))}
          />
        </FormRow>
      </div>

      {/* Project Budget and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Project Budget *">
          <NumberInput
            inputSize="sm"
            min={0}
            step={0.01}
            required
            value={formData.projectBudget}
            onChange={value => handleFormChange('projectBudget', value ?? 0)}
            placeholder="0.00"
          />
        </FormRow>

        <FormRow label="Status">
          <Select
            value={formData.status || 'ongoing'}
            onValueChange={value => handleFormChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </FormRow>
      </div>

      {/* Account Codes Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Account Codes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-4 border rounded-lg">
          {formData.accountCodes.map((account, index) => (
            <div key={index} className="relative bg-gray-50 p-4 rounded-lg border shadow-sm">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => removeAccountCode(index)}
              >
                <X className="h-4 w-4" />
              </Button>
              <FormRow label={`Account Code ${index + 1} *`}>
                <Input
                  inputSize="sm"
                  type="text"
                  required
                  value={account.name}
                  onChange={e => handleAccountCodeChange(index, 'name', e.target.value)}
                />
              </FormRow>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">
            {formData.accountCodes.length} account{formData.accountCodes.length > 1 ? 's' : ''}{' '}
            added
          </p>

          <Button type="button" variant="outline" size="sm" onClick={addAccountCode}>
            <Plus className="h-4 w-4 mr-1" /> Add Account
          </Button>
        </div>
      </div>

      {/* Sectors Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Sectors</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-4 border rounded-lg">
          {formData.sectors.map((sector, index) => (
            <div key={index} className="relative bg-gray-50 p-4 rounded-lg border shadow-sm">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => removeSector(index)}
              >
                <X className="h-4 w-4" />
              </Button>
              <h4 className="text-xs font-semibold text-gray-500 mb-3">SECTOR {index + 1}</h4>
              <FormRow label="Sector Name *">
                <Select
                  value={sector.name}
                  onValueChange={value => handleSectorChange(index, 'name', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectorOptions.map(option => (
                      <SelectItem key={option.name} value={option.name}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormRow>

              <FormRow label="Percentage *">
                <NumberInput
                  inputSize="sm"
                  min={0}
                  max={100}
                  step={0.1}
                  required
                  value={sector.percentage}
                  onChange={value => handleSectorChange(index, 'percentage', value ?? 0)}
                  placeholder="0"
                />
              </FormRow>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">
            {formData.sectors.length} sector{formData.sectors.length > 1 ? 's' : ''} added
          </p>

          <Button type="button" variant="outline" size="sm" onClick={addSector}>
            <Plus className="h-4 w-4 mr-1" /> Add Sector
          </Button>
        </div>
      </div>

      {/* Milestones Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Milestones</h3>

        <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto p-4 border rounded-lg">
          {(formData.milestones || []).map((milestone, index) => (
            <div key={index} className="relative bg-gray-50 p-4 rounded-lg border shadow-sm">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => removeMilestone(index)}
              >
                <X className="h-4 w-4" />
              </Button>
              <h4 className="text-xs font-semibold text-gray-500 mb-3">MILESTONE {index + 1}</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormRow label="Milestone Title *">
                  <Input
                    inputSize="sm"
                    type="text"
                    required
                    value={milestone.title}
                    onChange={e => updateMilestone(index, 'title', e.target.value)}
                  />
                </FormRow>

                <FormRow label="Status">
                  <Select
                    value={milestone.status || 'pending'}
                    onValueChange={value => updateMilestone(index, 'status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </FormRow>
              </div>

              <FormRow label="Description">
                <textarea
                  className="w-full min-h-[120px] p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  maxLength={1000}
                  required
                  value={milestone.description || ''}
                  onChange={e => updateMilestone(index, 'description', e.target.value)}
                />
              </FormRow>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">
            {(formData.milestones || []).length} milestone
            {(formData.milestones || []).length > 1 ? 's' : ''} added
          </p>

          <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
            <Plus className="h-4 w-4 mr-1" /> Add Milestone
          </Button>
        </div>
      </div>

      {/* Project Locations and Beneficiaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Project Locations *">
          <Input
            inputSize="sm"
            type="text"
            required
            value={formData.projectLocations.join(', ')}
            onChange={e => handleFormChange('projectLocations', e.target.value.split(', '))}
          />
        </FormRow>

        <FormRow label="Target Beneficiaries *">
          <Input
            inputSize="sm"
            type="text"
            required
            value={formData.targetBeneficiaries.join(', ')}
            onChange={e => handleFormChange('targetBeneficiaries', e.target.value.split(', '))}
          />
        </FormRow>
      </div>

      {/* Project Objectives */}
      <FormRow label="Project Objectives *">
        <textarea
          className="w-full min-h-[120px] p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          maxLength={4000}
          required
          value={formData.projectObjectives}
          onChange={e => handleFormChange('projectObjectives', e.target.value)}
        />
      </FormRow>

      {/* Implementation Period */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Implementation Period (From) *">
          <DatePicker
            selected={formData.implementationPeriod.from || null}
            onChange={date =>
              handleNestedChange('implementationPeriod', 'from', date ? date.toISOString() : null)
            }
            variant="secondary"
            placeholder="Select date"
          />
        </FormRow>

        {formData.implementationPeriod.from && (
          <FormRow label="Implementation Period (To) *">
            <DatePicker
              selected={formData.implementationPeriod.to || null}
              onChange={date =>
                handleNestedChange('implementationPeriod', 'to', date ? date.toISOString() : null)
              }
              variant="secondary"
              placeholder="Select date"
              minDate={formData.implementationPeriod.from}
              requiredTrigger={!!formData.implementationPeriod.from}
            />
          </FormRow>
        )}
      </div>

      {/* Project Summary */}
      <FormRow label="Project Summary *">
        <textarea
          className="w-full min-h-[120px] p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          maxLength={4000}
          required
          value={formData.projectSummary}
          onChange={e => handleFormChange('projectSummary', e.target.value)}
        />
      </FormRow>

      {/* Submit Button */}
      <div className="flex justify-center w-full gap-4 pt-4 border-t">
        <Button type="submit" size={submitSize} disabled={isPending} className="min-w-[150px]">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {submitLabel === 'Submit' ? 'Submitting...' : 'Updating...'}
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
};

export default React.memo(ProjectFormFields);
