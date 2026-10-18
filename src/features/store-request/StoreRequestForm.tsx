import { useCallback, useMemo, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { NumberInput } from '../../components/custom/NumberInput';
import FormRow from '../../components/custom/FormRow';
import DatePicker from '../datePicker/DatePicker';
import {
  IStoreItemGroup,
  IStoreRequest,
  IUser,
} from '../../interfaces';
import { useUsers, useReviewers } from '../user/Hooks/useUsers';
import {
  useCreateStoreRequest,
  useSaveStoreRequestDraft,
  useUpdateStoreRequest,
} from './Hooks/useStoreRequest';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

interface StoreRequestFormData {
  destination: string;
  warehouse: string;
  warehouseCode: string;
  requestedAt: string;
  dispatchDate: string;
  recipient: string;
  warehouseOfficer: string;
  assignedDriver: string;
  reviewedBy: string;
}

interface StoreRequestFormProps {
  mode: 'create' | 'edit';
  initialData?: IStoreRequest;
}

const getUserId = (user?: Partial<IUser> | string | null) =>
  typeof user === 'string' ? user : user?.id ?? '';

const getInitialFormData = (initialData?: IStoreRequest): StoreRequestFormData => ({
  destination: initialData?.destination ?? '',
  warehouse: initialData?.warehouse ?? '',
  warehouseCode: initialData?.warehouseCode ?? '',
  requestedAt: initialData?.requestedAt ?? new Date().toISOString(),
  dispatchDate: initialData?.dispatchDate ?? '',
  recipient: getUserId(initialData?.recipient),
  warehouseOfficer: getUserId(initialData?.warehouseOfficer),
  assignedDriver: initialData?.assignedDriver ?? '',
  reviewedBy: getUserId(initialData?.reviewedBy),
});

const emptyItem = (): IStoreItemGroup => ({
  itemName: '',
  department: '',
  description: '',
  frequency: 1,
  quantity: 1,
  unit: '',
  dispatchRemarks: '',
});

const getUserName = (user: IUser) => `${user.firstName} ${user.lastName}`.trim();


const StoreRequestForm: React.FC<StoreRequestFormProps> = ({ mode, initialData }) => {
  const [formData, setFormData] = useState<StoreRequestFormData>(() =>
    getInitialFormData(mode === 'edit' ? initialData : undefined)
  );
  const [items, setItems] = useState<IStoreItemGroup[]>(() =>
    mode === 'edit' ? initialData?.items ?? [] : []
  );

  const { data: usersData, isLoading: isLoadingUsers } = useUsers({ limit: 1000 });
  const { data: reviewersData, isLoading: isLoadingReviewers } = useReviewers();
  const { saveStoreRequestDraft, isPending: isSavingDraft } = useSaveStoreRequestDraft();
  const { createStoreRequest, isPending: isCreating } = useCreateStoreRequest();
  const { updateStoreRequest, isPending: isUpdating } = useUpdateStoreRequest(
    mode === 'edit' ? initialData?.id ?? '' : ''
  );

  const users = useMemo(() => usersData?.data ?? [], [usersData]);
  const reviewers = useMemo(() => reviewersData?.data ?? [], [reviewersData]);
  const procurementOfficers = useMemo(
    () =>
      users.filter(user =>
        Object.values(user.procurementRole ?? {}).some(permission => permission === true)
      ),
    [users]
  );
  const isPending = isSavingDraft || isCreating || isUpdating;

  const handleFormChange = useCallback((field: keyof StoreRequestFormData, value: string) => {
    setFormData(previous => ({ ...previous, [field]: value }));
  }, []);

  const handleDateChange = useCallback(
    (field: 'requestedAt' | 'dispatchDate', date: Date | null) => {
      handleFormChange(field, date ? date.toISOString() : '');
    },
    [handleFormChange]
  );

  const handleItemChange = useCallback(
    (index: number, field: keyof IStoreItemGroup, value: string | number) => {
      setItems(previous =>
        previous.map((item, itemIndex) =>
          itemIndex === index ? { ...item, [field]: value } : item
        )
      );
    },
    []
  );

  const addItem = useCallback(() => setItems(previous => [...previous, emptyItem()]), []);
  const removeItem = useCallback(
    (index: number) => setItems(previous => previous.filter((_, itemIndex) => itemIndex !== index)),
    []
  );

  const buildSubmitData = useCallback((): Partial<IStoreRequest> => {
    return {
      destination: formData.destination.trim(),
      warehouse: formData.warehouse.trim(),
      warehouseCode: formData.warehouseCode.trim(),
      requestedAt: formData.requestedAt || undefined,
      dispatchDate: formData.dispatchDate || undefined,
      recipient: formData.recipient,
      warehouseOfficer: formData.warehouseOfficer,
      assignedDriver: formData.assignedDriver.trim() || undefined,
      reviewedBy: formData.reviewedBy || undefined,
      items: items.map(item => ({
        itemName: item.itemName.trim(),
        department: item.department?.trim() || undefined,
        description: item.description?.trim() || undefined,
        frequency: item.frequency,
        quantity: item.quantity,
        unit: item.unit?.trim() || '',
        dispatchRemarks: item.dispatchRemarks?.trim() || undefined,
      })),
    };
  }, [formData, items]);

  const validate = useCallback(
    (isSubmission: boolean) => {
      if (
        !formData.destination.trim() ||
        !formData.warehouse.trim() ||
        !formData.warehouseCode.trim() ||
        !formData.requestedAt ||
        !formData.dispatchDate ||
        !formData.recipient ||
        !formData.warehouseOfficer
      ) {
        toast.error('Complete all required request details before saving');
        return false;
      }
      if (isSubmission && !formData.reviewedBy) {
        toast.error('Select a reviewer before creating the store request');
        return false;
      }
      if (
        items.length === 0 ||
        items.some(
          item =>
            !item.itemName.trim() ||
            !Number.isInteger(item.frequency) ||
            item.frequency < 1 ||
            !Number.isInteger(item.quantity) ||
            item.quantity < 1
        )
      ) {
        toast.error('Add at least one item and enter its name, frequency, and quantity');
        return false;
      }
      return true;
    },
    [formData, items]
  );

  const handleSaveDraft = useCallback(() => {
    if (!validate(false)) return;
    const data = buildSubmitData();

    if (formData.reviewedBy) {
      createStoreRequest(data);
    } else if (mode === 'edit') {
      updateStoreRequest(data);
    } else {
      saveStoreRequestDraft(data);
    }
  }, [buildSubmitData, createStoreRequest, formData.reviewedBy, mode, saveStoreRequestDraft, updateStoreRequest, validate]);

  const handleCreate = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!validate(true)) return;
      const data = buildSubmitData();

      if (formData.reviewedBy) {
        createStoreRequest(data);
      } else if (mode === 'edit') {
        updateStoreRequest(data);
      } else {
        saveStoreRequestDraft(data);
      }
    },
    [buildSubmitData, createStoreRequest, formData.reviewedBy, mode, saveStoreRequestDraft, updateStoreRequest, validate]
  );

  const renderItem = useCallback(
    (item: IStoreItemGroup, index: number) => (
      <div key={`store-item-${index}`} className="relative space-y-3 rounded-lg border bg-gray-50 p-4 shadow-sm">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 h-6 w-6 p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
          onClick={() => removeItem(index)}
          disabled={isPending}
          aria-label={`Remove item ${index + 1}`}
        >
          <X className="h-4 w-4" />
        </Button>

        <h3 className="mb-3 pr-8 text-sm font-semibold text-gray-700">ITEM {index + 1}</h3>
        <FormRow label="Item Name" required>
          <Input
            inputSize="sm"
            value={item.itemName}
            onChange={event => handleItemChange(index, 'itemName', event.target.value)}
            disabled={isPending}
          />
        </FormRow>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormRow label="Department">
            <Input
              inputSize="sm"
              value={item.department || ''}
              onChange={event => handleItemChange(index, 'department', event.target.value)}
              disabled={isPending}
            />
          </FormRow>
          <FormRow label="Unit">
            <Input
              inputSize="sm"
              value={item.unit || ''}
              onChange={event => handleItemChange(index, 'unit', event.target.value)}
              disabled={isPending}
            />
          </FormRow>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormRow label="Frequency" required>
            <NumberInput
              inputSize="sm"
              min={1}
              step={1}
              value={item.frequency}
              onChange={value => handleItemChange(index, 'frequency', value ?? 1)}
              disabled={isPending}
            />
          </FormRow>
          <FormRow label="Quantity" required>
            <NumberInput
              inputSize="sm"
              min={1}
              step={1}
              value={item.quantity}
              onChange={value => handleItemChange(index, 'quantity', value ?? 1)}
              disabled={isPending}
            />
          </FormRow>
        </div>

        <FormRow label="Description">
          <textarea
            className="min-h-[70px] w-full rounded-lg border p-2 text-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={item.description || ''}
            onChange={event => handleItemChange(index, 'description', event.target.value)}
            disabled={isPending}
          />
        </FormRow>

        <FormRow label="Dispatch Remarks">
          <textarea
            className="min-h-[70px] w-full rounded-lg border p-2 text-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={item.dispatchRemarks || ''}
            onChange={event => handleItemChange(index, 'dispatchRemarks', event.target.value)}
            disabled={isPending}
          />
        </FormRow>
      </div>
    ),
    [handleItemChange, isPending, removeItem]
  );

  return (
    <form className="space-y-6" onSubmit={handleCreate}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormRow label="Destination" required>
          <Input
            inputSize="sm"
            value={formData.destination}
            onChange={event => handleFormChange('destination', event.target.value)}
            disabled={isPending}
          />
        </FormRow>
        <FormRow label="Warehouse" required>
          <Input
            inputSize="sm"
            value={formData.warehouse}
            onChange={event => handleFormChange('warehouse', event.target.value)}
            disabled={isPending}
          />
        </FormRow>
        <FormRow label="Warehouse Code" required>
          <Input
            inputSize="sm"
            value={formData.warehouseCode}
            onChange={event => handleFormChange('warehouseCode', event.target.value)}
            disabled={isPending}
          />
        </FormRow>
        <FormRow label="Driver">
          <Input
            inputSize="sm"
            value={formData.assignedDriver}
            onChange={event => handleFormChange('assignedDriver', event.target.value)}
            disabled={isPending}
          />
        </FormRow>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormRow label="Date of Request" required>
          <DatePicker
            selected={formData.requestedAt || null}
            onChange={date => handleDateChange('requestedAt', date)}
            variant="secondary"
            placeholder="Select request date"
            disabled={isPending}
          />
        </FormRow>
        <FormRow label="Date of Dispatch" required>
          <DatePicker
            selected={formData.dispatchDate || null}
            onChange={date => handleDateChange('dispatchDate', date)}
            variant="secondary"
            placeholder="Select dispatch date"
            disabled={isPending}
          />
        </FormRow>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormRow label="Recipient" required>
          {isLoadingUsers ? (
            <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
          ) : (
            <Select
              value={formData.recipient}
              onValueChange={value => handleFormChange('recipient', value)}
              disabled={isPending}
            >
              <SelectTrigger><SelectValue placeholder="Select recipient" /></SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>{getUserName(user)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormRow>

        <FormRow label="Warehouse Officer" required>
          {isLoadingUsers ? (
            <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
          ) : (
            <Select
              value={formData.warehouseOfficer}
              onValueChange={value => handleFormChange('warehouseOfficer', value)}
              disabled={isPending}
            >
              <SelectTrigger><SelectValue placeholder="Select warehouse officer" /></SelectTrigger>
              <SelectContent>
                {procurementOfficers.map(user => (
                  <SelectItem key={user.id} value={user.id}>{getUserName(user)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormRow>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Items</h2>
          <Button type="button" variant="outline" size="sm" onClick={addItem} disabled={isPending}>
            <FaPlus className="mr-1 h-4 w-4" /> Add Item
          </Button>
        </div>
        {items.length ? (
          <div className="grid max-h-[600px] grid-cols-1 gap-4 overflow-y-auto border p-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => renderItem(item, index))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed p-4 text-sm text-gray-500">
            Add at least one item to this store request.
          </p>
        )}
      </section>

      <div className="grid grid-cols-1 gap-4">
        <FormRow label="Reviewed By" required>
          {isLoadingReviewers ? (
            <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
          ) : (
            <Select
              value={formData.reviewedBy}
              onValueChange={value => handleFormChange('reviewedBy', value)}
              disabled={isPending}
            >
              <SelectTrigger><SelectValue placeholder="Select reviewer" /></SelectTrigger>
              <SelectContent>
                {reviewers.map(user => (
                  <SelectItem key={user.id} value={user.id}>{getUserName(user)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormRow>
      </div>

      <div className="flex flex-col justify-center gap-3 border-t pt-4 sm:flex-row">
        {!formData.reviewedBy ? (
          <Button
            type="button"
            variant="outline"
            size="md"
            disabled={isPending}
            onClick={handleSaveDraft}
            className="min-w-[170px]"
          >
            {isSavingDraft && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSavingDraft
              ? mode === 'edit' ? 'Updating Draft...' : 'Saving Draft...'
              : mode === 'edit' ? 'Update Draft' : 'Save as Draft'}
          </Button>
        ) : (
          <Button type="submit" size="md" disabled={isPending} className="min-w-[170px]">
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isCreating ? 'Creating...' : 'Create Store Request'}
          </Button>
        )}
      </div>
    </form>
  );
};

export default StoreRequestForm;