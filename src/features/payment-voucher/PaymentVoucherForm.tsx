// PaymentVoucherForm.tsx - Unified Create/Edit Form with Radix UI (STANDARDIZED)
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

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
import DatePicker from '../../features/datePicker/DatePicker';
import { NumberInput } from '../../components/custom/NumberInput'; // ← ADDED: NumberInput component

// Hooks & Types
import { useUsers } from '../user/Hooks/useUsers';
import { useProjects } from '../project/Hooks/useProjects';
import {
  useSavePaymentVoucher,
  useSendPaymentVoucher,
  useUpdatePaymentVoucher,
} from './Hooks/usePaymentVoucher';
import {
  IPaymentVoucher,
  IProject,
  IAccountCode,
  IUser,
  PaymentVoucherStatus,
} from '../../interfaces';
import { categories, accounts } from './pvConstant';

// FormRow component for consistent layout (matching AdvanceRequestForm)
const FormRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">{label}</Label>
    {children}
  </div>
);

type PaymentVoucherFormData = {
  payingStation: string;
  payTo: string;
  being: string;
  pvDate: string;
  amountInWords: string;
  accountCode: string;
  projectCode: string;
  project: string;
  grossAmount: number;
  vat: number;
  wht: number;
  devLevy: number;
  otherDeductions: number;
  netAmount: number;
  chartOfAccountCategories: string;
  organisationalChartOfAccount: string;
  chartOfAccountCode: string;
  note: string;
  reviewedBy: string | null;
  approvedBy: string | null;
};

interface PaymentVoucherFormProps {
  mode: 'create' | 'edit';
  initialData?: IPaymentVoucher;
}

