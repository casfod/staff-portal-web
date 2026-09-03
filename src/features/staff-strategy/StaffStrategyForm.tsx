// src/features/staff-strategy/StaffStrategyForm.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { Loader2, Plus, Trash2, User, Clock } from 'lucide-react';

// Radix UI Components
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

import FormRow from '../../components/custom/FormRow';

// Hooks
import {
  useCreateStaffStrategy,
  useSaveStaffStrategyDraft,
  useUpdateStaffStrategy,
  useSubmitStaffStrategyDraft,
} from './Hooks/useStaffStrategy';
import { localStorageUser } from '../../utils/localStorageUser';

// Types
import { IStaffStrategy, IObjective, IAccountabilityArea, StrategyStatus, IUser } from '../../interfaces';

// Constants
const PERIOD_OPTIONS = [
  { id: 'January - March', name: 'January - March (Q1)' },
  { id: 'April - June', name: 'April - June (Q2)' },
  { id: 'July - September', name: 'July - September (Q3)' },
  { id: 'October - December', name: 'October - December (Q4)' },
];

const TIMELINE_OPTIONS = [
  { id: 'Routine', name: 'Routine' },
  { id: 'Monthly', name: 'Monthly' },
  { id: 'Quarterly', name: 'Quarterly' },
  { id: 'Annually', name: 'Annually' },
];

// Helper to get default objective
const getDefaultObjective = (): IObjective => ({
  objective: '',
  timeline: 'Routine',
  expectedOutcome: '',
  kpi: '',
  possibleChallenges: '',
  supportRequired: '',
});

// Helper to get default accountability area
const getDefaultAccountabilityArea = (): IAccountabilityArea => ({
  areaName: '',
  objectives: [getDefaultObjective()],
});

// Helper to get ID from string | IUser
const getId = (value: string | IUser | Partial<IUser> | undefined): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.id || '';
};

// Helper to format a populated user ref (or plain string) as a display name
const getSupervisorName = (supervisor: string | Partial<IUser> | undefined): string => {
  if (!supervisor) return '';
  if (typeof supervisor === 'string') return supervisor;
  return `${supervisor.firstName || ''} ${supervisor.lastName || ''}`.trim();
};

// Form Data Type
// staffName/jobTitle/supervisor are intentionally absent: they were
// display-only, always derived from currentUser/initialData, and were
// never independently editable. The backend derives them from the
// populated staffId/approvedBy refs, so there's nothing to submit.
type StaffStrategyFormData = Partial<Omit<IStaffStrategy, 'staffId' | 'approvedBy'>> & {
  staffId: string;
  approvedBy: string | null;
};

interface StaffStrategyFormProps {
  mode: 'create' | 'edit';
  initialData?: IStaffStrategy | null;
}

// Helper to check if a field should be editable
const isFieldEditable = (
  mode: 'create' | 'edit',
  status: StrategyStatus | undefined,
  isAdmin: boolean
): boolean => {
  if (mode === 'create') return true;
  if (status === 'draft' || status === 'rejected') return true;
  if (status === 'pending' && isAdmin) return true;
  return false;
};

