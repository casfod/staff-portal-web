// src/features/appraisal/AppraisalForm.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { Loader2, X, ChevronDown, ChevronUp, User, UserCog, Clock } from 'lucide-react';

// Radix UI Components
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

// Custom Components
import SpinnerMini from '../../components/custom/SpinnerMini';

// Hooks
import { useStaffStrategies } from '../staff-strategy/Hooks/useStaffStrategy';
import { useUsers } from '../user/Hooks/useUsers';
import {
  useSaveAppraisalDraft,
  useCreateAndSubmitAppraisal,
  useUpdateAppraisal,
  // useSubmitExistingAppraisal,
} from './Hooks/useAppraisal';
import { localStorageUser } from '../../utils/localStorageUser';

// Types
import {
  IAppraisal,
  // ISafeguarding,
  IPerformanceArea,
  ObjectiveRating,
  PerformanceRating,
  OverallRating,
  IStaffStrategy,
  IUser,
} from '../../interfaces';

// Constants
const PERFORMANCE_AREAS: IPerformanceArea[] = [
  { area: 'Job Knowledge', rating: 'Pending', supervisorStatus: 'pending' },
  { area: 'Judgement', rating: 'Pending', supervisorStatus: 'pending' },
  { area: 'Reliability', rating: 'Pending', supervisorStatus: 'pending' },
  { area: 'Quality & Quantity of Work', rating: 'Pending', supervisorStatus: 'pending' },
  {
    area: 'Interpersonal and Communication Skills',
    rating: 'Pending',
    supervisorStatus: 'pending',
  },
  { area: 'Teamwork', rating: 'Pending', supervisorStatus: 'pending' },
];

const APPRAISAL_PERIODS = [
  { id: 'January - March', name: 'January - March (Q1)' },
  { id: 'April - June', name: 'April - June (Q2)' },
  { id: 'July - September', name: 'July - September (Q3)' },
  { id: 'October - December', name: 'October - December (Q4)' },
];

const RATING_OPTIONS: { id: ObjectiveRating; name: string }[] = [
  { id: '', name: 'Select Rating' },
  { id: 'Achieved', name: 'Achieved (3 pts)' },
  { id: 'Partly Achieved', name: 'Partly Achieved (2 pts)' },
  { id: 'Not Achieved', name: 'Not Achieved (0 pts)' },
];

const OVERALL_RATINGS: { id: OverallRating; name: string }[] = [
  { id: 'Pending', name: 'Pending' },
  { id: 'Meets Requirements', name: 'Meets Requirements' },
  { id: 'Partly Meets Requirements', name: 'Partly Meets Requirements' },
  { id: 'Does Not Meet Requirements', name: 'Does Not Meet Requirements' },
];

const PERFORMANCE_RATINGS: { id: PerformanceRating; name: string }[] = [
  { id: 'Pending', name: 'Pending' },
  { id: 'Needs Improvement', name: 'Needs Improvement' },
  { id: 'Meets Expectations', name: 'Meets Expectations' },
  { id: 'Exceeds Expectations', name: 'Exceeds Expectations' },
];

// FormRow component
const FormRow = ({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">
      {label}
      {error && <span className="text-red-500 text-xs ml-2">{error}</span>}
    </Label>
    {children}
  </div>
);

// Helper to get ID from string | IUser | unknown
const getId = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id?: string | null }).id;
    return typeof id === 'string' ? id : '';
  }
  return '';
};

// Helper to check if a field should be editable
const isFieldEditable = (
  mode: 'create' | 'edit',
  status: string | undefined,
  role: 'staff' | 'supervisor' | 'admin' | 'viewer'
): boolean => {
  if (mode === 'create') return true;
  if (status === 'draft') {
    return role === 'staff' || role === 'admin';
  }
  if (status === 'pending') {
    return role === 'supervisor' || role === 'admin';
  }
  return false;
};

// Strategy type
interface Strategy {
  id: string;
  strategyCode: string;
  department: string;
  period: string;
  accountabilityAreas: Array<{
    objectives: Array<{ objective: string }>;
  }>;
}

