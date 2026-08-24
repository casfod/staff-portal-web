// TravelRequestForm.tsx
import React, { useMemo, useState, useCallback } from 'react';
import { FaPlus } from 'react-icons/fa';
import { Loader2, X } from 'lucide-react';

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
  useSaveTravelRequest,
  useSendTravelRequest,
  useUpdateTravelRequest,
} from './Hooks/useTravelRequests';
import { ITravelRequest, IProject, IAccountCode, IExpenseItem } from '../../interfaces';
import { expenses } from '../../assets/expenses';

type TravelRequestFormData = Partial<
  Omit<ITravelRequest, 'reviewedBy' | 'approvedBy' | 'project'>
> & {
  accountCode: string;
  expenseChargedTo: string;
  project: string | null;
  reviewedBy: string | null;
  approvedBy: string | null;
  travelRequest: { from: string; to: string };
};

interface TravelRequestFormProps {
  mode: 'create' | 'edit';
  initialData?: ITravelRequest;
}

const calculateItemTotal = (item: IExpenseItem): number => {
  return parseFloat(
    ((item.frequency || 1) * (item.quantity || 1) * (item.unitCost || 0)).toFixed(2)
  );
};

const TravelRequestForm: React.FC<TravelRequestFormProps> = ({ mode, initialData }) => {
  const [formData, setFormData] = useState<TravelRequestFormData>(() => {
    if (mode === 'edit' && initialData) {
      return {
        travelReason: initialData.travelReason || '',
        travelRequest: initialData.travelRequest || { from: '', to: '' },
        dayOfDeparture: initialData.dayOfDeparture || '',
        dayOfReturn: initialData.dayOfReturn || '',
        expenseChargedTo: initialData.expenseChargedTo || '',
        accountCode: initialData.accountCode || '',
        budget: initialData.budget || 0,
        amountInWords: initialData.amountInWords || '',
        reviewedBy: initialData.reviewedBy?.id || null,
        approvedBy: initialData.approvedBy?.id || null,
        project:
          typeof initialData.project === 'string'
            ? initialData.project
            : (initialData.project?.id ?? null),
      };
    }
    return {
      travelReason: '',
      travelRequest: { from: '', to: '' },
      dayOfDeparture: '',
      dayOfReturn: '',
      expenseChargedTo: '',
      accountCode: '',
      budget: 0,
      amountInWords: '',
      reviewedBy: null,
      approvedBy: null,
      project: null,
    };
  });

  const [travelItems, setTravelItems] = useState<IExpenseItem[]>(
    mode === 'edit' && initialData?.expenses ? initialData.expenses : []
  );

  const [selectedProject, setSelectedProject] = useState<IProject | null>(null);

  const { saveTravelRequest, isPending: isSaving } = useSaveTravelRequest();
  const { sendTravelRequest, isPending: isSending } = useSendTravelRequest();
  const { updateTravelRequest, isPending: isUpdating } = useUpdateTravelRequest(
    mode === 'edit' ? initialData?.id || '' : ''
  );

  const { data: usersData, isLoading: isLoadingUsers } = useUsers({ limit: 1000 });
  const { data: projectData, isLoading: isLoadingProjects } = useProjects({});

  const users = useMemo(() => usersData?.data ?? [], [usersData]);
  const projects = useMemo(() => projectData?.data ?? [], [projectData]);

  const isPending = mode === 'create' ? isSaving || isSending : isUpdating;

  const totalBudget = useMemo(() => {
    return travelItems.reduce((sum, item) => sum + (item.total || 0), 0);
  }, [travelItems]);

  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      budget: totalBudget,
    }));
  }, [totalBudget]);

  const handleFormChange = useCallback(
    (field: keyof TravelRequestFormData, value: string | number | null) => {
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
      parentField: keyof TravelRequestFormData,
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

  const handleItemChange = useCallback(
    (index: number, field: keyof IExpenseItem, value: string | number | null) => {
      setTravelItems(prevItems => {
        const newItems = [...prevItems];
        const updatedItem = { ...newItems[index], [field]: value as never };

        if (['frequency', 'quantity', 'unitCost'].includes(field as string)) {
          updatedItem.total = calculateItemTotal(updatedItem);
        }

        newItems[index] = updatedItem;
        return newItems;
      });
    },
    []
  );

  const addItem = useCallback(() => {
    setTravelItems(prev => [
      ...prev,
      {
        expense: '',
        description: '',
        frequency: 1,
        quantity: 1,
        unit: '',
        unitCost: 0,
        total: 0,
      },
    ]);
  }, []);

  const removeItem = useCallback((index: number) => {
    setTravelItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const getItemKey = useCallback((index: number) => {
    return `travel-item-${index}`;
  }, []);

  const buildSubmitData = useCallback((): Partial<ITravelRequest> => {
    const reviewer = formData.reviewedBy
      ? users.find(u => u.id === formData.reviewedBy)
      : undefined;

    const approver = formData.approvedBy
      ? users.find(u => u.id === formData.approvedBy)
      : undefined;

    return {
      travelReason: formData.travelReason,
      travelRequest: formData.travelRequest,
      dayOfDeparture: formData.dayOfDeparture,
      dayOfReturn: formData.dayOfReturn,
      expenseChargedTo: formData.expenseChargedTo,
      accountCode: formData.accountCode,
      budget: formData.budget,
      amountInWords: formData.amountInWords,
      reviewedBy: reviewer,
      approvedBy: approver,
      project: formData.project || undefined,
      expenses: travelItems.map(item => ({
        ...item,
        total: item.frequency * item.quantity * item.unitCost,
      })),
    };
  }, [formData, users, travelItems]);

  const handleSave = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const data = buildSubmitData();

      if (mode === 'create') {
        saveTravelRequest(data);
      } else {
        updateTravelRequest({ data });
      }
    },
    [buildSubmitData, mode, saveTravelRequest, updateTravelRequest]
  );

  const handleSend = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const data = buildSubmitData();
      sendTravelRequest({ data });
    },
    [buildSubmitData, sendTravelRequest]
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

  const renderItem = useCallback(
    (item: IExpenseItem, index: number) => {
      const total = calculateItemTotal(item);

      return (
        <div
          key={getItemKey(index)}
          className="relative bg-gray-50 p-4 rounded-lg border shadow-sm"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => removeItem(index)}
            disabled={isPending}
          >
            <X className="h-4 w-4" />
          </Button>

          <h4 className="text-sm font-semibold text-gray-700 mb-3">EXPENSE {index + 1}</h4>

          <FormRow label="Expense *">
            <Select
              value={item.expense || ''}
              onValueChange={value => handleItemChange(index, 'expense', value)}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an Expense" />
              </SelectTrigger>
              <SelectContent>
                {expenses.map(expense => (
                  <SelectItem key={expense.name} value={expense.name}>
                    {expense.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <FormRow label="Frequency *">
              <NumberInput
                inputSize="sm"
                min={1}
                step={1}
                required
                value={item.frequency}
                onChange={value => handleItemChange(index, 'frequency', value ?? 1)}
                disabled={isPending}
                placeholder="Enter frequency"
              />
            </FormRow>

            <FormRow label="Quantity *">
              <NumberInput
                inputSize="sm"
                min={1}
                step={1}
                required
                value={item.quantity}
                onChange={value => handleItemChange(index, 'quantity', value ?? 1)}
                disabled={isPending}
                placeholder="Enter quantity"
              />
            </FormRow>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <FormRow label="Unit">
              <Input
                inputSize="sm"
                type="text"
                value={item.unit || ''}
                onChange={e => handleItemChange(index, 'unit', e.target.value)}
                disabled={isPending}
              />
            </FormRow>

            <FormRow label="Unit Cost (₦) *">
              <NumberInput
                inputSize="sm"
                min={0}
                step={0.01}
                required
                value={item.unitCost}
                onChange={value => handleItemChange(index, 'unitCost', value ?? 0)}
                disabled={isPending}
                placeholder="0.00"
              />
            </FormRow>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <FormRow label="Total (₦) *">
              <Input
                inputSize="sm"
                type="number"
                required
                value={total}
                disabled={true}
                className="bg-gray-100"
              />
            </FormRow>
          </div>

          <FormRow label="Description">
            <textarea
              className="w-full min-h-[60px] p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
              value={item.description || ''}
              onChange={e => handleItemChange(index, 'description', e.target.value)}
              disabled={isPending}
            />
          </FormRow>
        </div>
      );
    },
    [getItemKey, handleItemChange, removeItem, isPending]
  );

  return (
    <form className="space-y-6">
      {mode === 'edit' && initialData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <span className="font-bold uppercase">Status:</span>
            <span className="ml-2 capitalize">{initialData.status}</span>
          </div>
          <div>
            <span className="font-bold uppercase">TR Number:</span>
            <span className="ml-2">{initialData.trNumber}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Day Of Departure *">
          <DatePicker
            selected={formData.dayOfDeparture || null}
            onChange={date => handleFormChange('dayOfDeparture', date ? date.toISOString() : '')}
            variant="secondary"
            placeholder="Select date"
            clearable={true}
            disabled={isPending}
          />
        </FormRow>

        {formData.dayOfDeparture && (
          <FormRow label="Day Of Return *">
            <DatePicker
              selected={formData.dayOfReturn || null}
              onChange={date => handleFormChange('dayOfReturn', date ? date.toISOString() : '')}
              variant="secondary"
              placeholder="Select date"
              clearable={true}
              minDate={formData.dayOfDeparture}
              requiredTrigger={!!formData.dayOfDeparture}
              disabled={isPending}
            />
          </FormRow>
        )}
      </div>

      <FormRow label="Travel Reason *">
        <textarea
          className="w-full min-h-[120px] p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          maxLength={4000}
          value={formData.travelReason || ''}
          onChange={e => handleFormChange('travelReason', e.target.value)}
          disabled={isPending}
          required
        />
      </FormRow>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Departure (From) *">
          <Input
            inputSize="sm"
            type="text"
            required
            value={formData.travelRequest?.from || ''}
            onChange={e => handleNestedChange('travelRequest', 'from', e.target.value)}
            disabled={isPending}
          />
        </FormRow>

        <FormRow label="Destination (To) *">
          <Input
            inputSize="sm"
            type="text"
            required
            value={formData.travelRequest?.to || ''}
            onChange={e => handleNestedChange('travelRequest', 'to', e.target.value)}
            disabled={isPending}
          />
        </FormRow>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Expenses</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto p-4 border rounded-lg">
          {travelItems.map((item, index) => renderItem(item, index))}
        </div>

        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">
            {travelItems.length} expense{travelItems.length > 1 ? 's' : ''} added
          </p>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <FaPlus className="h-4 w-4 mr-1" /> Add Expense
          </Button>
        </div>
      </div>

      <FormRow label="Budget *">
        <Input
          inputSize="sm"
          type="number"
          value={formData.budget || 0}
          readOnly
          required
          className="bg-gray-100"
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

export default TravelRequestForm;
