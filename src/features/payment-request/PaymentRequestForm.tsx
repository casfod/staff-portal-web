// PaymentRequestForm.tsx - Fixed Version
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
  useSavePaymentRequest,
  useSendPaymentRequest,
  useUpdatePaymentRequest,
} from './Hooks/usePaymentRequests';
import { IPaymentRequest, IProject, IAccountCode } from '../../interfaces';
import { bankNames } from '../../assets/Banks';

type PaymentRequestFormData = Partial<
  Omit<
    IPaymentRequest,
    | 'reviewedBy'
    | 'approvedBy'
    | 'project'
    | 'createdBy'
    | 'requestedAt'
    | 'reviewedAt'
    | 'approvedAt'
    | 'comments'
    | 'copiedTo'
    | 'status'
    | 'files'
    | 'createdAt'
    | 'updatedAt'
  >
> & {
  accountCode?: string;
  expenseChargedTo?: string;
  project?: string | null;
  reviewedBy?: string | null;
  approvedBy?: string | null;
  grantCode?: string;
};

const NO_PROJECT_VALUE = '__no_project__';

interface PaymentRequestFormProps {
  mode: 'create' | 'edit';
  initialData?: IPaymentRequest;
}

const PaymentRequestForm: React.FC<PaymentRequestFormProps> = ({ mode, initialData }) => {
  const [formData, setFormData] = useState<PaymentRequestFormData>(() => {
    if (mode === 'edit' && initialData) {
      return {
        purposeOfExpense: initialData.purposeOfExpense || '',
        amountInWords: initialData.amountInWords || '',
        amountInFigure: initialData.amountInFigure || 0,
        grantCode: initialData.grantCode || '',
        dateOfExpense: initialData.dateOfExpense || '',
        specialInstruction: initialData.specialInstruction || '',
        accountNumber: initialData.accountNumber || '',
        accountName: initialData.accountName || '',
        bankName: initialData.bankName || '',
        accountCode: '',
        expenseChargedTo: '',
        project: null,
        reviewedBy: initialData.reviewedBy?.id || null,
        approvedBy: initialData.approvedBy?.id || null,
      };
    }
    return {
      purposeOfExpense: '',
      amountInWords: '',
      amountInFigure: 0,
      grantCode: '',
      dateOfExpense: '',
      specialInstruction: '',
      accountNumber: '',
      accountName: '',
      bankName: '',
      accountCode: '',
      expenseChargedTo: '',
      project: null,
      reviewedBy: null,
      approvedBy: null,
    };
  });

  const [selectedProject, setSelectedProject] = useState<IProject | null>(null);

  const { savePaymentRequest, isPending: isSaving } = useSavePaymentRequest();
  const { sendPaymentRequest, isPending: isSending } = useSendPaymentRequest();
  const { updatePaymentRequest, isPending: isUpdating } = useUpdatePaymentRequest(
    mode === 'edit' ? initialData?.id || '' : ''
  );

  const { data: usersData, isLoading: isLoadingUsers } = useUsers({ limit: 1000 });
  const { data: projectData, isLoading: isLoadingProjects } = useProjects({});

  const users = useMemo(() => usersData?.data ?? [], [usersData]);
  const projects = useMemo(() => projectData?.data ?? [], [projectData]);

  const isPending = mode === 'create' ? isSaving || isSending : isUpdating;

  const handleFormChange = useCallback(
    (field: keyof PaymentRequestFormData, value: string | number | null) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleProjectsChange = useCallback(
    (value: string) => {
      if (value && value !== NO_PROJECT_VALUE) {
        const selected = projects.find(
          (project: IProject) => `${project.projectTitle} - ${project.projectCode}` === value
        );
        if (selected) {
          setSelectedProject(selected);
          setFormData(prev => ({
            ...prev,
            project: selected.id,
            grantCode: selected.projectCode,
          }));
        }
      } else {
        setSelectedProject(null);
        setFormData(prev => ({
          ...prev,
          project: null,
          grantCode: '',
        }));
      }
    },
    [projects]
  );

  const buildSubmitData = useCallback((): Partial<IPaymentRequest> => {
    const reviewer = formData.reviewedBy
      ? users.find(u => u.id === formData.reviewedBy)
      : undefined;

    const approver = formData.approvedBy
      ? users.find(u => u.id === formData.approvedBy)
      : undefined;

    return {
      purposeOfExpense: formData.purposeOfExpense,
      amountInWords: formData.amountInWords,
      amountInFigure: formData.amountInFigure || 0,
      grantCode: formData.grantCode,
      dateOfExpense: formData.dateOfExpense,
      specialInstruction: formData.specialInstruction,
      accountNumber: formData.accountNumber,
      accountName: formData.accountName,
      bankName: formData.bankName,
      reviewedBy: reviewer,
      approvedBy: approver,
    };
  }, [formData, users]);

  const handleSave = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const data = buildSubmitData();

      if (mode === 'create') {
        savePaymentRequest(data);
      } else {
        updatePaymentRequest({ data });
      }
    },
    [buildSubmitData, mode, savePaymentRequest, updatePaymentRequest]
  );

  const handleSend = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const data = buildSubmitData();
      sendPaymentRequest({ data });
    },
    [buildSubmitData, sendPaymentRequest]
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
    <form className="space-y-6" onSubmit={getSubmitHandler()}>
      {mode === 'edit' && initialData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <span className="font-bold uppercase">Status:</span>
            <span className="ml-2 capitalize">{initialData.status}</span>
          </div>
          <div>
            <span className="font-bold uppercase">PMR Number:</span>
            <span className="ml-2">{initialData.pmrNumber}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Project">
          {isLoadingProjects ? (
            <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
          ) : (
            <Select
              value={
                selectedProject
                  ? `${selectedProject.projectTitle} - ${selectedProject.projectCode}`
                  : NO_PROJECT_VALUE
              }
              onValueChange={handleProjectsChange}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_PROJECT_VALUE}>None</SelectItem>
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

        {selectedProject ? (
          <FormRow label="Grant Code *">
            <Select
              value={formData.grantCode || ''}
              onValueChange={value => handleFormChange('grantCode', value)}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Grant Code" />
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
        ) : (
          formData.grantCode && (
            <FormRow label="Grant Code">
              <Input inputSize="sm" type="text" value={formData.grantCode} disabled readOnly />
              <p className="text-xs text-gray-500 mt-1">
                Select a project above to change the grant code.
              </p>
            </FormRow>
          )
        )}
      </div>

      <FormRow label="Date Of Expense *">
        <DatePicker
          selected={formData.dateOfExpense || null}
          onChange={date => handleFormChange('dateOfExpense', date ? date.toISOString() : '')}
          variant="secondary"
          placeholder="Select date"
          clearable={true}
          disabled={isPending}
        />
      </FormRow>

      <FormRow label="Purpose Of Expense *">
        <textarea
          className="w-full min-h-[120px] p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          maxLength={4000}
          value={formData.purposeOfExpense || ''}
          onChange={e => handleFormChange('purposeOfExpense', e.target.value)}
          disabled={isPending}
          required
        />
      </FormRow>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Amount In Figure *">
          <NumberInput
            inputSize="sm"
            min={0}
            step={0.01}
            required
            value={formData.amountInFigure || 0}
            onChange={value => handleFormChange('amountInFigure', value ?? 0)}
            disabled={isPending}
            placeholder="0.00"
          />
        </FormRow>

        <FormRow label="Amount In Words *">
          <Input
            inputSize="sm"
            type="text"
            required
            value={formData.amountInWords || ''}
            onChange={e => handleFormChange('amountInWords', e.target.value)}
            disabled={isPending}
          />
        </FormRow>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Account Number *">
          <Input
            inputSize="sm"
            type="text"
            required
            value={formData.accountNumber || ''}
            onChange={e => handleFormChange('accountNumber', e.target.value)}
            placeholder="10-digit account number"
            maxLength={10}
            minLength={10}
            disabled={isPending}
          />
        </FormRow>

        <FormRow label="Account Name *">
          <Input
            inputSize="sm"
            type="text"
            required
            value={formData.accountName || ''}
            onChange={e => handleFormChange('accountName', e.target.value)}
            disabled={isPending}
          />
        </FormRow>
      </div>

      <FormRow label="Bank Name *">
        <Select
          value={formData.bankName || ''}
          onValueChange={value => handleFormChange('bankName', value)}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a Bank" />
          </SelectTrigger>
          <SelectContent>
            {bankNames.map(bank => (
              <SelectItem key={bank.name} value={bank.name}>
                {bank.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormRow>

      <FormRow label="Special Instruction *">
        <textarea
          className="w-full min-h-[120px] p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          maxLength={4000}
          value={formData.specialInstruction || ''}
          onChange={e => handleFormChange('specialInstruction', e.target.value)}
          disabled={isPending}
          required
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
        <Button type="submit" size="md" disabled={isPending} className="min-w-[150px]">
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

export default PaymentRequestForm;
