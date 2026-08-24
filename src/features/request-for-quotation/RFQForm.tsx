// RFQForm.tsx - Combined Create/Edit Form with Radix UI (MATCHED TO ADVANCE REQUEST FORM)
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

// Hooks
import { useCreateRFQ, useCreateAndSendRFQ, useUpdateRFQ } from './Hooks/useRFQ';

// Types
import { IRFQ, IItemGroup } from '../../interfaces';
import { casfodAddress } from './rfqConstants';

interface RFQFormProps {
  mode: 'create' | 'edit';
  initialData?: IRFQ | null;
  onSuccess?: () => void;
}

// FormRow component for consistent layout (matches AdvanceRequestForm)
const FormRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">{label}</Label>
    {children}
  </div>
);

// Calculate total for a single item
const calculateItemTotal = (group: IItemGroup): number => {
  return parseFloat(
    ((group.frequency || 1) * (group.quantity || 1) * (group.unitCost || 0)).toFixed(2)
  );
};

// Form-specific type
type RFQFormData = {
  rfqTitle: string;
  rfqDate: string;
  deadlineDate: string;
  casfodAddressId: string;
  itemGroups: IItemGroup[];
  copiedTo: string[];
};

const RFQForm: React.FC<RFQFormProps> = ({ mode, initialData, onSuccess }) => {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState<RFQFormData>(() => {
    if (mode === 'edit' && initialData) {
      return {
        rfqTitle: initialData.rfqTitle || '',
        rfqDate: initialData.rfqDate || '',
        deadlineDate: initialData.deadlineDate || '',
        casfodAddressId: initialData.casfodAddressId || '',
        itemGroups: initialData.itemGroups || [],
        copiedTo: Array.isArray(initialData.copiedTo)
          ? initialData.copiedTo.map(vendor =>
              typeof vendor === 'object' && vendor !== null
                ? (vendor as { id: string }).id
                : String(vendor)
            )
          : [],
      };
    }

    return {
      rfqTitle: '',
      rfqDate: '',
      deadlineDate: '',
      casfodAddressId: '',
      itemGroups: [
        {
          itemName: '',
          description: '',
          frequency: 1,
          quantity: 1,
          unit: '',
          unitCost: 0,
          total: 0,
        },
      ],
      copiedTo: [],
    };
  });
  const [isSendMode, setIsSendMode] = useState(false);

  // Hooks
  const { createRFQ, isPending: isCreating } = useCreateRFQ();
  const { createAndSendRFQ, isPending: isSending } = useCreateAndSendRFQ();
  const { updateRFQ, isPending: isUpdating } = useUpdateRFQ();

  const isPending = mode === 'create' ? isCreating || isSending : isUpdating;

  // Check if RFQ is in draft status (for edit mode)
  const isDraftStatus = useMemo(() => {
    return mode === 'edit' && initialData?.status === 'draft';
  }, [mode, initialData]);

  // Sync itemGroups with formData
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData(prev => ({
        ...prev,
        itemGroups: initialData.itemGroups || [],
      }));
    }
  }, [mode, initialData]);

  const handleFormChange = useCallback(
    (field: keyof RFQFormData, value: string | string[] | IItemGroup[]) => {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  // Item Group Handlers
  const handleItemGroupChange = useCallback(
    (index: number, field: keyof IItemGroup, value: string | number) => {
      setFormData(prev => {
        const updatedItems = [...prev.itemGroups];
        updatedItems[index] = {
          ...updatedItems[index],
          [field]: value,
        };

        // Calculate total if unitCost, quantity, or frequency changes
        if (['unitCost', 'quantity', 'frequency'].includes(field as string)) {
          const unitCost = field === 'unitCost' ? Number(value) : updatedItems[index].unitCost || 0;
          const quantity = field === 'quantity' ? Number(value) : updatedItems[index].quantity || 1;
          const frequency =
            field === 'frequency' ? Number(value) : updatedItems[index].frequency || 1;

          updatedItems[index].total = unitCost * quantity * frequency;
        }

        return {
          ...prev,
          itemGroups: updatedItems,
        };
      });
    },
    []
  );

  const addItemGroup = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      itemGroups: [
        ...prev.itemGroups,
        {
          itemName: '',
          description: '',
          frequency: 1,
          quantity: 1,
          unit: '',
          unitCost: 0,
          total: 0,
        },
      ],
    }));
  }, []);

  const removeItemGroup = useCallback(
    (index: number) => {
      if (formData.itemGroups.length > 1) {
        setFormData(prev => ({
          ...prev,
          itemGroups: prev.itemGroups.filter((_, i) => i !== index),
        }));
      }
    },
    [formData.itemGroups.length]
  );

  const buildSubmitData = useCallback(() => {
    return {
      rfqTitle: formData.rfqTitle,
      rfqDate: formData.rfqDate,
      deadlineDate: formData.deadlineDate,
      casfodAddressId: formData.casfodAddressId,
      itemGroups: formData.itemGroups.map(group => ({
        ...group,
        total: calculateItemTotal(group),
      })),
      copiedTo: formData.copiedTo,
    };
  }, [formData]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const isFormValid = form.reportValidity();
      if (!isFormValid) return;

      const submitData = {
        ...buildSubmitData(),
      };

      if (mode === 'create') {
        if (isSendMode) {
          createAndSendRFQ(submitData, {
            onSuccess: () => onSuccess?.(),
          });
        } else {
          createRFQ(submitData, {
            onSuccess: () => onSuccess?.(),
          });
        }
      } else {
        if (isSendMode && isDraftStatus) {
          createAndSendRFQ(submitData, {
            onSuccess: () => onSuccess?.(),
          });
        } else {
          updateRFQ(
            {
              rfqId: initialData?.id || '',
              data: submitData,
            },
            {
              onSuccess: () => onSuccess?.(),
            }
          );
        }
      }
    },
    [
      mode,
      isSendMode,
      isDraftStatus,
      buildSubmitData,
      createRFQ,
      createAndSendRFQ,
      updateRFQ,
      initialData,
      onSuccess,
    ]
  );

  const totalAmount = useMemo(() => {
    return formData.itemGroups.reduce((sum, item) => sum + (item.total || 0), 0);
  }, [formData.itemGroups]);

  // Get item key for stable rendering
  const getItemKey = useCallback((index: number, _group: IItemGroup) => {
    return `item-${index}`;
  }, []);

  // Render item group (matches AdvanceRequestForm styling)
  const renderItemGroup = useCallback(
    (item: IItemGroup, index: number) => {
      const total = calculateItemTotal(item);

      return (
        <div
          key={getItemKey(index, item)}
          className="relative bg-gray-50 p-4 rounded-lg border shadow-sm"
        >
          {formData.itemGroups.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => removeItemGroup(index)}
              disabled={isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          <h4 className="text-sm font-semibold text-gray-700 mb-3">ITEM {index + 1}</h4>

          <FormRow label="Item Name *">
            <Input
              inputSize="sm"
              type="text"
              required
              value={item.itemName || ''}
              onChange={e => handleItemGroupChange(index, 'itemName', e.target.value)}
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
                value={item.frequency}
                onChange={value => handleItemGroupChange(index, 'frequency', value ?? 1)}
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
                onChange={value => handleItemGroupChange(index, 'quantity', value ?? 1)}
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
                onChange={e => handleItemGroupChange(index, 'unit', e.target.value)}
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
                onChange={value => handleItemGroupChange(index, 'unitCost', value ?? 0)}
                disabled={true}
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
              onChange={e => handleItemGroupChange(index, 'description', e.target.value)}
              disabled={isPending}
            />
          </FormRow>
        </div>
      );
    },
    [formData.itemGroups.length, isPending, handleItemGroupChange, removeItemGroup, getItemKey]
  );

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Status Badge - Edit Mode Only (matches AdvanceRequestForm) */}
      {mode === 'edit' && initialData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <span className="font-bold uppercase">Status:</span>
            <span className="ml-2 capitalize">{initialData.status}</span>
          </div>
          {initialData.rfqCode && (
            <div>
              <span className="font-bold uppercase">RFQ Code:</span>
              <span className="ml-2">{initialData.rfqCode}</span>
            </div>
          )}
        </div>
      )}

      <FormRow label="RFQ Title *">
        <Input
          inputSize="sm"
          type="text"
          required
          value={formData.rfqTitle}
          onChange={e => handleFormChange('rfqTitle', e.target.value)}
          disabled={isPending}
        />
      </FormRow>

      <FormRow label="Select CASFOD Delivery Address *">
        <Select
          value={formData.casfodAddressId || ''}
          onValueChange={value => handleFormChange('casfodAddressId', value)}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a State" />
          </SelectTrigger>
          <SelectContent>
            {casfodAddress.map(address => (
              <SelectItem key={address.id} value={address.id}>
                {address.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormRow>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="RFQ Date *">
          <DatePicker
            selected={formData.rfqDate ? new Date(formData.rfqDate) : null}
            onChange={date => handleFormChange('rfqDate', date ? date.toISOString() : '')}
            variant="secondary"
            placeholder="Select date"
            disabled={isPending}
          />
        </FormRow>

        <FormRow label="Deadline Date *">
          <DatePicker
            selected={formData.deadlineDate ? new Date(formData.deadlineDate) : null}
            onChange={date => handleFormChange('deadlineDate', date ? date.toISOString() : '')}
            variant="secondary"
            placeholder="Select date"
            disabled={isPending}
          />
        </FormRow>
      </div>

      {/* Items Section (matches AdvanceRequestForm) */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Items</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto p-4 border rounded-lg">
          {formData.itemGroups.map((item, index) => renderItemGroup(item, index))}
        </div>

        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">
            {formData.itemGroups.length} item{formData.itemGroups.length > 1 ? 's' : ''} added
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItemGroup}
            disabled={isPending}
          >
            <FaPlus className="h-4 w-4 mr-1" /> Add Item
          </Button>
        </div>

        {formData.itemGroups.length > 0 && (
          <div className="text-right">
            <div className="text-lg font-bold border-t pt-2">
              Grand Total: ₦{totalAmount.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons (matches AdvanceRequestForm) */}
      <div className="flex justify-center w-full gap-4 pt-4 border-t">
        <div className="flex flex-col md:flex-row gap-4">
          <Button
            type="submit"
            size="md"
            disabled={isPending}
            onClick={() => setIsSendMode(false)}
            className="min-w-[150px]"
          >
            {isPending && !isSendMode ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </>
            ) : mode === 'create' ? (
              'Save as Draft'
            ) : (
              'Update RFQ'
            )}
          </Button>

          {((mode === 'create' && formData.itemGroups.length > 0) ||
            (mode === 'edit' && isDraftStatus)) && (
            <Button
              type="submit"
              size="md"
              disabled={isPending}
              onClick={() => setIsSendMode(true)}
              className="min-w-[150px]"
            >
              {isPending && isSendMode ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                'Save & Prepare for Sending'
              )}
            </Button>
          )}

          <Button
            type="button"
            size="md"
            variant="secondary"
            onClick={() => navigate(-1)}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Status Information */}
      {mode === 'edit' && initialData && !isDraftStatus && (
        <div className="text-center text-sm text-gray-600">
          Current Status: <span className="font-semibold capitalize">{initialData.status}</span>
          <p className="mt-1 text-xs">
            "Save & Prepare for Sending" is only available for draft RFQs
          </p>
        </div>
      )}
    </form>
  );
};

export default RFQForm;