// Form Data Type - Only what user needs to input
type AppraisalFormData = {
  // User inputs only
  department: string;
  lengthOfTimeInPosition: string;
  appraisalPeriod: string;
  supervisorId: string;
  lengthOfTimeSupervised: string;
  staffStrategy: string | null;
  
  // Objectives data - simplified for frontend
  objectives: Array<{
    objective: string;
    employeeRating: { rating: ObjectiveRating; achievements: string };
    supervisorRating: ObjectiveRating;
  }>;
  
  // Safeguarding - simplified for frontend
  safeguarding: {
    actionsTaken: string;
    trainingCompleted: 'Yes' | 'Partly' | 'No';
    areasNotUnderstood: string[];
  };
  
  // Supervisor assessment - simplified for frontend
  performanceAreas: Array<{
    area: IPerformanceArea['area'];
    rating: PerformanceRating;
  }>;
  supervisorComments: string;
  overallRating: OverallRating;
  
  // Future goals
  futureGoals: string;
};

interface AppraisalFormProps {
  mode: 'create' | 'edit';
  initialData?: IAppraisal | null;
}

const AppraisalForm: React.FC<AppraisalFormProps> = ({ mode, initialData }) => {
  const currentUser = localStorageUser();
  const currentUserId = currentUser?.id || '';

  // Determine user role for this appraisal
  const isAdmin = ['SUPER-ADMIN', 'ADMIN'].includes(currentUser?.role || '');
  const isStaff = mode === 'create' ? true : getId(initialData?.createdBy?.id) === currentUserId;
  const isSupervisor = mode === 'edit' ? getId(initialData?.supervisorId) === currentUserId : false;

  // Determine user role
  const userRole =
    mode === 'create'
      ? 'staff'
      : isAdmin
        ? 'admin'
        : isStaff
          ? 'staff'
          : isSupervisor
            ? 'supervisor'
            : 'viewer';

  const requestStatus = initialData?.status;

  // Determine editability
  const canEdit = mode === 'create' || isFieldEditable(mode, requestStatus, userRole);
  const canSubmit = mode === 'create' || (isStaff && requestStatus === 'draft');
  const isViewOnly = mode === 'edit' && !canEdit;

  // Form State - Only user inputs
  const [formData, setFormData] = useState<AppraisalFormData>(() => {
    if (mode === 'edit' && initialData) {
      return {
        department: initialData.department || '',
        lengthOfTimeInPosition: initialData.lengthOfTimeInPosition || '',
        appraisalPeriod: initialData.appraisalPeriod || '',
        supervisorId: getId(initialData.supervisorId),
        lengthOfTimeSupervised: initialData.lengthOfTimeSupervised || '',
        objectives: initialData.objectives?.map(obj => ({
          objective: obj.objective,
          employeeRating: obj.employeeRating,
          supervisorRating: obj.supervisorRating,
        })) || [],
        safeguarding: initialData.safeguarding || {
          actionsTaken: '',
          trainingCompleted: 'No',
          areasNotUnderstood: [],
        },
        performanceAreas: initialData.performanceAreas?.map(area => ({
          area: area.area,
          rating: area.rating,
        })) || PERFORMANCE_AREAS.map(area => ({
          area: area.area,
          rating: area.rating,
        })),
        supervisorComments: initialData.supervisorComments || '',
        overallRating: initialData.overallRating || 'Pending',
        futureGoals: initialData.futureGoals || '',
        staffStrategy: initialData.staffStrategy
          ? typeof initialData.staffStrategy === 'string'
            ? initialData.staffStrategy
            : (initialData.staffStrategy as IStaffStrategy)?.id || null
          : null,
      };
    }

    // For create mode, get supervisorId from user's employment info if available
    // Ensure it's always a string, not an object
    const supervisorId = currentUser?.employmentInfo?.jobDetails?.supervisorId;
    const defaultSupervisorId = typeof supervisorId === 'string' ? supervisorId : '';

    return {
      department: '',
      lengthOfTimeInPosition: '',
      appraisalPeriod: '',
      supervisorId: defaultSupervisorId,
      lengthOfTimeSupervised: '',
      objectives: [],
      safeguarding: {
        actionsTaken: '',
        trainingCompleted: 'No',
        areasNotUnderstood: [],
      },
      performanceAreas: PERFORMANCE_AREAS.map(area => ({
        area: area.area,
        rating: area.rating,
      })),
      supervisorComments: '',
      overallRating: 'Pending',
      futureGoals: '',
      staffStrategy: null,
    };
  });

  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(
    formData.staffStrategy || ''
  );
  const [showStaffStrategies, setShowStaffStrategies] = useState(true);
  const [areasNotUnderstoodInput, setAreasNotUnderstoodInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Hooks
  const { data: strategiesData, isLoading: isLoadingStrategies } = useStaffStrategies({
    search: 'approved',
    sort: '-createdAt',
    page: 1,
    limit: 100,
  });

  // Fetch supervisors (users with ADMIN or SUPER-ADMIN role)
  const { data: supervisorsData, isLoading: isLoadingSupervisors } = useUsers({
    role: 'admin',
  });

  const { saveAppraisalDraft, isPending: isSaving } = useSaveAppraisalDraft();
  const { createAndSubmitAppraisal, isPending: isSubmitting } = useCreateAndSubmitAppraisal();
  const { updateAppraisal, isPending: isUpdating } = useUpdateAppraisal(
    mode === 'edit' ? initialData?.id || '' : ''
  );
  // const { submitExistingAppraisal, isPending: isSubmittingExisting } = useSubmitExistingAppraisal();

  const isPending =
    mode === 'create' ? isSaving || isSubmitting : isUpdating;

  // Available strategies for the selected period
  const availableStrategies = useMemo((): Strategy[] => {
    if (!strategiesData?.data || !formData.appraisalPeriod) return [];
    return strategiesData.data.filter(
      (strategy: Strategy) => strategy.period === formData.appraisalPeriod
    );
  }, [formData.appraisalPeriod, strategiesData]);

  // Available supervisors
  const supervisors = useMemo(() => supervisorsData?.data ?? [], [supervisorsData]);

  // Get current user's staff name for display
  const staffDisplayName = useMemo(() => {
    return currentUser 
      ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() 
      : '';
  }, [currentUser]);

  // Get current user's position for display
  const staffPosition = useMemo(() => {
    return currentUser?.employmentInfo?.jobDetails?.title || '';
  }, [currentUser]);

  // Get selected supervisor's name for display
  const selectedSupervisorName = useMemo(() => {
    if (!formData.supervisorId) return '';
    const supervisor = supervisors.find((s: IUser) => s.id === formData.supervisorId);
    return supervisor?.fullName || `${supervisor?.firstName || ''} ${supervisor?.lastName || ''}`.trim();
  }, [formData.supervisorId, supervisors]);

  // Check if form is valid for submission
  const isFormValid = useMemo(() => {
    return (
      !!formData.department &&
      !!formData.appraisalPeriod &&
      !!formData.objectives &&
      formData.objectives.length > 0 &&
      !!formData.supervisorId
    );
  }, [formData.department, formData.appraisalPeriod, formData.objectives, formData.supervisorId]);

  // Validation
  const validateField = useCallback((name: string, value: unknown): string => {
    switch (name) {
      case 'department':
        return !value ? 'Department is required' : '';
      case 'appraisalPeriod':
        return !value ? 'Appraisal period is required' : '';
      case 'supervisorId':
        return !value ? 'Supervisor is required' : '';
      default:
        return '';
    }
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.appraisalPeriod) newErrors.appraisalPeriod = 'Appraisal period is required';
    if (!formData.objectives || formData.objectives.length === 0) {
      newErrors.objectives = 'Please load objectives from a strategy';
    }
    if (!formData.supervisorId) newErrors.supervisorId = 'Supervisor is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.department, formData.appraisalPeriod, formData.objectives, formData.supervisorId]);

  // Handlers
  const handleBlur = useCallback(
    (field: string) => {
      setTouched(prev => ({ ...prev, [field]: true }));
      const error = validateField(field, formData[field as keyof AppraisalFormData]);
      setErrors(prev => ({ ...prev, [field]: error }));
    },
    [formData, validateField]
  );

  const handleFormChange = useCallback(
    <K extends keyof AppraisalFormData>(field: K, value: AppraisalFormData[K]) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (touched[field as string]) {
        const error = validateField(field as string, value);
        setErrors(prev => ({ ...prev, [field as string]: error }));
      }
    },
    [touched, validateField]
  );

  const loadObjectivesFromStrategy = useCallback(
    (strategyId: string) => {
      const strategy = availableStrategies.find(s => s.id === strategyId);
      if (strategy?.accountabilityAreas) {
        const allObjectives: AppraisalFormData['objectives'] = [];

        strategy.accountabilityAreas.forEach(area => {
          area.objectives.forEach(obj => {
            allObjectives.push({
              objective: obj.objective,
              employeeRating: { rating: '', achievements: '' },
              supervisorRating: '',
            });
          });
        });

        // Add safeguarding as the last objective
        allObjectives.push({
          objective: 'Safeguarding',
          employeeRating: { rating: '', achievements: '' },
          supervisorRating: '',
        });

        setFormData(prev => ({ ...prev, objectives: allObjectives }));
        setErrors(prev => ({ ...prev, objectives: '' }));
      }
    },
    [availableStrategies]
  );

  const handleObjectiveRatingChange = useCallback(
    (index: number, field: 'employeeRating' | 'supervisorRating', value: string) => {
      setFormData(prev => {
        const updatedObjectives = [...(prev.objectives || [])];
        if (field === 'employeeRating') {
          updatedObjectives[index] = {
            ...updatedObjectives[index],
            employeeRating: {
              ...updatedObjectives[index].employeeRating,
              rating: value as ObjectiveRating,
            },
          };
        } else {
          updatedObjectives[index] = {
            ...updatedObjectives[index],
            supervisorRating: value as ObjectiveRating,
          };
        }
        return { ...prev, objectives: updatedObjectives };
      });
    },
    []
  );

  const handleObjectiveAchievementsChange = useCallback((index: number, value: string) => {
    setFormData(prev => {
      const updatedObjectives = [...(prev.objectives || [])];
      updatedObjectives[index] = {
        ...updatedObjectives[index],
        employeeRating: {
          ...updatedObjectives[index].employeeRating,
          achievements: value,
        },
      };
      return { ...prev, objectives: updatedObjectives };
    });
  }, []);

  const handlePerformanceAreaChange = useCallback((index: number, value: string) => {
    setFormData(prev => {
      const updatedAreas = [...(prev.performanceAreas || [])];
      updatedAreas[index] = {
        ...updatedAreas[index],
        rating: value as PerformanceRating,
      };
      return { ...prev, performanceAreas: updatedAreas };
    });
  }, []);

  const handleSafeguardingChange = useCallback(
    <K extends keyof AppraisalFormData['safeguarding']>(field: K, value: AppraisalFormData['safeguarding'][K]) => {
      setFormData(prev => ({
        ...prev,
        safeguarding: {
          ...prev.safeguarding,
          [field]: value,
        },
      }));
    },
    []
  );

  const addAreaNotUnderstood = useCallback(() => {
    if (areasNotUnderstoodInput.trim()) {
      setFormData(prev => ({
        ...prev,
        safeguarding: {
          ...prev.safeguarding,
          areasNotUnderstood: [...prev.safeguarding.areasNotUnderstood, areasNotUnderstoodInput.trim()],
        },
      }));
      setAreasNotUnderstoodInput('');
    }
  }, [areasNotUnderstoodInput]);

  const removeAreaNotUnderstood = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      safeguarding: {
        ...prev.safeguarding,
        areasNotUnderstood: prev.safeguarding.areasNotUnderstood.filter((_, i) => i !== index),
      },
    }));
  }, []);

  // Submit Handlers - Clean data, let backend derive staffName, position, supervisorName
  const buildSubmitData = useCallback((): Partial<IAppraisal> => {
    // Map objectives - backend will calculate points and status
    const objectives = formData.objectives.map(obj => ({
      objective: obj.objective,
      employeeRating: obj.employeeRating,
      supervisorRating: obj.supervisorRating,
    }));

    // Build the submit data with proper typing
    const submitData: Partial<IAppraisal> = {
      // staffName, position, supervisorName are NOT sent - backend derives them
      department: formData.department,
      lengthOfTimeInPosition: formData.lengthOfTimeInPosition,
      appraisalPeriod: formData.appraisalPeriod,
      supervisorId: formData.supervisorId,  // Only the ID is needed
      lengthOfTimeSupervised: formData.lengthOfTimeSupervised,
      supervisorComments: formData.supervisorComments,
      overallRating: formData.overallRating,
      futureGoals: formData.futureGoals,
      staffStrategy: formData.staffStrategy || undefined,
    };

    // Only add objectives if they exist
    if (objectives.length > 0) {
      submitData.objectives = objectives as IAppraisal['objectives'];
    }

    // Only add safeguarding if it has values
    if (formData.safeguarding.actionsTaken || formData.safeguarding.trainingCompleted !== 'No') {
      submitData.safeguarding = {
        actionsTaken: formData.safeguarding.actionsTaken,
        trainingCompleted: formData.safeguarding.trainingCompleted,
        areasNotUnderstood: formData.safeguarding.areasNotUnderstood,
        supervisorStatus: 'pending',
      };
    }

    // Only add performance areas if they exist
    if (formData.performanceAreas.length > 0) {
      submitData.performanceAreas = formData.performanceAreas.map(area => ({
        area: area.area,
        rating: area.rating,
        supervisorStatus: 'pending',
      }));
    }

    return submitData;
  }, [formData]);

  // const handleSaveDraft = useCallback(
  //   (e: React.FormEvent) => {
  //     e.preventDefault();

  //     if (mode === 'create') {
  //       const data = buildSubmitData();
  //       saveAppraisalDraft(data);
  //     } else {
  //       const data = buildSubmitData();
  //       updateAppraisal({ data });
  //     }
  //   },
  //   [buildSubmitData, mode, saveAppraisalDraft, updateAppraisal]
  // );
