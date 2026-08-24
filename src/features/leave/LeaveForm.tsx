// src/features/leave/LeaveForm.tsx
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ILeave, ILeaveFormData, ILeaveEnum, IUser } from '../../interfaces';
import { resetLeave } from '../../store/leaveSlice';
import { localStorageUser } from '../../utils/localStorageUser';
import { getUserFullName } from '../../utils/userHelpers';
import { LEAVE_TYPE_CONFIG } from './leaveConstants';
import { useSaveLeaveDraft, useCreateLeaveApplication, useUpdateLeaveApplication } from './Hooks/useLeave';
import { useUsers } from '../user/Hooks/useUsers';
import { useMyLeaveBalance } from './Hooks/useLeave';

// Components
import FormRow from '../../components/custom/FormRow';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import SpinnerMini from '../../components/custom/SpinnerMini';
import NetworkErrorUI from '../../components/custom/NetworkErrorUI';
import DatePicker from '../../features/datePicker/DatePicker';
import LeaveBalanceCard from '../../components/custom/LeaveBalanceCard';

interface LeaveFormProps {
  mode: 'create' | 'edit';
  initialData?: ILeave | null;
}

const LeaveForm: React.FC<LeaveFormProps> = ({ mode, initialData }) => {
  const currentUser = localStorageUser();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Initialize form data
  const getInitialFormData = (): ILeaveFormData => {
    if (mode === 'edit' && initialData) {
      return {
        leaveType: initialData.leaveType,
        startDate: initialData.startDate,
        endDate: initialData.endDate,
        reasonForLeave: initialData.reasonForLeave || '',
        contactDuringLeave: initialData.contactDuringLeave || '',
        approvedBy: initialData.approvedBy?.id || null,
        leaveCover: initialData.leaveCover || {
          nameOfCover: '',
          signature: '',
        },
      };
    }

    return {
      leaveType: undefined,
      startDate: undefined,
      endDate: undefined,
      reasonForLeave: '',
      contactDuringLeave: '',
      approvedBy: null,
      leaveCover: {
        nameOfCover: '',
        signature: '',
      },
    };
  };

  const [formData, setFormData] = useState<ILeaveFormData>(getInitialFormData);
  const [showFullBalance, setShowFullBalance] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Queries
  const { data: usersData, isLoading: isLoadingUsers } = useUsers({ limit: 1000 });
  const { data: leaveBalanceData, isLoading: isLoadingBalance } = useMyLeaveBalance();

  // Memoized data
  const users = useMemo(
    () => usersData?.data?.filter(user => user.id !== currentUser?.id) ?? [],
    [usersData, currentUser?.id]
  );

  const leaveBalance = leaveBalanceData?.data;

  const leaveOptions = Object.entries(LEAVE_TYPE_CONFIG).map(([key, value]) => ({
    id: key,
    name: `${key} (Max: ${value.maxDays} days)`,
  }));

  // Calculate days
  const calculateDays = useCallback((startDate: string, endDate: string, leaveType: string) => {
    if (!startDate || !endDate || !leaveType) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const config = LEAVE_TYPE_CONFIG[leaveType as keyof typeof LEAVE_TYPE_CONFIG];

    if (config?.isCalendarDays) {
      return diffDays;
    }

    let workingDays = 0;
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
  }, []);

  const totalDays = useMemo(() => {
    if (formData.startDate && formData.endDate && formData.leaveType) {
      return calculateDays(
        formData.startDate.toString(),
        formData.endDate.toString(),
        formData.leaveType
      );
    }
    return 0;
  }, [formData.startDate, formData.endDate, formData.leaveType, calculateDays]);

  // Get available balance
  const getAvailableBalance = useCallback(() => {
    if (!formData.leaveType || !leaveBalance) return 0;

    const balanceMap: Record<string, number> = {
      'Annual leave': leaveBalance?.annualLeave?.balance || 0,
      'Compassionate leave': leaveBalance?.compassionateLeave?.balance || 0,
      'Sick leave': leaveBalance?.sickLeave?.balance || 0,
      'Maternity leave': leaveBalance?.maternityLeave?.balance || 0,
      'Paternity leave': leaveBalance?.paternityLeave?.balance || 0,
      'Emergency leave': leaveBalance?.emergencyLeave?.balance || 0,
      'Study Leave': leaveBalance?.studyLeave?.balance || 0,
      'Leave without pay': leaveBalance?.leaveWithoutPay?.balance || 0,
    };

    return balanceMap[formData.leaveType] || 0;
  }, [formData.leaveType, leaveBalance]);

  const availableBalance = useMemo(() => getAvailableBalance(), [getAvailableBalance]);

  // Determine if form is in draft state
  const isDraft = mode === 'edit' && initialData?.status === 'draft';
  const isRejected = mode === 'edit' && initialData?.status === 'rejected';
  // const _isPending = mode === 'edit' && initialData?.status === 'pending';
  // const _isApproved = mode === 'edit' && initialData?.status === 'approved';

  const canEdit = mode === 'create' || isDraft || isRejected;
  const canSubmit = mode === 'create' || isDraft || isRejected;
  const isViewOnly = mode === 'edit' && !canEdit;

  // Hooks
  const { saveLeaveDraft, isPending: isSaving, isError: isErrorSave } = useSaveLeaveDraft();
  const { createLeaveApplication, isPending: isSending, isError: isErrorSend } = useCreateLeaveApplication();
  const { updateLeaveApplication, isPending: isUpdating } = useUpdateLeaveApplication(
    mode === 'edit' ? initialData?.id || '' : ''
  );

  const isSubmitting = mode === 'create' ? isSaving || isSending : isUpdating || isSending;

  // Validation
  const validateField = useCallback((name: string, value: unknown): string => {
    switch (name) {
      case 'ILeave':
        return !value ? 'Leave type is required' : '';
      case 'approvedById':
        return !value ? 'Approver is required' : '';
      case 'startDate':
        return !value ? 'Start date is required' : '';
      case 'endDate':
        return !value ? 'End date is required' : '';
      case 'reasonForLeave':
        return !value ? 'Reason for leave is required' : '';
      default:
        return '';
    }
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.leaveType) newErrors.leaveType = 'Leave type is required';
    if (!formData.approvedBy) newErrors.approvedById = 'Approver is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.reasonForLeave?.trim()) newErrors.reasonForLeave = 'Reason for leave is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handlers
  const handleBlur = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field as keyof ILeaveFormData]);
    setErrors(prev => ({ ...prev, [field]: error }));
  }, [formData, validateField]);

  const handleFormChange = useCallback((field: keyof ILeaveFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  }, [touched, validateField]);

  const handleNestedChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      leaveCover: {
        ...(prev.leaveCover || {}),
        [field]: value,
      },
    }));
  }, []);

  const handleBalanceClick = useCallback((leaveType: string) => {
    const leaveKey = Object.keys(LEAVE_TYPE_CONFIG).find(key =>
      key.toLowerCase().includes(leaveType.toLowerCase())
    );
    if (leaveKey) {
      handleFormChange('leaveType', leaveKey as ILeaveEnum);
    }
  }, [handleFormChange]);

  // Submit handlers
  const buildSubmitData = useCallback((): Partial<ILeave> => {
    return {
      leaveType: formData.leaveType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reasonForLeave: formData.reasonForLeave,
      contactDuringLeave: formData.contactDuringLeave,
      approvedBy: formData.approvedBy as Partial<IUser>,
      leaveCover: formData.leaveCover,
    };
  }, [formData]);

  const handleSaveDraft = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const isFormValid = form.reportValidity();

    if (!isFormValid) return;

    const data = { ...buildSubmitData(), reviewedById: null };

    if (mode === 'create') {
      saveLeaveDraft(data);
    } else {
      updateLeaveApplication({ data });
    }
  }, [buildSubmitData, mode, saveLeaveDraft, updateLeaveApplication]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return;
    }

    // Balance validation
    if (totalDays > availableBalance) {
      alert(`You only have ${availableBalance} days available for this leave type`);
      return;
    }

    const data = buildSubmitData();

    if (mode === 'create') {
      createLeaveApplication({data});
    } else {
      updateLeaveApplication({ data });
    }
  }, [validateForm, errors, totalDays, availableBalance, buildSubmitData, mode, createLeaveApplication, updateLeaveApplication]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mode === 'edit') {
        dispatch(resetLeave());
      }
    };
  }, [dispatch, mode]);

  // Error states
  if (isErrorSave || isErrorSend) {
    return <NetworkErrorUI />;
  }

  // View-only mode
  if (isViewOnly) {
    return (
      <div className="text-center py-8">
        <div className="text-amber-500 text-lg font-semibold">
          This leave application cannot be edited because it is{' '}
          <span className="uppercase">{initialData?.status}</span>.
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Only draft or rejected applications can be edited.
        </p>
      </div>
    );
  }

  // Check profile completion for create mode
  if (mode === 'create' && !currentUser?.employmentInfo?.isProfileComplete) {
    return (
      <div className="text-center py-12">
        <div className="text-amber-500 text-lg font-semibold">
          Please complete your employment info to apply for leave.
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()} noValidate>
      {/* Leave Balance Card */}
      <LeaveBalanceCard
        leaveBalance={leaveBalance}
        isLoading={isLoadingBalance}
        showAllTypes={showFullBalance}
        onBalanceClick={handleBalanceClick}
        warningThreshold={0.2}
      />

      {/* Toggle for showing all leave types */}
      {leaveBalance && (
        <button
          type="button"
          onClick={() => setShowFullBalance(!showFullBalance)}
          className="text-sm text-blue-600 hover:text-blue-800 transition"
        >
          {showFullBalance ? 'Show less' : 'Show all leave types'}
        </button>
      )}

      <div className="bg-gray-50 space-y-6 border-2 border-gray-200 p-4 rounded-lg">
        <h1 className="text-lg font-extrabold text-gray-700 text-center">
          {mode === 'create' ? 'Leave Application Form' : 'Update Leave Application'}
        </h1>

        {/* Status and Staff Info (Edit mode only) */}
        {mode === 'edit' && initialData && (
          <div className="flex flex-wrap gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="font-bold" style={{ letterSpacing: '1px' }}>
              Status: <span className="uppercase">{initialData.status}</span>
            </p>
            <p style={{ letterSpacing: '1px' }}>
              Staff: {getUserFullName(initialData.createdBy)}
            </p>
            {initialData.leaveNumber && (
              <p style={{ letterSpacing: '1px' }}>
                Leave #: {initialData.leaveNumber}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormRow 
            label="Leave Type *" 
            error={touched.leaveType ? errors.leaveType : undefined}
          >
            <Select
              value={formData.leaveType || ''}
              onValueChange={(value: string) => handleFormChange('leaveType', value)}
              disabled={!canEdit || isSubmitting}
            >
              <SelectTrigger 
                className={errors.leaveType && touched.leaveType ? 'border-red-500' : ''}
                id="ILeave"
              >
                <SelectValue placeholder="Select Leave Type" />
              </SelectTrigger>
              <SelectContent>
                {leaveOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>

          <FormRow 
            label="Approver *"
            error={touched.approvedById ? errors.approvedById : undefined}
          >
            {isLoadingUsers ? (
              <SpinnerMini />
            ) : (
              <Select
                value={formData.approvedBy || ''}
                onValueChange={(value: string) => handleFormChange('approvedBy', value)}
                disabled={!canEdit || isSubmitting}
              >
                <SelectTrigger 
                  className={errors.approvedById && touched.approvedById ? 'border-red-500' : ''}
                  id="approvedById"
                >
                  <SelectValue placeholder="Select Approver" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id as string}>
                      {user.firstName} {user.lastName} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormRow>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormRow 
            label="Start Date *"
            error={touched.startDate ? errors.startDate : undefined}
          >
            <DatePicker
              selected={formData.startDate ? new Date(formData.startDate) : null}
              onChange={(date: Date | null) => handleFormChange('startDate', date ? date.toISOString() : '')}
              variant="secondary"
              placeholder="Select start date"
              disabled={!canEdit || isSubmitting}
            />
          </FormRow>

          {formData.startDate && (
            <FormRow 
              label="End Date *"
              error={touched.endDate ? errors.endDate : undefined}
            >
              <DatePicker
                selected={formData.endDate ? new Date(formData.endDate) : null}
                onChange={(date: Date | null) => handleFormChange('endDate', date ? date.toISOString() : '')}
                variant="secondary"
                placeholder="Select end date"
                minDate={formData.startDate ? new Date(formData.startDate) : undefined}
                disabled={!canEdit || isSubmitting}
              />
            </FormRow>
          )}
        </div>

        {totalDays > 0 && (
          <div className="flex items-end pb-3">
            <div
              className={`p-2 rounded ${
                totalDays > availableBalance
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              Total Days: {totalDays} | Available: {availableBalance} days
            </div>
          </div>
        )}

        <FormRow 
          label="Reason for Leave *" 
          error={touched.reasonForLeave ? errors.reasonForLeave : undefined}
        >
          <textarea
            className={`border-2 h-24 min-h-24 rounded-lg focus:outline-none p-3 w-full ${
              errors.reasonForLeave && touched.reasonForLeave ? 'border-red-500' : ''
            }`}
            maxLength={1000}
            id="reasonForLeave"
            required
            value={formData.reasonForLeave}
            onChange={(e) => handleFormChange('reasonForLeave', e.target.value)}
            onBlur={() => handleBlur('reasonForLeave')}
            placeholder="Please provide reason for your leave application"
            disabled={!canEdit || isSubmitting}
          />
        </FormRow>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormRow label="Contact During Leave">
            <Input
              type="text"
              id="contactDuringLeave"
              value={formData.contactDuringLeave}
              onChange={(e) => handleFormChange('contactDuringLeave', e.target.value)}
              placeholder="Phone number or email"
              disabled={!canEdit || isSubmitting}
            />
          </FormRow>

          <FormRow label="Name of Cover (Optional)">
            <Input
              type="text"
              id="nameOfCover"
              value={formData.leaveCover?.nameOfCover || ''}
              onChange={(e) => handleNestedChange('nameOfCover', e.target.value)}
              placeholder="Person covering your duties"
              disabled={!canEdit || isSubmitting}
            />
          </FormRow>
        </div>
      </div>
   

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4 pt-6 border-t">
        {/* Save as Draft button */}
        {(mode === 'create' || canEdit) && (
          <Button
            type="button"
            variant="secondary"
            size="md"
            disabled={isSubmitting}
            onClick={handleSaveDraft}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <SpinnerMini />
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
            disabled={isSubmitting || totalDays > availableBalance}
            onClick={handleSubmit}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <SpinnerMini />
                {mode === 'create' ? 'Submitting...' : 'Updating...'}
              </>
            ) : (
              mode === 'create' ? 'Submit for Approval' : 'Update Application'
            )}
          </Button>
        )}

        <Button 
          type="button" 
          size="md" 
          variant="secondary" 
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
      </div>

      {/* Form Status Messages */}
      {mode === 'edit' && !isDraft && !isRejected && initialData?.status !== 'pending' && (
        <p className="text-center text-sm text-amber-600">
          This application is <span className="uppercase font-semibold">{initialData?.status}</span> and cannot be modified.
        </p>
      )}

      {totalDays > availableBalance && availableBalance > 0 && (
        <p className="text-center text-sm text-red-600">
          You have exceeded your available balance. Please select fewer days or a different leave type.
        </p>
      )}
    </form>
  );
};

export default LeaveForm;