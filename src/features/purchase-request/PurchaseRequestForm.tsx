// PurchaseRequestForm.tsx - Combined Create/Edit Form with Radix UI (FIXED)
import React, { useMemo, useState, useCallback } from 'react';
import { FaPlus } from 'react-icons/fa';
import { Loader2, X } from 'lucide-react';

// Radix UI Components
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

// Custom Components
import DatePicker from '../../features/datePicker/DatePicker';

// Hooks & Types
import { useReviewers } from '../user/Hooks/useUsers';
import { useProjects } from '../project/Hooks/useProjects';
import {
  useSavePurchaseRequest,
  useSendPurchaseRequest,
  useUpdatePurchaseRequest,
} from './Hooks/PRHook';
import { IItemGroup, IPurchaseRequest, IProject, IAccountCode, IUser } from '../../interfaces';

interface PurchaseRequestFormData {
  department: string;
  suggestedSupplier: string;
  address: string;
  finalDeliveryPoint: string;
  city: string;
  periodOfActivity: { from: string; to: string };
  purchaseRequestDate: string;
  activityDescription: string;
  expenseChargedTo: string;
  accountCode: string;
  financeReviewBy: string | null;
  procurementReviewBy: string | null;
  financeReviewStatus?: 'pending' | 'approved' | 'rejected';
  procurementReviewStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string | null;
  project: string | null;
  itemGroups?: IItemGroup[];
}

interface PurchaseRequestFormProps {
  mode: 'create' | 'edit';
  initialData?: IPurchaseRequest;
}

const FormRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">{label}</Label>
    {children}
  </div>
);

const calculateItemTotal = (group: IItemGroup): number => {
  return parseFloat(
    ((group.frequency || 1) * (group.quantity || 1) * (group.unitCost || 0)).toFixed(2)
  );
};

