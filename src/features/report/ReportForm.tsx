// src/features/report/ReportForm.tsx
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { IReport, IProject, IUser } from '../../interfaces';
import { setReport } from '../../store/reportSlice';
import { localStorageUser } from '../../utils/localStorageUser';
import { getUserFullName } from '../../utils/userHelpers';
import { useSaveReport, useSendReport, useUpdateReport } from './Hooks/useReport';
import { useUsers } from '../user/Hooks/useUsers';
import { useProjects } from '../project/Hooks/useProjects';

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

// Constants
const ACTIVITY_TYPES = [
  { id: 'Workshop', name: 'Workshop' },
  { id: 'Training', name: 'Training' },
  { id: 'Sector Meeting', name: 'Sector Meeting' },
  { id: 'Other', name: 'Other' },
];

const REPORT_TYPES = [
  { id: 'Weekly Report', name: 'Weekly Report' },
  { id: 'Monthly Report', name: 'Monthly Report' },
  { id: 'Quarterly Report', name: 'Quarterly Report' },
  { id: 'Annual Report', name: 'Annual Report' },
  { id: 'Activity report', name: 'Activity report' },
];

// Local form data type
interface IReportFormData {
  activityType?: 'Workshop' | 'Training' | 'Sector Meeting' | 'Other';
  otherActivitySpecification?: string;
  reportType?: 'Weekly Report' | 'Monthly Report' | 'Quarterly Report' | 'Annual Report' | 'Activity report';
  reportTitle?: string;
  reportingPeriod?: {
    from: string | Date | null;
    to: string | Date | null;
  };
  reviewedBy?: string | null;
  approvedBy?: string | null;
  project?: string | null;
}

interface ReportFormProps {
  mode: 'create' | 'edit';
  initialData?: IReport | null;
}

