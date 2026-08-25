// PurchaseOrderForm.tsx - Updated to match RFQForm.tsx UI
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
import { useUsers } from '../user/Hooks/useUsers';
import { useVendors } from '../Vendor/Hooks/useVendor';
import {
  useCreateIndependentPurchaseOrder,
  useCreatePurchaseOrderFromRFQ,
  useUpdatePurchaseOrder,
} from './Hooks/usePurchaseOrder';
import {
  IPurchaseOrder,
  IPOItemGroup,
  IVendor,
  IUser,
  ICreatePurchaseOrderPayload,
  IItemGroup,
} from '../../interfaces';
import toast from 'react-hot-toast';
import { casfodAddress } from '../request-for-quotation/rfqConstants';

// FormRow component for consistent layout (matches RFQForm)
const FormRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">{label}</Label>
    {children}
  </div>
);

// Local form data interface
interface PurchaseOrderFormData {
  rfqTitle: string;
  casfodAddressId: string;
  poDate: string;
  deliveryDate: string;
  vat: number;
  selectedVendor: string;
  approvedBy: string;
  itemGroups: IPOItemGroup[];
}

interface PurchaseOrderFormProps {
  mode: 'create' | 'edit' | 'create-from-rfq';
  initialData?: IPurchaseOrder | null;
  rfqId?: string;
  rfqData?: {
    rfqTitle: string;
    itemGroups: IPOItemGroup[];
    copiedTo: (string | IVendor)[];
    casfodAddressId?: string;
    poDate?: string;
    deliveryDate?: string;
  };
  onSuccess?: () => void;
}