const PurchaseRequestForm: React.FC<PurchaseRequestFormProps> = ({ mode, initialData }) => {
  const [formData, setFormData] = useState<PurchaseRequestFormData>(() => {
    if (mode === 'edit' && initialData) {
      return {
        department: initialData.department || '',
        suggestedSupplier: initialData.suggestedSupplier || '',
        address: initialData.address || '',
        finalDeliveryPoint: initialData.finalDeliveryPoint || '',
        city: initialData.city || '',
        periodOfActivity: initialData.periodOfActivity || { from: '', to: '' },
        purchaseRequestDate: initialData.purchaseRequestDate || new Date().toISOString(),
        activityDescription: initialData.activityDescription || '',
        expenseChargedTo: initialData.expenseChargedTo || '',
        accountCode: initialData.accountCode || '',
        financeReviewBy: initialData.financeReviewBy?.id || null,
        procurementReviewBy: initialData.procurementReviewBy?.id || null,
        financeReviewStatus: initialData.financeReviewStatus || 'pending',
        procurementReviewStatus: initialData.procurementReviewStatus || 'pending',
        approvedBy: initialData.approvedBy?.id || null,
        project:
          typeof initialData.project === 'string'
            ? initialData.project
            : (initialData.project?.id ?? null),
        itemGroups: initialData.itemGroups || [],
      };
    }

    return {
      department: '',
      suggestedSupplier: '',
      address: '',
      finalDeliveryPoint: '',
      city: '',
      periodOfActivity: { from: '', to: '' },
      purchaseRequestDate: new Date().toISOString(),
      activityDescription: '',
      expenseChargedTo: '',
      accountCode: '',
      financeReviewBy: null,
      procurementReviewBy: null,
      financeReviewStatus: 'pending',
      procurementReviewStatus: 'pending',
      approvedBy: null,
      project: null,
      itemGroups: [],
    };
  });

  const [itemGroups, setItemGroups] = useState<IItemGroup[]>(
    mode === 'edit' && initialData?.itemGroups ? initialData.itemGroups : []
  );

  const [selectedProject, setSelectedProject] = useState<IProject | null>(null);

  const { savePurchaseRequest, isPending: isSaving } = useSavePurchaseRequest();
  const { sendPurchaseRequest, isPending: isSending } = useSendPurchaseRequest();
  const { updatePurchaseRequest, isPending: isUpdating } = useUpdatePurchaseRequest(
    mode === 'edit' ? initialData?.id || '' : ''
  );

  const { data: reviewersData, isLoading: isLoadingReviewers } = useReviewers();
  const { data: projectData, isLoading: isLoadingProjects } = useProjects({});

  const reviewers = useMemo(() => reviewersData?.data ?? [], [reviewersData]);
  const projects = useMemo(() => projectData?.data ?? [], [projectData]);

  const isPending = mode === 'create' ? isSaving || isSending : isUpdating;

  const procurementReviewerOptions = useMemo(() => {
    if (!reviewers) return [];
    return reviewers
      .filter((reviewer: IUser) => reviewer.id)
      .filter((reviewer: IUser) => reviewer.id !== formData.financeReviewBy)
      .map((reviewer: IUser) => ({
        id: reviewer.id as string,
        name: `${reviewer.firstName} ${reviewer.lastName}`,
      }));
  }, [reviewers, formData.financeReviewBy]);

  const handleFormChange = useCallback(
    (field: keyof PurchaseRequestFormData, value: string) => {
      if (field === 'expenseChargedTo') {
        const selected = projects.find(
          (project: IProject) => `${project.projectTitle} - ${project.projectCode}` === value
        );
        setSelectedProject(selected || null);
        setFormData(prev => ({
          ...prev,
          project: selected?.id || null,
          expenseChargedTo: value,
          accountCode: '',
        }));
      } else if (field === 'financeReviewBy') {
        setFormData(prev => ({
          ...prev,
          financeReviewBy: value,
          procurementReviewBy: value === prev.procurementReviewBy ? null : prev.procurementReviewBy,
        }));
      } else {
        setFormData(prev => ({ ...prev, [field]: value }));
      }
    },
    [projects]
  );

  const handleNestedChange = useCallback(
    (
      parentField: keyof PurchaseRequestFormData,
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
    (index: number, field: keyof IItemGroup, value: string | number | null) => {
      setItemGroups(prevItems => {
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
    setItemGroups(prev => [
      ...prev,
      {
        itemName: '',
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
    setItemGroups(prev => prev.filter((_, i) => i !== index));
  }, []);

  const getItemKey = useCallback((index: number, _group: IItemGroup) => {
    return `item-${index}`;
  }, []);

  const buildSubmitData = useCallback((): Partial<IPurchaseRequest> => {
    const financeReviewer = formData.financeReviewBy
      ? reviewers.find((r: IUser) => r.id === formData.financeReviewBy)
      : undefined;

    const procurementReviewer = formData.procurementReviewBy
      ? reviewers.find((r: IUser) => r.id === formData.procurementReviewBy)
      : undefined;

    return {
      department: formData.department,
      suggestedSupplier: formData.suggestedSupplier,
      address: formData.address,
      finalDeliveryPoint: formData.finalDeliveryPoint,
      city: formData.city,
      periodOfActivity: formData.periodOfActivity,
      purchaseRequestDate: formData.purchaseRequestDate,
      activityDescription: formData.activityDescription,
      expenseChargedTo: formData.expenseChargedTo,
      accountCode: formData.accountCode,
      financeReviewBy: financeReviewer || undefined,
      procurementReviewBy: procurementReviewer || undefined,
      project: formData.project || undefined,
      itemGroups: [...itemGroups],
    };
  }, [formData, reviewers, itemGroups]);

  const handleSave = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const data = buildSubmitData();

      if (mode === 'create') {
        savePurchaseRequest(data);
      } else {
        updatePurchaseRequest({ data });
      }
    },
    [buildSubmitData, mode, savePurchaseRequest, updatePurchaseRequest]
  );

  const handleSend = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const data = buildSubmitData();
      sendPurchaseRequest({ data });
    },
    [buildSubmitData, sendPurchaseRequest]
  );

  const getSubmitLabel = useCallback(() => {
    if (isPending) {
      return mode === 'create' ? 'Creating...' : 'Updating...';
    }
    if (mode === 'create') {
      return formData.financeReviewBy && formData.procurementReviewBy ? 'Save and Send' : 'Save';
    }
    return formData.financeReviewBy && formData.procurementReviewBy
      ? 'Update and Send'
      : 'Update and Save';
  }, [isPending, mode, formData.financeReviewBy, formData.procurementReviewBy]);

  const getSubmitHandler = useCallback(() => {
    const label = getSubmitLabel();
    if (label.includes('Send')) {
      return handleSend;
    }
    return handleSave;
  }, [getSubmitLabel, handleSend, handleSave]);

  const renderItem = useCallback(
    (group: IItemGroup, index: number) => {
      const total = calculateItemTotal(group);

      return (
        <div
          key={getItemKey(index, group)}
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

          <h4 className="text-sm font-semibold text-gray-700 mb-3">ITEM {index + 1}</h4>

          <FormRow label="Item Name *">
            <Input
              inputSize="sm"
              type="text"
              required
              value={group.itemName || ''}
              onChange={e => handleItemChange(index, 'itemName', e.target.value)}
              disabled={isPending}
            />
          </FormRow>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <FormRow label="Frequency *">
              <NumberInput
                inputSize="sm"
                min={1}
                step={1}
                required
                value={group.frequency}
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
                value={group.quantity}
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
                value={group.unit || ''}
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
                value={group.unitCost}
                onChange={value => handleItemChange(index, 'unitCost', value ?? 0)}
                disabled={isPending}
                placeholder="0.00"
              />
            </FormRow>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <FormRow label="Total (₦)">
              <Input
                inputSize="sm"
                type="number"
                value={total}
                disabled={true}
                className="bg-gray-100"
              />
            </FormRow>
          </div>

          <FormRow label="Description">
            <textarea
              className="w-full min-h-[60px] p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
              value={group.description || ''}
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
            <span className="font-bold uppercase">Request:</span>
            <span className="ml-2">
              {initialData.createdBy?.firstName} {initialData.createdBy?.lastName}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Department *">
          <Input
            inputSize="sm"
            type="text"
            required
            value={formData.department}
            onChange={e => handleFormChange('department', e.target.value)}
            disabled={isPending}
          />
        </FormRow>

        <FormRow label="Suggested Supplier *">
          <Input
            inputSize="sm"
            type="text"
            required
            value={formData.suggestedSupplier}
            onChange={e => handleFormChange('suggestedSupplier', e.target.value)}
            disabled={isPending}
          />
        </FormRow>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Address *">
          <Input
            inputSize="sm"
            type="text"
            required
            value={formData.address}
            onChange={e => handleFormChange('address', e.target.value)}
            disabled={isPending}
          />
        </FormRow>

        <FormRow label="Final Delivery Point *">
          <Input
            inputSize="sm"
            type="text"
            required
            value={formData.finalDeliveryPoint}
            onChange={e => handleFormChange('finalDeliveryPoint', e.target.value)}
            disabled={isPending}
          />
        </FormRow>
      </div>

      <FormRow label="City *">
        <Input
          inputSize="sm"
          type="text"
          required
          value={formData.city}
          onChange={e => handleFormChange('city', e.target.value)}
          disabled={isPending}
        />
      </FormRow>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Period Of Activity (From) *">
          <DatePicker
            selected={formData.periodOfActivity?.from || null}
            onChange={date =>
              handleNestedChange('periodOfActivity', 'from', date ? date.toISOString() : null)
            }
            variant="secondary"
            placeholder="Select date"
            disabled={isPending}
          />
        </FormRow>

        {formData.periodOfActivity?.from && (
          <FormRow label="Period Of Activity (To) *">
            <DatePicker
              selected={formData.periodOfActivity?.to || null}
              onChange={date =>
                handleNestedChange('periodOfActivity', 'to', date ? date.toISOString() : null)
              }
              variant="secondary"
              placeholder="Select date"
              minDate={formData.periodOfActivity?.from}
              requiredTrigger={!!formData.periodOfActivity?.from}
              disabled={isPending}
            />
          </FormRow>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Purchase Request Date">
          <DatePicker
            selected={formData.purchaseRequestDate ? new Date(formData.purchaseRequestDate) : null}
            onChange={date =>
              handleFormChange('purchaseRequestDate', date ? date.toISOString() : '')
            }
            variant="secondary"
            placeholder="Select date"
            disabled={isPending}
          />
        </FormRow>
      </div>

      <FormRow label="Activity Description">
        <textarea
          className="w-full min-h-[120px] p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          maxLength={4000}
          value={formData.activityDescription}
          onChange={e => handleFormChange('activityDescription', e.target.value)}
          disabled={isPending}
        />
      </FormRow>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Items</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto p-4 border rounded-lg">
          {itemGroups.map((group, index) => renderItem(group, index))}
        </div>

        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">
            {itemGroups.length} item{itemGroups.length > 1 ? 's' : ''} added
          </p>

          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <FaPlus className="h-4 w-4 mr-1" /> Add Item
          </Button>
        </div>
      </div>

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
                    {project.projectCode}
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
        <FormRow label="Finance Reviewer *">
          {isLoadingReviewers ? (
            <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
          ) : (
            <Select
              value={formData.financeReviewBy || ''}
              onValueChange={value => handleFormChange('financeReviewBy', value)}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Finance Reviewer" />
              </SelectTrigger>
              <SelectContent>
                {reviewers.map((reviewer: IUser) => (
                  <SelectItem key={reviewer.id} value={reviewer.id}>
                    {reviewer.firstName} {reviewer.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormRow>

        {formData.financeReviewBy && (
          <FormRow label="Procurement Reviewer *">
            {isLoadingReviewers ? (
              <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
            ) : (
              <Select
                value={formData.procurementReviewBy || ''}
                onValueChange={value => handleFormChange('procurementReviewBy', value)}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Procurement Reviewer" />
                </SelectTrigger>
                <SelectContent>
                  {procurementReviewerOptions.map((reviewer: { name: string; id: string }) => (
                    <SelectItem key={reviewer.id} value={reviewer.id}>
                      {reviewer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormRow>
        )}
      </div>

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

export default PurchaseRequestForm;