const ReportForm: React.FC<ReportFormProps> = ({ mode, initialData }) => {
  const currentUser = localStorageUser();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Initialize form data
  const getInitialFormData = (): IReportFormData => {
    if (mode === 'edit' && initialData) {
      // Helper to get project ID from various formats
      const getProjectId = (): string | null => {
        if (!initialData.project) return null;
        if (typeof initialData.project === 'string') return initialData.project;
        return initialData.project.id || null;
      };

      return {
        activityType: initialData.activityType,
        otherActivitySpecification: initialData.otherActivitySpecification || '',
        reportType: initialData.reportType || "Weekly Report",
        reportTitle: initialData.reportTitle || '',
        reportingPeriod: initialData.reportingPeriod || { from: null, to: null },
        reviewedBy: initialData.reviewedBy?.id || null,
        approvedBy: initialData.approvedBy?.id || null,
        project: getProjectId(),
      };
    }

    return {
      activityType: undefined,
      otherActivitySpecification: '',
      reportType: undefined,
      reportTitle: '',
      reportingPeriod: { from: null, to: null },
      reviewedBy: null,
      approvedBy: null,
      project: null,
    };
  };

  const [formData, setFormData] = useState<IReportFormData>(getInitialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Queries
  const { data: usersData, isLoading: isLoadingUsers } = useUsers({ limit: 1000 });
  const { data: projectsData, isLoading: isLoadingProjects } = useProjects({});

  // Memoized data
  const users = useMemo(
    () => usersData?.data?.filter((user: IUser) => user.id !== currentUser?.id) ?? [],
    [usersData, currentUser?.id]
  );

  const projects = useMemo(() => projectsData?.data ?? [], [projectsData]);

  // Determine if form is in draft state
  const isDraft = mode === 'edit' && initialData?.status === 'draft';
  const isRejected = mode === 'edit' && initialData?.status === 'rejected';

  const canEdit = mode === 'create' || isDraft || isRejected;
  const canSubmit = mode === 'create' || isDraft || isRejected;
  const isViewOnly = mode === 'edit' && !canEdit;

  // Hooks
  const { saveReport, isPending: isSaving, isError: isErrorSave } = useSaveReport();
  const { sendReport, isPending: isSending, isError: isErrorSend } = useSendReport();
  const { updateReport, isPending: isUpdating } = useUpdateReport(
    mode === 'edit' ? initialData?.id || '' : ''
  );

  const isSubmitting = mode === 'create' ? isSaving || isSending : isUpdating || isSending;

  // Validation
  const validateField = useCallback((name: string, value: unknown): string => {
    switch (name) {
      case 'reportTitle':
        return !value ? 'Report title is required' : '';
      case 'reportType':
        return !value ? 'Report type is required' : '';
      case 'activityType':
        return !value ? 'Activity type is required' : '';
      case 'otherActivitySpecification':
        if (formData.activityType === 'Other' && !value) {
          return 'Please specify the activity';
        }
        return '';
      default:
        return '';
    }
  }, [formData.activityType]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.reportTitle?.trim()) newErrors.reportTitle = 'Report title is required';
    if (!formData.reportType) newErrors.reportType = 'Report type is required';
    if (!formData.activityType) newErrors.activityType = 'Activity type is required';
    if (formData.activityType === 'Other' && !formData.otherActivitySpecification?.trim()) {
      newErrors.otherActivitySpecification = 'Please specify the activity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handlers
  const handleBlur = useCallback((field: string) => {
    setTouched((prev: Record<string, boolean>) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field as keyof IReportFormData]);
    setErrors((prev: Record<string, string>) => ({ ...prev, [field]: error }));
  }, [formData, validateField]);

  const handleFormChange = useCallback((field: keyof IReportFormData, value: string | null) => {
    setFormData((prev: IReportFormData) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev: Record<string, string>) => ({ ...prev, [field]: error }));
    }
  }, [touched, validateField]);

  const handleNestedChange = useCallback((
    parentField: keyof IReportFormData,
    field: string,
    value: Date | string | number | null
  ) => {
    setFormData((prev: IReportFormData) => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField] as object),
        [field]: value instanceof Date ? value.toISOString() : value,
      },
    }));
  }, []);

  // Submit handlers
  const buildSubmitData = useCallback((): Partial<IReport> => {
    // Convert null to undefined for Partial<IUser> fields
    const reviewedBy = formData.reviewedBy || undefined;
    const approvedBy = formData.approvedBy || undefined;
    const project = formData.project || undefined;

    return {
      activityType: formData.activityType,
      otherActivitySpecification: formData.otherActivitySpecification,
      reportType: formData.reportType,
      reportTitle: formData.reportTitle,
      reportingPeriod: formData.reportingPeriod,
      reviewedBy: reviewedBy as Partial<IUser> | undefined,
      approvedBy: approvedBy as Partial<IUser> | undefined,
      project: project,
    };
  }, [formData]);

  const handleSaveDraft = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const isFormValid = form.reportValidity();

    if (!isFormValid) return;

    const data = { ...buildSubmitData() };

    if (mode === 'create') {
      saveReport(data);
    } else {
      updateReport({ ...data });
    }
  }, [buildSubmitData, mode, saveReport, updateReport]);

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

    const data = buildSubmitData();

    if (mode === 'create') {
      sendReport({ ...data });
    } else {
      updateReport({ ...data });
    }
  }, [validateForm, errors, buildSubmitData, mode, sendReport, updateReport]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mode === 'edit') {
        dispatch(setReport("" as unknown as IReport));
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
          This report cannot be edited because it is{' '}
          <span className="uppercase">{initialData?.status}</span>.
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Only draft or rejected reports can be edited.
        </p>
      </div>
    );
  }

  // Check if other activity is selected
  const isOtherActivity = formData.activityType === 'Other';

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()} noValidate>
      <div className="bg-gray-50 space-y-6 border-2 border-gray-200 p-4 rounded-lg">
        <h1 className="text-lg font-extrabold text-gray-700 text-center">
          {mode === 'create' ? 'Create New Report' : 'Update Report'}
        </h1>

        {/* Status and Staff Info (Edit mode only) */}
        {mode === 'edit' && initialData && (
          <div className="flex flex-wrap gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="font-bold" style={{ letterSpacing: '1px' }}>
              Status: <span className="uppercase">{initialData.status}</span>
            </p>
            <p style={{ letterSpacing: '1px' }}>
              Created By: {getUserFullName(initialData.createdBy)}
            </p>
            {initialData.reportNumber && (
              <p style={{ letterSpacing: '1px' }}>
                Report #: {initialData.reportNumber}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormRow 
            label="Report Title *"
            error={touched.reportTitle ? errors.reportTitle : undefined}
          >
            <Input
              type="text"
              id="reportTitle"
              value={formData.reportTitle || ''}
              onChange={(e) => handleFormChange('reportTitle', e.target.value)}
              onBlur={() => handleBlur('reportTitle')}
              placeholder="Enter report title here"
              disabled={!canEdit || isSubmitting}
              className={errors.reportTitle && touched.reportTitle ? 'border-red-500' : ''}
            />
          </FormRow>

          <FormRow 
            label="Report Type *"
            error={touched.IReport ? errors.IReport : undefined}
          >
            <Select
              value={formData.reportType || ''}
              onValueChange={(value: string) => handleFormChange('reportType', value)}
              disabled={!canEdit || isSubmitting}
            >
              <SelectTrigger 
                className={errors.IReport && touched.IReport ? 'border-red-500' : ''}
                id="IReport"
              >
                <SelectValue placeholder="Select Report Type" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
        </div>

        {/* Reporting Period */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormRow label="Reporting Period From">
            <DatePicker
              selected={
                formData?.reportingPeriod?.from ? new Date(formData.reportingPeriod.from) : null
              }
              onChange={(date: Date | null) =>
                handleNestedChange('reportingPeriod', 'from', date ? date.toISOString() : null)
              }
              variant="secondary"
              placeholder="Select start date"
              disabled={!canEdit || isSubmitting}
            />
          </FormRow>

          {formData.reportingPeriod?.from && (
            <FormRow label="Reporting Period To">
              <DatePicker
                selected={
                  formData?.reportingPeriod?.to ? new Date(formData.reportingPeriod.to) : null
                }
                onChange={(date: Date | null) =>
                  handleNestedChange('reportingPeriod', 'to', date ? date.toISOString() : null)
                }
                variant="secondary"
                placeholder="Select end date"
                minDate={formData?.reportingPeriod?.from ? new Date(formData.reportingPeriod.from) : undefined}
                disabled={!canEdit || isSubmitting}
              />
            </FormRow>
          )}
        </div>

        <FormRow 
          label="Activity Type *"
          error={touched.activityType ? errors.activityType : undefined}
        >
          <Select
            value={formData.activityType || ''}
            onValueChange={(value: string) => handleFormChange('activityType', value)}
            disabled={!canEdit || isSubmitting}
          >
            <SelectTrigger 
              className={errors.activityType && touched.activityType ? 'border-red-500' : ''}
              id="activityType"
            >
              <SelectValue placeholder="Select Activity Type" />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITY_TYPES.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormRow>

        {/* Other Activity Specification - Conditional */}
        {isOtherActivity && (
          <FormRow 
            label="Please Specify Activity *"
            error={touched.otherActivitySpecification ? errors.otherActivitySpecification : undefined}
          >
            <Input
              type="text"
              id="otherActivitySpecification"
              value={formData.otherActivitySpecification || ''}
              onChange={(e) => handleFormChange('otherActivitySpecification', e.target.value)}
              onBlur={() => handleBlur('otherActivitySpecification')}
              placeholder="Enter activity details..."
              disabled={!canEdit || isSubmitting}
              className={errors.otherActivitySpecification && touched.otherActivitySpecification ? 'border-red-500' : ''}
            />
          </FormRow>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormRow label="Project">
            {isLoadingProjects ? (
              <SpinnerMini />
            ) : (
              <Select
                value={formData.project || ''}
                onValueChange={(value: string) => handleFormChange('project', value)}
                disabled={!canEdit || isSubmitting}
              >
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {projects.map((project: IProject) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.projectTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormRow>

          <FormRow label="Reviewed By">
            {isLoadingUsers ? (
              <SpinnerMini />
            ) : (
              <Select
                value={formData.reviewedBy || ''}
                onValueChange={(value: string) => handleFormChange('reviewedBy', value)}
                disabled={!canEdit || isSubmitting}
              >
                <SelectTrigger id="reviewedBy">
                  <SelectValue placeholder="Select Reviewer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {users.map((user: IUser) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <SpinnerMini />
                {mode === 'create' ? 'Submitting...' : 'Updating...'}
              </>
            ) : (
              mode === 'create' ? 'Submit Report' : 'Update Report'
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
          This report is <span className="uppercase font-semibold">{initialData?.status}</span> and cannot be modified.
        </p>
      )}
    </form>
  );
};

export default ReportForm;