// Calculate total for a single item
const calculateItemTotal = (item: IPOItemGroup): number => {
  return parseFloat(
    ((item.frequency || 1) * (item.quantity || 1) * (item.unitCost || 0)).toFixed(2)
  );
};

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  mode,
  initialData,
  rfqId,
  rfqData,
  onSuccess,
}) => {
  // Form State
  const [formData, setFormData] = useState<PurchaseOrderFormData>(() => {
    if (mode === 'edit' && initialData) {
      return {
        rfqTitle: initialData.rfqTitle || '',
        casfodAddressId: initialData.casfodAddressId || '',
        poDate: initialData.poDate || '',
        deliveryDate: initialData.deliveryDate || '',
        vat: initialData.vat || 0,
        selectedVendor:
          typeof initialData.selectedVendor === 'string'
            ? initialData.selectedVendor
            : initialData.selectedVendor?.id || '',
        approvedBy: initialData.approvedBy?.id || '',
        itemGroups: initialData.itemGroups || [],
      };
    }

    if (mode === 'create-from-rfq' && rfqData) {
      return {
        rfqTitle: rfqData.rfqTitle || '',
        casfodAddressId: rfqData.casfodAddressId || '',
        poDate: rfqData.poDate || '',
        deliveryDate: rfqData.deliveryDate || '',
        vat: 0,
        selectedVendor: '',
        approvedBy: '',
        itemGroups: rfqData.itemGroups.map(item => ({
          ...item,
          unitCost: 0,
          total: 0,
        })),
      };
    }

    return {
      rfqTitle: '',
      casfodAddressId: '',
      poDate: '',
      deliveryDate: '',
      vat: 0,
      selectedVendor: '',
      approvedBy: '',
      itemGroups: [
        {
          description: '',
          itemName: '',
          frequency: 1,
          quantity: 1,
          unit: '',
          unitCost: 0,
          total: 0,
        },
      ],
    };
  });

  // const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // ============================================================
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // ============================================================
  const { createIndependentPurchaseOrder, isPending: isCreating } =
    useCreateIndependentPurchaseOrder();
  const { createPurchaseOrderFromRFQ, isPending: isCreatingFromRFQ } =
    useCreatePurchaseOrderFromRFQ();
  const { updatePurchaseOrder, isPending: isUpdating } = useUpdatePurchaseOrder();

  const { data: usersData, isLoading: isLoadingUsers } = useUsers({ limit: 1000 });
  const { data: vendorsData, isLoading: isLoadingVendors } = useVendors({
    page: 1,
    limit: 1000,
  });

  // Memoized data - handle both possible response structures
  const users = useMemo(() => usersData?.data ?? [], [usersData]);

  const vendors = useMemo((): IVendor[] => {
    if (!vendorsData) return [];
    if (Array.isArray(vendorsData.data)) {
      return vendorsData.data;
    }
    if (vendorsData.data && typeof vendorsData.data === 'object' && 'vendors' in vendorsData.data) {
      return (vendorsData.data as { vendors: IVendor[] }).vendors;
    }
    return [];
  }, [vendorsData]);

  const isPending =
    mode === 'create' || mode === 'create-from-rfq' ? isCreating || isCreatingFromRFQ : isUpdating;

  // Filter vendors from RFQ for create-from-rfq mode
  const rfqVendors = useMemo(() => {
    if (mode !== 'create-from-rfq' || !rfqData?.copiedTo) return [];
    return vendors.filter((vendor: IVendor) =>
      rfqData.copiedTo.some((copiedVendor: string | IVendor) =>
        typeof copiedVendor === 'object'
          ? copiedVendor.id === vendor.id
          : copiedVendor === vendor.id
      )
    );
  }, [mode, rfqData, vendors]);

  // Form handlers
  const handleFormChange = useCallback(
    (field: keyof PurchaseOrderFormData, value: string | number) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  // Item handlers
  const handleItemChange = useCallback(
    (index: number, field: keyof IPOItemGroup, value: string | number) => {
      setFormData(prev => {
        const newItems = [...prev.itemGroups];
        const updatedItem = { ...newItems[index], [field]: value as never };

        if (['frequency', 'quantity', 'unitCost'].includes(field as string)) {
          updatedItem.total = calculateItemTotal(updatedItem);
        }

        newItems[index] = updatedItem;
        return { ...prev, itemGroups: newItems };
      });
    },
    []
  );

  const addItem = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      itemGroups: [
        ...prev.itemGroups,
        {
          description: '',
          itemName: '',
          frequency: 1,
          quantity: 1,
          unit: '',
          unitCost: 0,
          total: 0,
        },
      ],
    }));
  }, []);

  const removeItem = useCallback((index: number) => {
    setFormData(prev => {
      if (prev.itemGroups.length <= 1) return prev;
      return {
        ...prev,
        itemGroups: prev.itemGroups.filter((_, i) => i !== index),
      };
    });
  }, []);

  const getItemKey = useCallback((index: number) => {
    return `po-item-${index}`;
  }, []);

  // Calculate total amount
  const totalAmount = useMemo(
    () => formData.itemGroups.reduce((sum, item) => sum + (item.total || 0), 0),
    [formData.itemGroups]
  );

  const vatAmount = useMemo(
    () => (totalAmount * (formData.vat || 0)) / 100,
    [totalAmount, formData.vat]
  );

  const netAmount = useMemo(() => totalAmount - vatAmount, [totalAmount, vatAmount]);

  // Build submit data
  const buildSubmitData = useCallback((): ICreatePurchaseOrderPayload => {
    const itemGroupsForApi = formData.itemGroups.map(item => ({
      description: item.description || '',
      itemName: item.itemName || '',
      frequency: item.frequency,
      quantity: item.quantity,
      unit: item.unit,
      unitCost: item.unitCost,
      total: calculateItemTotal(item),
    }));

    return {
      rfqTitle: formData.rfqTitle,
      casfodAddressId: formData.casfodAddressId,
      poDate: formData.poDate,
      deliveryDate: formData.deliveryDate,
      vat: formData.vat,
      selectedVendor: formData.selectedVendor,
      itemGroups: itemGroupsForApi,
      approvedBy: formData.approvedBy
    };
  }, [formData]);

  // Build RFQ submit data
  const buildRFQSubmitData = useCallback((): {
    vat: number;
    poDate?: string;
    casfodAddressId: string;
    itemGroups: IItemGroup[];
    deliveryDate: string;
    rfqTitle?: string;
  } => {
    const itemGroupsForApi = formData.itemGroups.map(item => ({
      description: item.description || '',
      itemName: item.itemName || '',
      frequency: item.frequency,
      quantity: item.quantity,
      unit: item.unit,
      unitCost: item.unitCost,
      total: calculateItemTotal(item),
    }));

    return {
      rfqTitle: formData.rfqTitle,
      casfodAddressId: formData.casfodAddressId,
      poDate: formData.poDate,
      deliveryDate: formData.deliveryDate,
      vat: formData.vat,
      itemGroups: itemGroupsForApi,
    };
  }, [formData]);

  // Submit handler
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const isFormValid = form.reportValidity();
      if (!isFormValid) return;

      // Validate core fields
      if (!formData.rfqTitle.trim()) {
        toast.error('Please enter a purchase order title');
        return;
      }
      if (!formData.casfodAddressId) {
        toast.error('Please select a delivery address');
        return;
      }
      if (!formData.selectedVendor) {
        toast.error('Please select a vendor');
        return;
      }

      // Validate item groups
      const hasEmptyPrices = formData.itemGroups.some(item => item.unitCost <= 0);
      if (hasEmptyPrices) {
        toast.error('Please fill in all unit costs');
        return;
      }
      const hasInvalidQuantity = formData.itemGroups.some(item => item.quantity <= 0);
      if (hasInvalidQuantity) {
        toast.error('Please enter valid quantities for all items');
        return;
      }
      const hasInvalidFrequency = formData.itemGroups.some(item => item.frequency <= 0);
      if (hasInvalidFrequency) {
        toast.error('Please enter valid frequencies for all items');
        return;
      }

      if (mode === 'create') {
        const submitData = buildSubmitData();
        createIndependentPurchaseOrder(
          { data: submitData },
          {
            onSuccess: () => {
              onSuccess?.();
            },
          }
        );
      } else if (mode === 'create-from-rfq' && rfqId) {
        const submitData = buildRFQSubmitData();
        createPurchaseOrderFromRFQ(
          {
            rfqId,
            vendorId: formData.selectedVendor,
            data: submitData,
            approvedBy: formData.approvedBy,
          },
          {
            onSuccess: () => {
              onSuccess?.();
            },
          }
        );
      } else if (mode === 'edit' && initialData) {
        const submitData = buildSubmitData();
        updatePurchaseOrder(
          {
            purchaseOrderId: initialData.id,
            data: submitData,
          },
          {
            onSuccess: () => {
              onSuccess?.();
            },
          }
        );
      }
    },
    [
      formData,
      mode,
      rfqId,
      buildSubmitData,
      buildRFQSubmitData,
      createIndependentPurchaseOrder,
      createPurchaseOrderFromRFQ,
      updatePurchaseOrder,
      initialData,
      onSuccess,
    ]
  );

  const getSubmitLabel = useCallback(() => {
    if (isPending) {
      return mode === 'edit' ? 'Updating...' : 'Creating...';
    }
    if (mode === 'edit') {
      return 'Update Purchase Order';
    }
    if (mode === 'create-from-rfq') {
      return 'Create Purchase Order from RFQ';
    }
    return 'Create Purchase Order';
  }, [isPending, mode]);

  // Render item group (matches RFQForm styling)
  const renderItem = useCallback(
    (item: IPOItemGroup, index: number) => {
      const total = calculateItemTotal(item);

      return (
        <div
          key={getItemKey(index)}
          className="relative bg-gray-50 p-4 rounded-lg border shadow-sm"
        >
          {formData.itemGroups.length > 1 && (
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
          )}

          <h4 className="text-sm font-semibold text-gray-700 mb-3">ITEM {index + 1}</h4>

          <FormRow label="Item Name *">
            <Input
              inputSize="sm"
              type="text"
              required
              value={item.itemName || ''}
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
                value={total.toFixed(2)}
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
              placeholder="Enter item description"
            />
          </FormRow>
        </div>
      );
    },
    [formData.itemGroups.length, isPending, handleItemChange, removeItem, getItemKey]
  );

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Status Display (Edit Mode) - matches RFQForm */}
      {mode === 'edit' && initialData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <span className="font-bold uppercase">Status:</span>
            <span className="ml-2 capitalize">{initialData.status}</span>
          </div>
          <div>
            <span className="font-bold uppercase">PO Code:</span>
            <span className="ml-2">{initialData.poCode}</span>
          </div>
        </div>
      )}

      {/* RFQ Info (Create from RFQ mode) */}
      {mode === 'create-from-rfq' && rfqData && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <span className="font-bold">Creating from RFQ:</span> {rfqData.rfqTitle}
          </p>
        </div>
      )}

      {/* Basic Information */}
      <FormRow label="Purchase Order Title *">
        <Input
          inputSize="sm"
          type="text"
          required
          value={formData.rfqTitle}
          onChange={e => handleFormChange('rfqTitle', e.target.value)}
          disabled={isPending || mode === 'create-from-rfq'}
          placeholder="Enter purchase order title"
        />
      </FormRow>

      {/* Delivery Address */}
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
            {casfodAddress.map(addr => (
              <SelectItem key={addr.id} value={addr.id}>
                {addr.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormRow>

      {/* Dates - matches RFQForm grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="PO Date">
          <DatePicker
            selected={formData.poDate ? new Date(formData.poDate) : null}
            onChange={date => handleFormChange('poDate', date ? date.toISOString() : '')}
            variant="secondary"
            placeholder="Select date"
            disabled={isPending}
          />
        </FormRow>

        <FormRow label="Delivery Date">
          <DatePicker
            selected={formData.deliveryDate ? new Date(formData.deliveryDate) : null}
            onChange={date => handleFormChange('deliveryDate', date ? date.toISOString() : '')}
            variant="secondary"
            placeholder="Select date"
            disabled={isPending}
          />
        </FormRow>
      </div>

      {/* Vendor Selection - matches RFQForm styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Vendor *">
          {isLoadingVendors ? (
            <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
          ) : (
            <Select
              value={formData.selectedVendor || ''}
              onValueChange={value => handleFormChange('selectedVendor', value)}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Vendor" />
              </SelectTrigger>
              <SelectContent>
                {(mode === 'create-from-rfq' ? rfqVendors : vendors).map((vendor: IVendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.businessName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormRow>

        <FormRow label="Approved By *">
          {isLoadingUsers ? (
            <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
          ) : (
            <Select
              value={formData.approvedBy || ''}
              onValueChange={value => handleFormChange('approvedBy', value)}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Admin" />
              </SelectTrigger>
              <SelectContent>
                {users
                  .filter((user: IUser) => user.role === 'ADMIN' || user.role === 'SUPER-ADMIN')
                  .map((user: IUser) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.role})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        </FormRow>
      </div>

      {/* Items Section - matches RFQForm */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Items</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto p-4 border rounded-lg">
          {formData.itemGroups.map((item, index) => renderItem(item, index))}
        </div>

        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">
            {formData.itemGroups.length} item{formData.itemGroups.length > 1 ? 's' : ''} added
          </p>
          <Button type="button" variant="outline" size="sm" onClick={addItem} disabled={isPending}>
            <FaPlus className="h-4 w-4 mr-1" /> Add Item
          </Button>
        </div>

        {/* Financial Summary - matches RFQForm grand total styling */}
        {formData.itemGroups.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-end items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                  WHT (%)
                </Label>
                <NumberInput
                  inputSize="sm"
                  min={0}
                  max={100}
                  step={0.01}
                  value={formData.vat}
                  onChange={value => handleFormChange('vat', value ?? 0)}
                  className="w-24"
                  disabled={isPending}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold text-gray-600">
                GROSS TOTAL: ₦
                {totalAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>

              {formData.vat > 0 && (
                <div className="text-md font-semibold text-gray-600">
                  ({formData.vat}%) WHT Amount: ₦
                  {vatAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              )}

              <div className="text-lg font-bold text-brand-600 border-t pt-2">
                NET TOTAL: ₦
                {netAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* File Upload - matches RFQForm */}
      {/* <div className="space-y-1.5">
        <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">
          Attachments
        </Label>
        <FileUpload
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          accept=".pdf,.jpg,.png,.xlsx,.docx"
          multiple={true}
          disabled={isPending}
        />
      </div> */}

      {/* Action Buttons - matches RFQForm */}
      <div className="flex justify-center w-full gap-4 pt-4 border-t">
        <div className="flex flex-col md:flex-row gap-4">
          <Button type="submit" size="md" disabled={isPending} className="min-w-[150px]">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'edit' ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              getSubmitLabel()
            )}
          </Button>

          <Button type="button" size="md" variant="secondary" disabled={isPending}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
};

export default PurchaseOrderForm;