const StaffStrategyForm: React.FC<StaffStrategyFormProps> = ({ mode, initialData }) => {
  const currentUser = localStorageUser();

  // Determine user role
  const isAdmin = ['SUPER-ADMIN', 'ADMIN'].includes(currentUser?.role || '');
  const isCreator = mode === 'edit' ? initialData?.createdBy?.id === currentUser?.id : true;

  // Determine editability
  const requestStatus = initialData?.status;
  const canEdit = mode === 'create' || isFieldEditable(mode, requestStatus, isAdmin);
  const canSubmit = mode === 'create' || (isCreator && (requestStatus === 'draft' || requestStatus === 'rejected'));
  const isViewOnly = mode === 'edit' && !canEdit;

  // Form State
  const [formData, setFormData] = useState<StaffStrategyFormData>(() => {
    if (mode === 'edit' && initialData) {
      return {
        staffId: getId(initialData.staffId),
        department: initialData.department || '',
        period: initialData.period || '',
        accountabilityAreas: initialData.accountabilityAreas || [getDefaultAccountabilityArea()],
        approvedBy: initialData.approvedBy 
          ? getId(initialData.approvedBy)
          : null,
      };
    }

    return {
      staffId: currentUser?.id || '',
      department: '',
      period: '',
      accountabilityAreas: [getDefaultAccountabilityArea()],
      approvedBy: null,
    };
  });

  // Display-only values — always derived fresh from currentUser/initialData
  // rather than round-tripped through form state, so they can't drift.
  const staffDisplayName = `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'N/A';
  const staffDisplayTitle = currentUser?.employmentInfo?.jobDetails?.title || 'N/A';
  const supervisorDisplayName =
    mode === 'edit' && initialData?.approvedBy
      ? getSupervisorName(initialData.approvedBy)
      : getSupervisorName(currentUser?.employmentInfo?.jobDetails?.supervisorId) || 'N/A';

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Hooks
  const { createStaffStrategy, isPending: isCreating } = useCreateStaffStrategy();
  const { saveStaffStrategyDraft, isPending: isSaving } = useSaveStaffStrategyDraft();
  const { updateStaffStrategy, isPending: isUpdating } = useUpdateStaffStrategy(
    mode === 'edit' ? initialData?.id || '' : ''
  );
  const { submitStaffStrategyDraft, isPending: isSubmitting } = useSubmitStaffStrategyDraft();

  const isPending = mode === 'create' ? isCreating || isSaving : isUpdating || isSubmitting;

  // Check if form is valid for submission
  const isFormValid = useMemo(() => {
    const hasValidDepartment = !!formData.department?.trim();
    const hasValidPeriod = !!formData.period;
    const hasValidAreas = formData.accountabilityAreas?.every(
      area => area.areaName?.trim() && area.objectives?.length > 0
    );
    const hasValidObjectives = formData.accountabilityAreas?.every(area =>
      area.objectives.every(
        obj => obj.objective?.trim() && obj.expectedOutcome?.trim() && obj.kpi?.trim()
      )
    );
    return hasValidDepartment && hasValidPeriod && hasValidAreas && hasValidObjectives;
  }, [formData.department, formData.period, formData.accountabilityAreas]);

  // Validation
  const validateField = useCallback((name: string, value: unknown): string => {
    switch (name) {
      case 'department':
        return !value ? 'Department is required' : '';
      case 'period':
        return !value ? 'Period is required' : '';
      default:
        return '';
    }
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.department?.trim()) newErrors.department = 'Department is required';
    if (!formData.period) newErrors.period = 'Period is required';

    const hasEmptyAreas = formData.accountabilityAreas?.some(area => !area.areaName?.trim());
    if (hasEmptyAreas) {
      newErrors.accountabilityAreas = 'Please fill in all accountability area names';
    }

    const hasEmptyObjectives = formData.accountabilityAreas?.some(area =>
      area.objectives.some(
        obj => !obj.objective?.trim() || !obj.expectedOutcome?.trim() || !obj.kpi?.trim()
      )
    );
    if (hasEmptyObjectives) {
      newErrors.objectives = 'Please fill in all required objective fields';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.department, formData.period, formData.accountabilityAreas]);

  // Handlers
  const handleBlur = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field as keyof StaffStrategyFormData]);
    setErrors(prev => ({ ...prev, [field]: error }));
  }, [formData, validateField]);

  const handleFormChange = useCallback(
    <K extends keyof StaffStrategyFormData>(field: K, value: StaffStrategyFormData[K]) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (touched[field as string]) {
        const error = validateField(field as string, value);
        setErrors(prev => ({ ...prev, [field as string]: error }));
      }
    },
    [touched, validateField]
  );

  // Accountability Area handlers
  const handleAreaChange = useCallback((areaIndex: number, value: string) => {
    setFormData(prev => {
      const updatedAreas = [...(prev.accountabilityAreas || [])];
      updatedAreas[areaIndex] = {
        ...updatedAreas[areaIndex],
        areaName: value,
      };
      return { ...prev, accountabilityAreas: updatedAreas };
    });
  }, []);

  const addArea = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      accountabilityAreas: [...(prev.accountabilityAreas || []), getDefaultAccountabilityArea()],
    }));
  }, []);

  const removeArea = useCallback((areaIndex: number) => {
    setFormData(prev => {
      const areas = prev.accountabilityAreas || [];
      if (areas.length <= 1) return prev;
      return {
        ...prev,
        accountabilityAreas: areas.filter((_, i) => i !== areaIndex),
      };
    });
  }, []);

  // Objective handlers
  const handleObjectiveChange = useCallback(
    (areaIndex: number, objIndex: number, field: keyof IObjective, value: string) => {
      setFormData(prev => {
        const updatedAreas = [...(prev.accountabilityAreas || [])];
        const updatedObjectives = [...updatedAreas[areaIndex].objectives];
        updatedObjectives[objIndex] = {
          ...updatedObjectives[objIndex],
          [field]: value,
        };
        updatedAreas[areaIndex].objectives = updatedObjectives;
        return { ...prev, accountabilityAreas: updatedAreas };
      });
    },
    []
  );

  const addObjective = useCallback((areaIndex: number) => {
    setFormData(prev => {
      const updatedAreas = [...(prev.accountabilityAreas || [])];
      updatedAreas[areaIndex].objectives.push(getDefaultObjective());
      return { ...prev, accountabilityAreas: updatedAreas };
    });
  }, []);

  const removeObjective = useCallback((areaIndex: number, objIndex: number) => {
    setFormData(prev => {
      const updatedAreas = [...(prev.accountabilityAreas || [])];
      const objectives = updatedAreas[areaIndex].objectives;
      if (objectives.length <= 1) return prev;
      updatedAreas[areaIndex].objectives = objectives.filter((_, i) => i !== objIndex);
      return { ...prev, accountabilityAreas: updatedAreas };
    });
  }, []);

  // Submit Handlers
// Submit Handlers
const buildSubmitData = useCallback((): Partial<IStaffStrategy> => {
  // Helper to convert string to Partial<IUser>
  const toPartialUser = (value: string | undefined): Partial<IUser> | undefined => {
    if (!value) return undefined;
    // If it's already an object with an id, return it as is
    if (typeof value !== 'string') return value;
    // Otherwise, create a Partial<IUser> with the id
    return { id: value } as Partial<IUser>;
  };

  return {
    staffId: formData.staffId,
    department: formData.department,
    period: formData.period,
    accountabilityAreas: formData.accountabilityAreas || [],
    // Convert approvedBy string to Partial<IUser>. If left blank, the
    // backend falls back to currentUser.employmentInfo.jobDetails.supervisorId.
    approvedBy: toPartialUser(formData.approvedBy || undefined),
  };
}, [formData]);

  const handleSaveDraft = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (mode === 'create') {
        const data = buildSubmitData();
        saveStaffStrategyDraft(data);
      } else {
        const data = buildSubmitData();
        updateStaffStrategy({ data });
      }
    },
    [buildSubmitData, mode, saveStaffStrategyDraft, updateStaffStrategy]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      if (mode === 'create') {
        const data = buildSubmitData();
        createStaffStrategy({ data });
      } else {
        submitStaffStrategyDraft({ strategyId: initialData?.id || '',});
      }
    },
    [buildSubmitData, createStaffStrategy, mode, submitStaffStrategyDraft, validateForm, initialData?.id]
  );

  // Get submit button label
  const getSubmitLabel = useCallback(() => {
    if (isPending) {
      return mode === 'create' ? 'Creating...' : 'Updating...';
    }
    if (mode === 'create') {
      return 'Submit for Approval';
    }
    if (requestStatus === 'draft' || requestStatus === 'rejected') {
      return 'Submit for Approval';
    }
    return 'Update Strategy';
  }, [isPending, mode, requestStatus]);

  // Check profile completion for create mode
  if (mode === 'create' && !currentUser?.employmentInfo?.isProfileComplete) {
    return (
      <div className="text-center py-12">
        <div className="text-amber-500 text-lg font-semibold">
          Please complete your employment info to access staff strategy form.
        </div>
      </div>
    );
  }

  // Show view-only message for edit mode when user can't edit
  if (isViewOnly) {
    return (
      <div className="text-center py-8">
        <div className="text-amber-500 text-lg font-semibold">
          This staff strategy cannot be edited because it is{' '}
          <span className="uppercase">{requestStatus}</span>.
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Only draft, rejected, or pending (for admins) strategies can be edited.
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-6" noValidate>
      {/* Role and Status Indicator */}
      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <User className="h-5 w-5 text-blue-600" />
        <span className="text-sm text-blue-800">
          You are {mode === 'create' ? 'creating' : 'editing'} as:{' '}
          <span className="font-semibold">Staff Member</span>
          {isAdmin && mode === 'edit' && (
            <span className="ml-2 text-xs text-purple-600">(Admin override)</span>
          )}
        </span>
        {mode === 'edit' && requestStatus && (
          <div className="ml-auto flex items-center gap-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-xs text-gray-600">
              Status: <span className="font-semibold uppercase">{requestStatus}</span>
            </span>
          </div>
        )}
      </div>

      {/* Staff Information */}
      <div className="rounded-lg p-4 border bg-white border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300">
          STAFF INFORMATION
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormRow label="Staff Name">
            <Input
              type="text"
              value={staffDisplayName}
              disabled
              className="bg-gray-100"
            />
          </FormRow>

          <FormRow label="Job Title">
            <Input
              type="text"
              value={staffDisplayTitle}
              disabled
              className="bg-gray-100"
            />
          </FormRow>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <FormRow 
            label="Department *" 
            error={touched.department ? errors.department : undefined}
          >
            <Input
              type="text"
              required
              value={formData.department}
              onChange={e => handleFormChange('department', e.target.value)}
              onBlur={() => handleBlur('department')}
              placeholder="Enter department"
              disabled={!canEdit}
              className={errors.department && touched.department ? 'border-red-500' : ''}
            />
          </FormRow>

          <FormRow 
            label="Period *"
            error={touched.period ? errors.period : undefined}
          >
            {canEdit ? (
              <Select
                value={formData.period || ''}
                onValueChange={(value: string) => handleFormChange('period', value)}
                disabled={isPending}
              >
                <SelectTrigger
                  className={errors.period && touched.period ? 'border-red-500' : ''}
                >
                  <SelectValue placeholder="Select Period" />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map(period => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                type="text"
                value={formData.period}
                disabled
                className="bg-gray-100"
              />
            )}
          </FormRow>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <FormRow label="Supervisor">
            <Input
              type="text"
              value={supervisorDisplayName}
              disabled
              className="bg-gray-100"
            />
          </FormRow>
        </div>
      </div>

      {/* Accountability Areas Section */}
      <div className="rounded-lg p-4 border bg-white border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300">
          ACCOUNTABILITY AREAS & OBJECTIVES *
        </h3>

        <div className="space-y-6">
          {formData.accountabilityAreas?.map((area, areaIndex) => (
            <div key={areaIndex} className="space-y-4 border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-gray-700">
                  Accountability Area {areaIndex + 1}
                </h4>
                {formData.accountabilityAreas!.length > 1 && canEdit && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => removeArea(areaIndex)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <FormRow 
                label="Area Name *"
                error={errors.accountabilityAreas && !area.areaName?.trim() ? 'Area name is required' : undefined}
              >
                <Input
                  type="text"
                  value={area.areaName}
                  onChange={e => handleAreaChange(areaIndex, e.target.value)}
                  placeholder="e.g., Program Delivery, Financial Management"
                  required
                  disabled={!canEdit || isPending}
                  className={!area.areaName?.trim() && touched.accountabilityAreas ? 'border-red-500' : ''}
                />
              </FormRow>

              {/* Objectives */}
              <div className="space-y-4 pl-4 border-l-2 border-gray-300">
                <h5 className="font-medium text-gray-600">Objectives</h5>
                {area.objectives.map((objective, objIndex) => (
                  <div key={objIndex} className="space-y-3 border rounded p-3 bg-white">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Objective {objIndex + 1}</span>
                      {area.objectives.length > 1 && canEdit && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => removeObjective(areaIndex, objIndex)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    <FormRow 
                      label="Objective *"
                      error={errors.objectives && !objective.objective?.trim() ? 'Objective is required' : undefined}
                    >
                      <textarea
                        className={`w-full min-h-[60px] p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm ${
                          !objective.objective?.trim() && touched.objectives ? 'border-red-500' : ''
                        }`}
                        value={objective.objective}
                        onChange={e =>
                          handleObjectiveChange(areaIndex, objIndex, 'objective', e.target.value)
                        }
                        required
                        disabled={!canEdit || isPending}
                      />
                    </FormRow>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FormRow label="Timeline">
                        {canEdit ? (
                          <Select
                            value={objective.timeline}
                            onValueChange={(value: string) =>
                              handleObjectiveChange(areaIndex, objIndex, 'timeline', value)
                            }
                            disabled={isPending}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Timeline" />
                            </SelectTrigger>
                            <SelectContent>
                              {TIMELINE_OPTIONS.map(option => (
                                <SelectItem key={option.id} value={option.id}>
                                  {option.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type="text"
                            value={objective.timeline}
                            disabled
                            className="bg-gray-100"
                          />
                        )}
                      </FormRow>
                    </div>

                    <FormRow 
                      label="Expected Outcome *"
                      error={errors.objectives && !objective.expectedOutcome?.trim() ? 'Expected outcome is required' : undefined}
                    >
                      <textarea
                        className={`w-full min-h-[60px] p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm ${
                          !objective.expectedOutcome?.trim() && touched.objectives ? 'border-red-500' : ''
                        }`}
                        value={objective.expectedOutcome}
                        onChange={e =>
                          handleObjectiveChange(areaIndex, objIndex, 'expectedOutcome', e.target.value)
                        }
                        required
                        disabled={!canEdit || isPending}
                      />
                    </FormRow>

                    <FormRow 
                      label="KPI *"
                      error={errors.objectives && !objective.kpi?.trim() ? 'KPI is required' : undefined}
                    >
                      <textarea
                        className={`w-full min-h-[60px] p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm ${
                          !objective.kpi?.trim() && touched.objectives ? 'border-red-500' : ''
                        }`}
                        value={objective.kpi}
                        onChange={e =>
                          handleObjectiveChange(areaIndex, objIndex, 'kpi', e.target.value)
                        }
                        required
                        disabled={!canEdit || isPending}
                      />
                    </FormRow>

                    <FormRow label="Possible Challenges">
                      <textarea
                        className="w-full min-h-[60px] p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
                        value={objective.possibleChallenges || ''}
                        onChange={e =>
                          handleObjectiveChange(areaIndex, objIndex, 'possibleChallenges', e.target.value)
                        }
                        disabled={!canEdit || isPending}
                      />
                    </FormRow>

                    <FormRow label="Support Required">
                      <textarea
                        className="w-full min-h-[60px] p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
                        value={objective.supportRequired || ''}
                        onChange={e =>
                          handleObjectiveChange(areaIndex, objIndex, 'supportRequired', e.target.value)
                        }
                        disabled={!canEdit || isPending}
                      />
                    </FormRow>
                  </div>
                ))}

                {canEdit && (
                  <Button
                    type="button"
                    onClick={() => addObjective(areaIndex)}
                    variant="secondary"
                    size="sm"
                    disabled={isPending}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Objective
                  </Button>
                )}
              </div>
            </div>
          ))}

          {canEdit && (
            <Button type="button" onClick={addArea} variant="primary" disabled={isPending}>
              <Plus className="h-4 w-4 mr-2" />
              Add Accountability Area
            </Button>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center w-full gap-4 pt-6 border-t">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Save Draft button */}
          {(mode === 'create' || canEdit) && (
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={isPending}
              onClick={handleSaveDraft}
              className="min-w-[140px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Saving...' : 'Updating...'}
                </>
              ) : (
                mode === 'create' ? 'Save as Draft' : 'Update Draft'
              )}
            </Button>
          )}

          {/* Submit button */}
          {(mode === 'create' || canSubmit) && (
            <Button
              type="button"
              size="md"
              disabled={isPending || !isFormValid}
              onClick={handleSubmit}
              className="min-w-[140px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                getSubmitLabel()
              )}
            </Button>
          )}

          <Button 
            type="button" 
            size="md" 
            variant="secondary" 
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Form Status */}
      {mode !== 'create' && !isFormValid && (requestStatus === 'draft' || requestStatus === 'rejected') && (
        <p className="text-center text-sm text-amber-600">
          Please complete all required fields (*) to submit for approval
        </p>
      )}
    </form>
  );
};

export default StaffStrategyForm;