// AppraisalForm.tsx - Fix handleSaveDraft

const handleSaveDraft = useCallback(
  (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'create') {
      const data = buildSubmitData();
      saveAppraisalDraft(data);
    } else {
      // For edit mode, always use updateAppraisal
      const data = buildSubmitData();
      updateAppraisal({ data });
    }
  },
  [buildSubmitData, mode, saveAppraisalDraft, updateAppraisal]
);

/*
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      if (mode === 'create') {
        const data = buildSubmitData();
        createAndSubmitAppraisal(data);
      } else {
        submitExistingAppraisal(initialData?.id || '');
      }
    },
    [
      buildSubmitData,
      createAndSubmitAppraisal,
      initialData?.id,
      mode,
      submitExistingAppraisal,
      validateForm,
    ]
  );
*/

// AppraisalForm.tsx - Fix the handleSubmit function

const handleSubmit = useCallback(
  (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (mode === 'create') {
      const data = buildSubmitData();
      createAndSubmitAppraisal(data);
    } else {
      // For edit mode, always use updateAppraisal
      // The user can submit via a separate button if needed
      const data = buildSubmitData();
      updateAppraisal({ data });
    }
  },
  [buildSubmitData, createAndSubmitAppraisal, mode, updateAppraisal, validateForm]
);
  // Get submit button label
  const getSubmitLabel = useCallback(() => {
    if (isPending) {
      return mode === 'create' ? 'Creating...' : 'Updating...';
    }
    if (mode === 'create') {
      return 'Submit Appraisal';
    }
    if (requestStatus === 'draft') {
      return 'Submit Appraisal';
    }
    return 'Update Appraisal';
  }, [isPending, mode, requestStatus]);

  // Check profile completion for create mode
  if (mode === 'create' && !currentUser?.employmentInfo?.isProfileComplete) {
    return (
      <div className="text-center py-12">
        <div className="text-amber-500 text-lg font-semibold">
          Please complete your employment info to access appraisal form.
        </div>
      </div>
    );
  }

  // Show view-only message for edit mode when user can't edit
  if (isViewOnly) {
    return (
      <div className="text-center py-8">
        <div className="text-amber-500 text-lg font-semibold">
          This appraisal cannot be edited because it is{' '}
          <span className="uppercase">{requestStatus}</span>.
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {isStaff && requestStatus === 'pending'
            ? 'Your appraisal is under review by your supervisor.'
            : 'Only draft or pending appraisals can be edited.'}
        </p>
      </div>
    );
  }

  // Helper to check if employee rating can be edited
  const canEditEmployeeRating =
    userRole === 'staff' && (mode === 'create' || requestStatus === 'draft');
  const canEditSupervisorRating =
    (userRole === 'supervisor' || userRole === 'admin') && requestStatus === 'pending';
  const showSupervisorRating = userRole === 'supervisor' || userRole === 'admin';

  return (
    <form className="space-y-6" noValidate>
      {/* Role and Status Indicator */}
      {mode === 'edit' && initialData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border">
          <div>
            <span className="font-bold uppercase">Status:</span>
            <span className="ml-2 capitalize">{initialData.status}</span>
          </div>
          <div>
            <span className="font-bold uppercase">Appraisal Code:</span>
            <span className="ml-2">{initialData.appraisalCode || 'N/A'}</span>
          </div>
        </div>
      )}

      {/* Role indicator */}
      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
        {userRole === 'staff' && (
          <>
            <User className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-800">
              You are {mode === 'create' ? 'creating' : 'editing'} as:{' '}
              <span className="font-semibold">Staff Member</span>
              {mode === 'edit' && requestStatus === 'pending' && (
                <span className="ml-2 text-xs text-amber-600">
                  (View only - under supervisor review)
                </span>
              )}
            </span>
          </>
        )}
        {userRole === 'supervisor' && (
          <>
            <UserCog className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-800">
              You are editing as: <span className="font-semibold">Supervisor</span>
            </span>
          </>
        )}
        {userRole === 'admin' && (
          <>
            <UserCog className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-purple-800">
              You are editing as: <span className="font-semibold">Admin</span>
            </span>
          </>
        )}
        {mode === 'edit' && requestStatus && (
          <div className="ml-auto flex items-center gap-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-xs text-gray-600">
              Status: <span className="font-semibold uppercase">{requestStatus}</span>
            </span>
          </div>
        )}
      </div>

      {/* Section 1: Staff Information */}
      <div className="rounded-lg p-4 border bg-white border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300">
          SECTION 1: STAFF INFORMATION
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormRow label="Staff Name">
            <Input
              inputSize="sm"
              type="text"
              value={staffDisplayName || 'N/A'}
              disabled
              className="bg-gray-100"
            />
          </FormRow>

          <FormRow label="Position">
            <Input
              inputSize="sm"
              type="text"
              value={staffPosition || 'N/A'}
              disabled
              className="bg-gray-100"
            />
          </FormRow>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <FormRow label="Department *" error={touched.department ? errors.department : undefined}>
            <Input
              inputSize="sm"
              type="text"
              required
              value={formData.department}
              onChange={e => handleFormChange('department', e.target.value)}
              onBlur={() => handleBlur('department')}
              placeholder="Enter department"
              disabled={!canEdit || canEditSupervisorRating}
              className={errors.department && touched.department ? 'border-red-500' : ''}
            />
          </FormRow>

          <FormRow label="Length of Time in Position">
            <Input
              inputSize="sm"
              type="text"
              value={formData.lengthOfTimeInPosition}
              onChange={e => handleFormChange('lengthOfTimeInPosition', e.target.value)}
              placeholder="e.g., 2 years"
              disabled={!canEdit || canEditSupervisorRating}
            />
          </FormRow>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <FormRow
            label="Appraisal Period *"
            error={touched.appraisalPeriod ? errors.appraisalPeriod : undefined}
          >
            {canEdit ? (
              <Select
                value={formData.appraisalPeriod || ''}
                onValueChange={value => handleFormChange('appraisalPeriod', value)}
                disabled={isPending || canEditSupervisorRating}
              >
                <SelectTrigger
                  className={
                    errors.appraisalPeriod && touched.appraisalPeriod ? 'border-red-500' : ''
                  }
                >
                  <SelectValue placeholder="Select Period" />
                </SelectTrigger>
                <SelectContent>
                  {APPRAISAL_PERIODS.map(period => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                inputSize="sm"
                type="text"
                value={formData.appraisalPeriod}
                disabled
                className="bg-gray-100"
              />
            )}
          </FormRow>

          <FormRow label="Length of Time Supervised">
            <Input
              inputSize="sm"
              type="text"
              value={formData.lengthOfTimeSupervised}
              onChange={e => handleFormChange('lengthOfTimeSupervised', e.target.value)}
              placeholder="e.g., 1 year"
              disabled={!canEdit || canEditSupervisorRating}
            />
          </FormRow>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-4">
          <FormRow label="Supervisor *" error={touched.supervisorId ? errors.supervisorId : undefined}>
            {isLoadingSupervisors ? (
              <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
            ) : (
              <Select
                value={formData.supervisorId || ''}
                onValueChange={value => handleFormChange('supervisorId', value)}
                disabled={!canEdit || isPending || canEditSupervisorRating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {supervisors.map((supervisor: IUser) => (
                    <SelectItem key={supervisor.id} value={supervisor.id}>
                      {supervisor.fullName || `${supervisor.firstName} ${supervisor.lastName}`.trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormRow>
        </div>

        {/* Show selected supervisor name */}
        {selectedSupervisorName && (
          <div className="mt-2 text-xs text-gray-500">
            Selected Supervisor: <span className="font-medium">{selectedSupervisorName}</span>
          </div>
        )}
      </div>

      {/* Staff Strategy Integration */}
      {(mode === 'create' || (userRole === 'staff' && requestStatus === 'draft')) &&
        formData.appraisalPeriod && (
          <div className="rounded-lg p-4 border bg-blue-50 border-blue-200">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setShowStaffStrategies(!showStaffStrategies)}
            >
              <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                Load Objectives from Staff Strategy
              </h3>
              {showStaffStrategies ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>

            {showStaffStrategies && (
              <div className="mt-4 space-y-4">
                {isLoadingStrategies ? (
                  <div className="flex justify-center py-4">
                    <SpinnerMini />
                  </div>
                ) : availableStrategies.length > 0 ? (
                  <>
                    <FormRow label="Select Strategy">
                      <Select
                        value={selectedStrategyId}
                        onValueChange={value => {
                          setSelectedStrategyId(value);
                          setFormData(prev => ({ ...prev, staffStrategy: value }));
                          loadObjectivesFromStrategy(value);
                        }}
                        disabled={!canEdit || isPending}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a strategy to load objectives" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableStrategies.map((strategy: Strategy) => (
                            <SelectItem key={strategy.id} value={strategy.id}>
                              {strategy.strategyCode} - {strategy.department}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormRow>
                    <p className="text-xs text-gray-600">
                      This will populate Section 2 with all objectives from the selected strategy.
                      Safeguarding will be added as the final objective.
                    </p>
                  </>
                ) : (
                  <p className="text-gray-600">
                    No staff strategies found for period {formData.appraisalPeriod}. You can still
                    create objectives manually below.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

      {/* Section 2: Performance Objectives */}
      <div className="rounded-lg p-4 border bg-white border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300">
          SECTION 2: PERFORMANCE OBJECTIVES
        </h3>

        {formData.objectives && formData.objectives.length > 0 ? (
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {formData.objectives.map((obj, index) => (
              <div key={index} className="relative bg-gray-50 p-4 rounded-lg border shadow-sm">
                <h4 className="font-medium text-gray-700 mb-3">
                  Objective {index + 1}: {obj.objective || `Objective ${index + 1}`}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormRow label="Employee Rating">
                    <Select
                      value={obj.employeeRating.rating || ''}
                      onValueChange={value =>
                        handleObjectiveRatingChange(index, 'employeeRating', value)
                      }
                      disabled={!canEditEmployeeRating || isPending}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Rating" />
                      </SelectTrigger>
                      <SelectContent>
                        {RATING_OPTIONS.map(option => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {canEditEmployeeRating && (
                      <span className="text-xs text-blue-500">(You can edit)</span>
                    )}
                  </FormRow>

                  {showSupervisorRating && (
                    <FormRow label="Supervisor Rating">
                      <Select
                        value={obj.supervisorRating || ''}
                        onValueChange={value =>
                          handleObjectiveRatingChange(index, 'supervisorRating', value)
                        }
                        disabled={!canEditSupervisorRating || isPending}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Rating" />
                        </SelectTrigger>
                        <SelectContent>
                          {RATING_OPTIONS.map(option => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {canEditSupervisorRating && (
                        <span className="text-xs text-green-500">(You can edit)</span>
                      )}
                    </FormRow>
                  )}
                </div>

                <FormRow label="Achievements / Justification">
                  <textarea
                    className="w-full min-h-[60px] p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
                    value={obj.employeeRating.achievements || ''}
                    onChange={e => handleObjectiveAchievementsChange(index, e.target.value)}
                    placeholder="Briefly justify your rating for this objective..."
                    disabled={!canEditEmployeeRating || isPending}
                  />
                  {canEditEmployeeRating && (
                    <span className="text-xs text-blue-500">(You can edit)</span>
                  )}
                </FormRow>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-center py-4">
            No objectives loaded.{' '}
            {mode === 'create' && 'Select a period and load from staff strategy above.'}
          </p>
        )}

        {/* Safeguarding Section */}
        <div className="mt-6 p-4 bg-white rounded-lg border">
          <h4 className="font-semibold text-gray-700 mb-3">Safeguarding</h4>

          <FormRow label="What have you done to promote a safer culture?">
            <textarea
              className="w-full min-h-[80px] p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
              value={formData.safeguarding.actionsTaken || ''}
              onChange={e => handleSafeguardingChange('actionsTaken', e.target.value)}
              placeholder="I followed due process and protocols..."
              disabled={!canEdit || isPending || canEditSupervisorRating}
            />
            {canEdit && <span className="text-xs text-blue-500">(You can edit)</span>}
          </FormRow>

          <FormRow label="Have you completed the safeguarding training?">
            <div className="flex flex-wrap gap-4">
              {['Yes', 'Partly', 'No'].map(option => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="trainingCompleted"
                    value={option}
                    checked={formData.safeguarding.trainingCompleted === option}
                    onChange={e =>
                      handleSafeguardingChange(
                        'trainingCompleted',
                        e.target.value as 'Yes' | 'Partly' | 'No'
                      )
                    }
                    className="h-4 w-4"
                    disabled={!canEdit || isPending || canEditSupervisorRating}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </FormRow>

          <FormRow label="Areas not understood">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  inputSize="sm"
                  type="text"
                  value={areasNotUnderstoodInput}
                  onChange={e => setAreasNotUnderstoodInput(e.target.value)}
                  placeholder="Add an area you don't understand"
                  className="flex-1"
                  disabled={!canEdit || isPending || canEditSupervisorRating}
                  onKeyPress={e =>
                    e.key === 'Enter' && (e.preventDefault(), addAreaNotUnderstood())
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAreaNotUnderstood}
                  disabled={!canEdit || isPending}
                >
                  Add
                </Button>
              </div>
              {formData.safeguarding.areasNotUnderstood.map((area, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-100 p-2 rounded"
                >
                  <span>{area}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAreaNotUnderstood(idx)}
                    className="text-red-500 hover:text-red-700"
                    disabled={!canEdit || isPending || canEditSupervisorRating}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </FormRow>
        </div>
      </div>

      {/* Section 3: Supervisor's Assessment */}
      {(userRole === 'supervisor' || userRole === 'admin') &&
        (mode === 'edit' ? requestStatus === 'pending' : false) && (
          <div className="rounded-lg p-4 border bg-white border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300 flex items-center">
              <UserCog className="h-5 w-5 mr-2" />
              SECTION 3: SUPERVISOR'S ASSESSMENT
              {canEdit && <span className="text-xs text-green-500 ml-2">(You can edit)</span>}
            </h3>

            <div className="space-y-3">
              {formData.performanceAreas.map((area, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row md:items-center md:justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium text-gray-700 mb-2 md:mb-0">{area.area}:</span>
                  <Select
                    value={area.rating}
                    onValueChange={value => handlePerformanceAreaChange(index, value)}
                    disabled={!canEdit || isPending}
                  >
                    <SelectTrigger className="w-full md:w-64">
                      <SelectValue placeholder="Select Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {PERFORMANCE_RATINGS.map(option => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <FormRow label="Supervisor's Comments">
              <textarea
                className="w-full min-h-[80px] p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
                value={formData.supervisorComments}
                onChange={e => handleFormChange('supervisorComments', e.target.value)}
                placeholder="Enter supervisor's comments..."
                disabled={!canEdit || isPending}
              />
              {canEdit && <span className="text-xs text-green-500">(You can edit)</span>}
            </FormRow>

            <FormRow label="Overall Assessment">
              <Select
                value={formData.overallRating || ''}
                onValueChange={(value: string) =>
                  handleFormChange('overallRating', value as OverallRating)
                }
                disabled={!canEdit || isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Overall Rating" />
                </SelectTrigger>
                <SelectContent>
                  {OVERALL_RATINGS.map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {canEdit && <span className="text-xs text-green-500">(You can edit)</span>}
            </FormRow>
          </div>
        )}

      {/* Section 4: Future Goals */}
      <div className="rounded-lg p-4 border bg-white border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300">
          SECTION 4: FUTURE GOALS
        </h3>

        <FormRow label="Future Goals for next appraisal period">
          <textarea
            className="w-full min-h-[80px] p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
            value={formData.futureGoals}
            onChange={e => handleFormChange('futureGoals', e.target.value)}
            placeholder="Enter future goals..."
            disabled={!canEdit || isPending || canEditSupervisorRating}
          />
          {canEdit && <span className="text-xs text-blue-500">(You can edit)</span>}
        </FormRow>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center w-full gap-4 pt-4 border-t">
        <div className="flex flex-col sm:flex-row gap-3">
          {(mode === 'create' || (userRole === 'staff' && requestStatus === 'draft')) && (
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
              ) : mode === 'create' ? (
                'Save Draft'
              ) : (
                'Update Draft'
              )}
            </Button>
          )}

          {(mode === 'create' ||
            canSubmit ||
            userRole === 'supervisor' ||
            userRole === 'admin') && (
            <Button
              type="submit"
              size="md"
              disabled={isPending || (mode !== 'create' && !isFormValid)}
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
        </div>
      </div>

      {/* Form Status */}
      {mode !== 'create' && !isFormValid && requestStatus === 'draft' && (
        <p className="text-center text-sm text-amber-600">
          Please complete all required fields (*) to submit appraisal
        </p>
      )}
    </form>
  );
};

export default AppraisalForm;