const PaymentVoucherForm: React.FC<PaymentVoucherFormProps> = ({ mode, initialData }) => {
  // Form State
  const [formData, setFormData] = useState<PaymentVoucherFormData>(() => {
    if (mode === 'edit' && initialData) {
      return {
        payingStation: initialData.payingStation || '',
        payTo: initialData.payTo || '',
        being: initialData.being || '',
        pvDate: initialData.pvDate || new Date().toISOString().split('T')[0],
        amountInWords: initialData.amountInWords || '',
        accountCode: initialData.accountCode || '',
        projectCode: initialData.projectCode || '',
        project: initialData.project || '',
        grossAmount: initialData.grossAmount || 0,
        vat: initialData.vat || 0,
        wht: initialData.wht || 0,
        devLevy: initialData.devLevy || 0,
        otherDeductions: initialData.otherDeductions || 0,
        netAmount: initialData.netAmount || 0,
        chartOfAccountCategories: initialData.chartOfAccountCategories || '',
        organisationalChartOfAccount: initialData.organisationalChartOfAccount || '',
        chartOfAccountCode: initialData.chartOfAccountCode || '',
        note: initialData.note || '',
        reviewedBy: initialData.reviewedBy?.id || null,
        approvedBy: initialData.approvedBy?.id || null,
      };
    }
    return {
      payingStation: '',
      payTo: '',
      being: '',
      pvDate: new Date().toISOString().split('T')[0],
      amountInWords: '',
      accountCode: '',
      projectCode: '',
      project: '',
      grossAmount: 0,
      vat: 0,
      wht: 0,
      devLevy: 0,
      otherDeductions: 0,
      netAmount: 0,
      chartOfAccountCategories: '',
      organisationalChartOfAccount: '',
      chartOfAccountCode: '',
      note: '',
      reviewedBy: null,
      approvedBy: null,
    };
  });

  const [selectedProject, setSelectedProject] = useState<IProject | null>(null);
  const [filteredAccounts, setFilteredAccounts] = useState<{ position: string; code: string }[]>(
    []
  );
  const [vatPercentage, setVatPercentage] = useState(0);
  const [whtPercentage, setWhtPercentage] = useState(0);

  // Hooks
  const { savePaymentVoucher, isPending: isSaving } = useSavePaymentVoucher();
  const { sendPaymentVoucher, isPending: isSending } = useSendPaymentVoucher();
  const { updatePaymentVoucher, isPending: isUpdating } = useUpdatePaymentVoucher(
    mode === 'edit' ? initialData?.id || '' : ''
  );

  const { data: usersData, isLoading: isLoadingUsers } = useUsers({ limit: 1000 });
  const { data: projectData, isLoading: isLoadingProjects } = useProjects({});

  // Memoized data
  const users = useMemo(() => usersData?.data ?? [], [usersData]);
  const projects = useMemo(() => projectData?.data ?? [], [projectData]);

  const isPending = mode === 'create' ? isSaving || isSending : isUpdating;

  // Initialize percentages from existing values
  useEffect(() => {
    if (mode === 'edit' && initialData && initialData.grossAmount > 0) {
      const vatPct = (initialData.vat / initialData.grossAmount) * 100;
      const whtPct = (initialData.wht / initialData.grossAmount) * 100;
      setVatPercentage(isNaN(vatPct) ? 0 : vatPct);
      setWhtPercentage(isNaN(whtPct) ? 0 : whtPct);
    }
  }, [mode, initialData]);

  // Calculate amounts based on percentages
  const calculateDeductions = useCallback(() => {
    const grossAmount = formData.grossAmount || 0;
    const vatAmount = grossAmount * (vatPercentage / 100);
    const whtAmount = grossAmount * (whtPercentage / 100);
    const devLevy = formData.devLevy || 0;
    const otherDeductions = formData.otherDeductions || 0;

    const totalDeductions = vatAmount + whtAmount + devLevy + otherDeductions;
    const netAmount = Math.max(0, grossAmount - totalDeductions);

    setFormData(prev => ({
      ...prev,
      vat: parseFloat(vatAmount.toFixed(2)),
      wht: parseFloat(whtAmount.toFixed(2)),
      netAmount: parseFloat(netAmount.toFixed(2)),
    }));
  }, [
    formData.grossAmount,
    formData.devLevy,
    formData.otherDeductions,
    vatPercentage,
    whtPercentage,
  ]);

  useEffect(() => {
    calculateDeductions();
  }, [calculateDeductions]);

  // Filter accounts when category changes
  useEffect(() => {
    if (formData.chartOfAccountCategories) {
      const selectedCategory = categories.find(
        cat => cat.position === formData.chartOfAccountCategories
      );

      if (selectedCategory && selectedCategory.code !== '--') {
        const filtered = accounts.filter(account => account.code.includes(selectedCategory.code));
        setFilteredAccounts(filtered);
      } else {
        setFilteredAccounts([]);
      }

      setFormData(prev => ({
        ...prev,
        organisationalChartOfAccount: '',
        chartOfAccountCode: '',
      }));
    }
  }, [formData.chartOfAccountCategories]);

  // Set chart of account code when account is selected
  useEffect(() => {
    if (formData.organisationalChartOfAccount) {
      const selectedAccount = accounts.find(
        acc => acc.position === formData.organisationalChartOfAccount
      );

      if (selectedAccount) {
        setFormData(prev => ({
          ...prev,
          chartOfAccountCode: selectedAccount.code,
        }));
      }
    }
  }, [formData.organisationalChartOfAccount]);

  // Form handlers (matching AdvanceRequestForm patterns)
  const handleFormChange = useCallback(
    (field: keyof PaymentVoucherFormData, value: string | number | null) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  const handlePercentageChange = useCallback((type: 'vat' | 'wht', value: number) => {
    if (type === 'vat') {
      setVatPercentage(value);
    } else {
      setWhtPercentage(value);
    }
  }, []);

  const handleProjectChange = useCallback(
    (value: string) => {
      if (value) {
        const selected = projects.find(
          (project: IProject) => `${project.projectTitle} - ${project.projectCode}` === value
        );
        if (selected) {
          setSelectedProject(selected);
          setFormData(prev => ({
            ...prev,
            project: selected.projectTitle,
            projectCode: selected.projectCode,
            accountCode: '', // Reset account code when project changes
          }));
        }
      } else {
        setSelectedProject(null);
        setFormData(prev => ({
          ...prev,
          project: '',
          projectCode: '',
          accountCode: '',
        }));
      }
    },
    [projects]
  );

  // Build submit data (matching AdvanceRequestForm pattern)
  const buildSubmitData = useCallback((): Partial<IPaymentVoucher> => {
    const reviewer = formData.reviewedBy
      ? users.find((u: IUser) => u.id === formData.reviewedBy)
      : undefined;

    const approver = formData.approvedBy
      ? users.find((u: IUser) => u.id === formData.approvedBy)
      : undefined;

    return {
      payingStation: formData.payingStation,
      payTo: formData.payTo,
      being: formData.being,
      pvDate: formData.pvDate,
      amountInWords: formData.amountInWords,
      accountCode: formData.accountCode,
      projectCode: formData.projectCode,
      project: formData.project,
      grossAmount: formData.grossAmount,
      vat: formData.vat,
      wht: formData.wht,
      devLevy: formData.devLevy,
      otherDeductions: formData.otherDeductions,
      netAmount: formData.netAmount,
      chartOfAccountCategories: formData.chartOfAccountCategories,
      organisationalChartOfAccount: formData.organisationalChartOfAccount,
      chartOfAccountCode: formData.chartOfAccountCode,
      note: formData.note,
      reviewedBy: reviewer,
      approvedBy: approver,
    };
  }, [formData, users]);

  // Submit handlers (matching AdvanceRequestForm patterns)
  const handleSave = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const data = {
        ...buildSubmitData(),
        status: 'draft' as PaymentVoucherStatus,
      };

      if (mode === 'create') {
        savePaymentVoucher(data);
      } else {
        updatePaymentVoucher({ data });
      }
    },
    [buildSubmitData, mode, savePaymentVoucher, updatePaymentVoucher]
  );

  const handleSend = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const data = {
        ...buildSubmitData(),
        status: 'pending' as PaymentVoucherStatus,
      };

      if (mode === 'create') {
        sendPaymentVoucher({ data });
      } else {
        updatePaymentVoucher({ data });
      }
    },
    [buildSubmitData, mode, sendPaymentVoucher, updatePaymentVoucher]
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
      {/* Status Display (matching AdvanceRequestForm) */}
      {mode === 'edit' && initialData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <span className="font-bold uppercase">Status:</span>
            <span className="ml-2 capitalize">{initialData.status}</span>
          </div>
          <div>
            <span className="font-bold uppercase">PV Number:</span>
            <span className="ml-2">{initialData.pvNumber}</span>
          </div>
        </div>
      )}

      {/* PV Date - Using the same DatePicker as AdvanceRequestForm */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="PV Date *">
          <DatePicker
            selected={formData.pvDate ? new Date(formData.pvDate) : null}
            onChange={date =>
              handleFormChange('pvDate', date ? date.toISOString().split('T')[0] : null)
            }
            variant="secondary"
            placeholder="Select date"
            disabled={isPending}
          />
        </FormRow>

        <FormRow label="Paying Station *">
          <Input
            inputSize="sm"
            type="text"
            required
            value={formData.payingStation}
            onChange={e => handleFormChange('payingStation', e.target.value)}
            disabled={isPending}
          />
        </FormRow>
      </div>

      {/* Pay To and Being */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Pay To *">
          <Input
            inputSize="sm"
            type="text"
            required
            value={formData.payTo}
            onChange={e => handleFormChange('payTo', e.target.value)}
            disabled={isPending}
          />
        </FormRow>

        <FormRow label="Being *">
          <textarea
            className="w-full min-h-[80px] p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
            maxLength={500}
            value={formData.being}
            onChange={e => handleFormChange('being', e.target.value)}
            disabled={isPending}
            required
          />
        </FormRow>
      </div>

      {/* Amount In Words */}
      <FormRow label="Amount In Words *">
        <textarea
          className="w-full min-h-[80px] p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
          maxLength={1000}
          value={formData.amountInWords}
          onChange={e => handleFormChange('amountInWords', e.target.value)}
          disabled={isPending}
          required
        />
      </FormRow>

      {/* Project Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Project *">
          {isLoadingProjects ? (
            <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
          ) : (
            <Select
              value={
                selectedProject
                  ? `${selectedProject.projectTitle} - ${selectedProject.projectCode}`
                  : ''
              }
              onValueChange={handleProjectChange}
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

        <FormRow label="Project Code">
          <Input
            inputSize="sm"
            type="text"
            value={formData.projectCode}
            readOnly
            disabled
            className="bg-gray-100"
          />
        </FormRow>
      </div>

      {/* Account Code (conditionally shown) */}
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

      {/* Financial Information - Using NumberInput for numeric fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Gross Amount (₦) *">
          <NumberInput
            inputSize="sm"
            min={0}
            step={0.01}
            required
            value={formData.grossAmount}
            onChange={value => handleFormChange('grossAmount', value ?? 0)}
            disabled={isPending}
            placeholder="0.00"
          />
        </FormRow>

        <FormRow label="Net Amount (₦)">
          <Input
            inputSize="sm"
            type="number"
            min="0"
            step="0.01"
            value={formData.netAmount}
            disabled
            className="bg-gray-100"
          />
        </FormRow>
      </div>

      {/* Deductions Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Deductions</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormRow label="VAT (%)">
            <NumberInput
              inputSize="sm"
              min={0}
              max={100}
              step={0.1}
              value={vatPercentage}
              onChange={value => handlePercentageChange('vat', value ?? 0)}
              disabled={isPending}
              placeholder="0"
            />
          </FormRow>

          <FormRow label="WHT (%)">
            <NumberInput
              inputSize="sm"
              min={0}
              max={100}
              step={0.1}
              value={whtPercentage}
              onChange={value => handlePercentageChange('wht', value ?? 0)}
              disabled={isPending}
              placeholder="0"
            />
          </FormRow>

          <FormRow label="Dev Levy (₦)">
            <NumberInput
              inputSize="sm"
              min={0}
              step={0.01}
              value={formData.devLevy}
              onChange={value => handleFormChange('devLevy', value ?? 0)}
              disabled={isPending}
              placeholder="0.00"
            />
          </FormRow>

          <FormRow label="Other Deductions (₦)">
            <NumberInput
              inputSize="sm"
              min={0}
              step={0.01}
              value={formData.otherDeductions}
              onChange={value => handleFormChange('otherDeductions', value ?? 0)}
              disabled={isPending}
              placeholder="0.00"
            />
          </FormRow>
        </div>

        {/* Calculated Deduction Amounts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormRow label="VAT Amount (₦)">
            <Input
              inputSize="sm"
              type="number"
              value={formData.vat}
              disabled
              className="bg-gray-100"
            />
          </FormRow>

          <FormRow label="WHT Amount (₦)">
            <Input
              inputSize="sm"
              type="number"
              value={formData.wht}
              disabled
              className="bg-gray-100"
            />
          </FormRow>
        </div>
      </div>

      {/* Chart of Accounts Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Chart of Accounts
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormRow label="Chart of Account Categories *">
            <Select
              value={formData.chartOfAccountCategories || ''}
              onValueChange={value => handleFormChange('chartOfAccountCategories', value)}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.position} value={cat.position}>
                    {cat.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>

          <FormRow label="Organisational Chart of Account *">
            <Select
              value={formData.organisationalChartOfAccount || ''}
              onValueChange={value => handleFormChange('organisationalChartOfAccount', value)}
              disabled={
                isPending || !formData.chartOfAccountCategories || filteredAccounts.length === 0
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Account" />
              </SelectTrigger>
              <SelectContent>
                {filteredAccounts.map(acc => (
                  <SelectItem key={acc.position} value={acc.position}>
                    {acc.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
        </div>

        <FormRow label="Chart of Account Code *">
          <Input
            inputSize="sm"
            type="text"
            value={formData.chartOfAccountCode}
            disabled
            className="bg-gray-100"
          />
        </FormRow>
      </div>

      {/* Note */}
      <FormRow label="Note">
        <textarea
          className="w-full min-h-[120px] p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          maxLength={4000}
          value={formData.note || ''}
          onChange={e => handleFormChange('note', e.target.value)}
          disabled={isPending}
        />
      </FormRow>

      {/* Reviewer Selection */}
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
              {users
                .filter((user: IUser) => user.role === 'REVIEWER' || user.role === 'ADMIN')
                .map((user: IUser) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}
      </FormRow>

      {/* Submit Button */}
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

export default PaymentVoucherForm;
