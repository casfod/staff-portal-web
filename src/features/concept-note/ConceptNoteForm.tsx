// ConceptNoteForm.tsx
import React, { useMemo, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

// Radix UI Components
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { NumberInput } from '../../components/custom/NumberInput';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

// Custom Components
import DatePicker from '../../features/datePicker/DatePicker';
import FormRow from '../../components/custom/FormRow';

// Hooks & Types
import { useUsers } from '../user/Hooks/useUsers';
import { useProjects } from '../project/Hooks/useProjects';
import {
  useSaveConceptNote,
  useSendConceptNote,
  useUpdateConceptNote,
} from './Hooks/useConceptNotes';
import { IConceptNote, IProject, IAccountCode } from '../../interfaces';
import { localStorageUser } from '../../utils/localStorageUser';

type ConceptNoteFormData = Partial<
  Omit<IConceptNote, 'reviewedBy' | 'approvedBy' | 'project' | 'createdBy'>
> & {
  accountCode: string;
  expenseChargedTo: string;
  project: string | null;
  reviewedBy: string | null;
  approvedBy: string | null;
  activityPeriod: { from: string; to: string };
};

interface ConceptNoteFormProps {
  mode: 'create' | 'edit';
  initialData?: IConceptNote;
}

const ConceptNoteForm: React.FC<ConceptNoteFormProps> = ({ mode, initialData }) => {
  const currentUser = localStorageUser();

  const [formData, setFormData] = useState<ConceptNoteFormData>(() => {
    if (mode === 'edit' && initialData) {
      return {
        activityTitle: initialData.activityTitle || '',
        activityLocation: initialData.activityLocation || '',
        activityPeriod: initialData.activityPeriod || { from: '', to: '' },
        backgroundContext: initialData.backgroundContext || '',
        objectivesPurpose: initialData.objectivesPurpose || '',
        detailedActivityDescription: initialData.detailedActivityDescription || '',
        strategicPlan: initialData.strategicPlan || '',
        benefitsOfProject: initialData.benefitsOfProject || '',
        meansOfVerification: initialData.meansOfVerification || '',
        activityBudget: initialData.activityBudget || 0,
        expenseChargedTo: initialData.expenseChargedTo || '',
        accountCode: initialData.accountCode || '',
        reviewedBy: initialData.reviewedBy?.id || null,
        approvedBy: initialData.approvedBy?.id || null,
        project:
          typeof initialData.project === 'string'
            ? initialData.project
            : (initialData.project?.id ?? null),
      };
    }
    return {
      activityTitle: '',
      activityLocation: '',
      activityPeriod: { from: '', to: '' },
      backgroundContext: '',
      objectivesPurpose: '',
      detailedActivityDescription: '',
      strategicPlan: '',
      benefitsOfProject: '',
      meansOfVerification: '',
      activityBudget: 0,
      expenseChargedTo: '',
      accountCode: '',
      reviewedBy: null,
      approvedBy: null,
      project: null,
    };
  });

  const [selectedProject, setSelectedProject] = useState<IProject | null>(null);

  const { saveConceptNote, isPending: isSaving } = useSaveConceptNote();
  const { sendConceptNote, isPending: isSending } = useSendConceptNote();
  const { updateConceptNote, isPending: isUpdating } = useUpdateConceptNote(
    mode === 'edit' ? initialData?.id || '' : ''
  );

  const { data: usersData, isLoading: isLoadingUsers } = useUsers({ limit: 1000 });
  const { data: projectData, isLoading: isLoadingProjects } = useProjects({});

  const users = useMemo(() => {
    const allUsers = usersData?.data ?? [];
    return allUsers.filter(user => user.id !== currentUser.id);
  }, [usersData, currentUser]);

  const projects = useMemo(() => projectData?.data ?? [], [projectData]);

  const isPending = mode === 'create' ? isSaving || isSending : isUpdating;

  const handleFormChange = useCallback(
    (field: keyof ConceptNoteFormData, value: string | number | null) => {
      if (field === 'expenseChargedTo') {
        const selected = projects.find(
          (project: IProject) => `${project.projectTitle} - ${project.projectCode}` === value
        );
        setSelectedProject(selected || null);
        setFormData(prev => ({
          ...prev,
          project: selected?.id || null,
          expenseChargedTo: value as string,
          accountCode: '',
        }));
      } else {
        setFormData(prev => ({ ...prev, [field]: value }));
      }
    },
    [projects]
  );

  const handleNestedChange = useCallback(
    (
      parentField: keyof ConceptNoteFormData,
      field: string,
      value: Date | string | number | null
    ) => {
      setFormData(prev => ({
        ...prev,
        [parentField]: {
          ...(prev[parentField] as object),
          [field]: value instanceof Date ? value.toISOString() : value,
        },
      }));
    },
    []
  );

  const buildSubmitData = useCallback((): Partial<IConceptNote> => {
    const reviewer = formData.reviewedBy
      ? users.find(u => u.id === formData.reviewedBy)
      : undefined;

    const approver = formData.approvedBy
      ? users.find(u => u.id === formData.approvedBy)
      : undefined;

    return {
      activityTitle: formData.activityTitle,
      activityLocation: formData.activityLocation,
      activityPeriod: formData.activityPeriod,
      backgroundContext: formData.backgroundContext,
      objectivesPurpose: formData.objectivesPurpose,
      detailedActivityDescription: formData.detailedActivityDescription,
      strategicPlan: formData.strategicPlan,
      benefitsOfProject: formData.benefitsOfProject,
      meansOfVerification: formData.meansOfVerification,
      activityBudget: formData.activityBudget || 0,
      expenseChargedTo: formData.expenseChargedTo,
      accountCode: formData.accountCode,
      reviewedBy: reviewer,
      approvedBy: approver,
      project: formData.project || undefined,
    };
  }, [formData, users]);

  const handleSave = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const data = buildSubmitData();

      if (mode === 'create') {
        saveConceptNote(data);
      } else {
        updateConceptNote({ data });
      }
    },
    [buildSubmitData, mode, saveConceptNote, updateConceptNote]
  );

  const handleSend = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const data = buildSubmitData();
      sendConceptNote({ data });
    },
    [buildSubmitData, sendConceptNote]
  );

  const getSubmitLabel = useCallback(() => {
    if (isPending) {
      return mode === 'create' ? 'Creating...' : 'Updating...';
    }
    if (mode === 'create') {
      return formData.reviewedBy ? 'Save and Send' : 'Save as Draft';
    }
    return formData.reviewedBy ? 'Update and Send' : 'Update as Draft';
  }, [isPending, mode, formData.reviewedBy]);

  const getSubmitHandler = useCallback(() => {
    const label = getSubmitLabel();
    if (label.includes('Send')) {
      return handleSend;
    }
    return handleSave;
  }, [getSubmitLabel, handleSend, handleSave]);

  return (
    <form className="space-y-6">
      {mode === 'edit' && initialData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <span className="font-bold uppercase">Status:</span>
            <span className="ml-2 capitalize">{initialData.status}</span>
          </div>
          <div>
            <span className="font-bold uppercase">CN Number:</span>
            <span className="ml-2">{initialData.cnNumber}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Expense Charged To *">
          {isLoadingProjects ? (
            <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
          ) : (
            <Select
              value={formData.expenseChargedTo || ''}
              onValueChange={value => handleFormChange('expenseChargedTo', value)}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project: IProject) => (
                  <SelectItem
                    key={project.id}
                    value={`${project.projectTitle} - ${project.projectCode}`}
                  >
                    {project.projectCode} - {project.projectTitle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormRow>

        {selectedProject && (
          <FormRow label="Account Code *">
            <Select
              value={formData.accountCode || ''}
              onValueChange={value => handleFormChange('accountCode', value)}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Account Code" />
              </SelectTrigger>
              <SelectContent>
                {selectedProject.accountCodes?.map((account: IAccountCode) => (
                  <SelectItem key={account.name} value={account.name}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Activity Title *">
          <Input
            inputSize="sm"
            type="text"
            required
            value={formData.activityTitle || ''}
            onChange={e => handleFormChange('activityTitle', e.target.value)}
            disabled={isPending}
          />
        </FormRow>

        <FormRow label="Activity Location *">
          <Input
            inputSize="sm"
            type="text"
            required
            value={formData.activityLocation || ''}
            onChange={e => handleFormChange('activityLocation', e.target.value)}
            disabled={isPending}
          />
        </FormRow>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Activity Period (From) *">
          <DatePicker
            selected={formData.activityPeriod?.from || null}
            onChange={date =>
              handleNestedChange('activityPeriod', 'from', date ? date.toISOString() : null)
            }
            variant="secondary"
            placeholder="Select date"
            disabled={isPending}
          />
        </FormRow>

        {formData.activityPeriod?.from && (
          <FormRow label="Activity Period (To) *">
            <DatePicker
              selected={formData.activityPeriod?.to || null}
              onChange={date =>
                handleNestedChange('activityPeriod', 'to', date ? date.toISOString() : null)
              }
              variant="secondary"
              placeholder="Select date"
              minDate={formData.activityPeriod?.from}
              requiredTrigger={!!formData.activityPeriod?.from}
              disabled={isPending}
            />
          </FormRow>
        )}
      </div>

      <FormRow label="Activity Budget *">
        <NumberInput
          inputSize="sm"
          min={0}
          step={0.01}
          required
          value={formData.activityBudget || 0}
          onChange={value => handleFormChange('activityBudget', value ?? 0)}
          disabled={isPending}
          placeholder="0.00"
        />
      </FormRow>

      {[
        { key: 'backgroundContext', label: 'Background Context *' },
        { key: 'objectivesPurpose', label: 'Objectives/Purpose *' },
        { key: 'detailedActivityDescription', label: 'Detailed Activity Description *' },
        { key: 'strategicPlan', label: 'Strategic Plan *' },
        { key: 'benefitsOfProject', label: 'Benefits of Project *' },
      ].map(({ key, label }) => (
        <FormRow key={key} label={label}>
          <textarea
            className="w-full min-h-[120px] p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            maxLength={4000}
            value={(formData[key as keyof ConceptNoteFormData] as string) || ''}
            onChange={e => handleFormChange(key as keyof ConceptNoteFormData, e.target.value)}
            disabled={isPending}
            required
          />
        </FormRow>
      ))}

      <FormRow label="Means Of Verification *">
        <Input
          inputSize="sm"
          type="text"
          required
          value={formData.meansOfVerification || ''}
          onChange={e => handleFormChange('meansOfVerification', e.target.value)}
          disabled={isPending}
        />
      </FormRow>

      <FormRow label="Reviewed By *">
        {isLoadingUsers ? (
          <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
        ) : (
          <Select
            value={formData.reviewedBy || ''}
            onValueChange={value => handleFormChange('reviewedBy', value)}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Reviewer" />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </FormRow>

      <div className="flex justify-center w-full gap-4 pt-4 border-t">
        <Button
          type="submit"
          size="md"
          disabled={isPending}
          onClick={getSubmitHandler()}
          className="min-w-[150px]"
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
      </div>
    </form>
  );
};

export default ConceptNoteForm;
