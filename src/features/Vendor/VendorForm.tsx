// VendorForm.tsx - Combined Create/Edit Form with Radix UI
import React, { useMemo, useState, useCallback } from 'react';
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
import { bankNames } from '../../assets/Banks';

// Constants
import { categories, businessState, businessTypes } from './vendorConstants';

// Hooks & Types
import { useAdmins } from '../user/Hooks/useUsers';
import { useCreateVendor, useCreateVendorDraft, useUpdateVendor } from './Hooks/useVendor';
import { IUser, IVendor } from '../../interfaces';
import toast from 'react-hot-toast';

// Form-specific type
type VendorFormData = {
  businessName: string;
  businessType: string;
  address: string;
  email: string;
  businessPhoneNumber: string;
  contactPhoneNumber: string;
  categories: string[];
  contactPerson: string;
  position: string;
  businessRegNumber: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  businessState: string;
  operatingLga: string;
  tinNumber: string;
  approvedBy: string | null;
  status?: string; // For display purposes
};

interface VendorFormProps {
  mode: 'create' | 'edit';
  initialData?: IVendor;
  onSuccess?: () => void;
}

// FormRow component for consistent layout
const FormRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium text-gray-700 uppercase tracking-wide">{label}</Label>
    {children}
  </div>
);

const VendorForm: React.FC<VendorFormProps> = ({ mode, initialData, onSuccess }) => {
  // Form State
  const [formData, setFormData] = useState<VendorFormData>(() => {
    if (mode === 'edit' && initialData) {
      return {
        businessName: initialData.businessName || '',
        businessType: initialData.businessType || '',
        address: initialData.address || '',
        email: initialData.email || '',
        businessPhoneNumber: initialData.businessPhoneNumber || '',
        contactPhoneNumber: initialData.contactPhoneNumber || '',
        categories: initialData.categories || [],
        contactPerson: initialData.contactPerson || '',
        position: initialData.position || '',
        businessRegNumber: initialData.businessRegNumber || '',
        bankName: initialData.bankName || '',
        accountName: initialData.accountName || '',
        accountNumber: initialData.accountNumber || '',
        businessState: initialData.businessState || '',
        operatingLga: initialData.operatingLga || '',
        tinNumber: initialData.tinNumber || '',
        approvedBy: null,
        status: initialData.status || 'draft',
      };
    }

    return {
      businessName: '',
      businessType: '',
      address: '',
      email: '',
      businessPhoneNumber: '',
      contactPhoneNumber: '',
      categories: [],
      contactPerson: '',
      position: '',
      businessRegNumber: '',
      bankName: '',
      accountName: '',
      accountNumber: '',
      businessState: '',
      operatingLga: '',
      tinNumber: '',
      approvedBy: null,
      status: 'draft',
    };
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    if (mode === 'edit' && initialData?.categories) {
      return initialData.categories
        .map(catName => {
          const category = categories.find(cat => cat.name === catName);
          return category?.id || catName;
        })
        .filter(Boolean);
    }
    return [];
  });

  // Hooks
  const { createVendor, isPending: isSending } = useCreateVendor();
  const { createVendorDraft, isPending: isSaving } = useCreateVendorDraft();
  const { updateVendor, isPending: isUpdating } = useUpdateVendor();

  const { data: adminsData, isLoading: isLoadingAdmins } = useAdmins();
  const admins = useMemo(() => adminsData?.data ?? [], [adminsData]);

  const isPending = mode === 'create' ? isSaving || isSending : isUpdating;

  // Determine if editing is allowed
  const canEdit = useMemo(() => {
    if (mode === 'create') return true;
    if (!initialData) return false;
    return true;
  }, [mode, initialData]);

  const handleFormChange = useCallback((field: keyof VendorFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategories(prev => {
      const newCategoryIds = prev.includes(categoryId)
        ? prev.filter(cat => cat !== categoryId)
        : [...prev, categoryId];

      const categoryNames = newCategoryIds.map(id => {
        const category = categories.find(cat => cat.id === id);
        return category?.name || id;
      });

      setFormData(prev => ({
        ...prev,
        categories: categoryNames,
      }));

      return newCategoryIds;
    });
  }, []);

  const buildSubmitData = useCallback(() => {
    const selectedApprover = formData.approvedBy
      ? admins.find((a: IUser) => a.id === formData.approvedBy)
      : null;

    return {
      businessName: formData.businessName,
      businessType: formData.businessType,
      address: formData.address,
      email: formData.email,
      businessPhoneNumber: formData.businessPhoneNumber,
      contactPhoneNumber: formData.contactPhoneNumber,
      categories: formData.categories,
      contactPerson: formData.contactPerson,
      position: formData.position,
      businessRegNumber: formData.businessRegNumber,
      bankName: formData.bankName,
      accountName: formData.accountName,
      accountNumber: formData.accountNumber,
      businessState: formData.businessState,
      operatingLga: formData.operatingLga,
      tinNumber: formData.tinNumber,
      ...(selectedApprover && { approvedBy: selectedApprover }),
    };
  }, [formData, admins]);

  // VendorForm.tsx
  const handleSaveDraft = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const isFormValid = (e.target as HTMLFormElement).reportValidity();
      if (!isFormValid) return;

      const data = buildSubmitData();
      const { approvedBy: _, ...draftData } = data;

      if (mode === 'create') {
        createVendorDraft(draftData, {
          onSuccess: response => {
            // Only call onSuccess if the response was actually successful
            if (response.statusCode === 201) {
              onSuccess?.();
            }
          },
        });
      } else {
        updateVendor({
          vendorId: initialData?.id || '',
          data: draftData,
        });
      }
    },
    [buildSubmitData, mode, createVendorDraft, updateVendor, initialData, onSuccess]
  );

  const handleSubmitForApproval = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const isFormValid = (e.target as HTMLFormElement).reportValidity();
      if (!isFormValid) return;

      if (!formData.approvedBy) {
        toast.error('Please select an approver');
        return;
      }

      const data = buildSubmitData();
      createVendor(data, {
        onSuccess: response => {
          // Only call onSuccess if the response was actually successful
          if (response.statusCode === 201) {
            onSuccess?.();
          }
        },
      });
    },
    [buildSubmitData, formData.approvedBy, createVendor, onSuccess]
  );
  // Determine submit label based on form state
  const getSubmitLabel = useCallback(() => {
    if (isPending) {
      return mode === 'create' ? 'Creating...' : 'Updating...';
    }
    if (mode === 'create') {
      return formData.approvedBy ? 'Save and Submit for Approval' : 'Save as Draft';
    }
    return formData.approvedBy ? 'Update and Submit for Approval' : 'Update as Draft';
  }, [isPending, mode, formData.approvedBy]);

  // Get the appropriate submit handler
  const getSubmitHandler = useCallback(() => {
    const label = getSubmitLabel();
    if (label.includes('Submit for Approval')) {
      return handleSubmitForApproval;
    }
    return handleSaveDraft;
  }, [getSubmitLabel, handleSubmitForApproval, handleSaveDraft]);

  // Render functions
  const renderCategoryCheckboxes = useCallback(
    () => (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-3">
          {categories.map(category => (
            <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                disabled={!canEdit || isPending}
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCategoryChange(category.id)}
                className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{category.name}</span>
            </label>
          ))}
        </div>
        {selectedCategories.length > 0 && (
          <p className="text-xs text-gray-500">
            Selected:{' '}
            {selectedCategories.map(catId => categories.find(c => c.id === catId)?.name).join(', ')}
          </p>
        )}
      </div>
    ),
    [selectedCategories, canEdit, isPending, handleCategoryChange]
  );

  return (
    <form className="space-y-6">
      {/* Status Badge - Edit Mode Only */}
      {mode === 'edit' && initialData && formData.status && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <span className="font-bold uppercase">Status:</span>
            <span className="ml-2 capitalize">{formData.status}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Business Name *">
          <Input
            inputSize="sm"
            type="text"
            required
            disabled={!canEdit || isPending}
            value={formData.businessName}
            onChange={e => handleFormChange('businessName', e.target.value)}
            placeholder="Enter business name"
          />
        </FormRow>

        <FormRow label="Business Type *">
          <Select
            value={formData.businessType || ''}
            onValueChange={value => handleFormChange('businessType', value)}
            disabled={!canEdit || isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Business Type" />
            </SelectTrigger>
            <SelectContent>
              {businessTypes.map(type => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormRow>
      </div>

      <FormRow label="Categories">{renderCategoryCheckboxes()}</FormRow>

      <FormRow label="Business Address *">
        <textarea
          className="w-full min-h-[100px] p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
          maxLength={500}
          required
          disabled={!canEdit || isPending}
          value={formData.address}
          onChange={e => handleFormChange('address', e.target.value)}
          placeholder="Enter full business address"
        />
      </FormRow>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Where Your Company does Business *">
          <Select
            value={formData.businessState || ''}
            onValueChange={value => handleFormChange('businessState', value)}
            disabled={!canEdit || isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a State" />
            </SelectTrigger>
            <SelectContent>
              {businessState.map(state => (
                <SelectItem key={state.id} value={state.id}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormRow>

        <FormRow label="Preferred LGA of Operation *">
          <Input
            inputSize="sm"
            type="text"
            required
            disabled={!canEdit || isPending}
            value={formData.operatingLga}
            onChange={e => handleFormChange('operatingLga', e.target.value)}
            placeholder="Enter Local Government Area"
          />
        </FormRow>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Email Address *">
          <Input
            inputSize="sm"
            type="email"
            required
            disabled={!canEdit || isPending}
            value={formData.email}
            onChange={e => handleFormChange('email', e.target.value)}
            placeholder="email@company.com"
          />
        </FormRow>

        <FormRow label="Business Registration Number *">
          <Input
            inputSize="sm"
            type="text"
            required
            disabled={!canEdit || isPending}
            value={formData.businessRegNumber}
            onChange={e => handleFormChange('businessRegNumber', e.target.value)}
            placeholder="Enter registration number"
          />
        </FormRow>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Business Phone *">
          <Input
            inputSize="sm"
            type="tel"
            required
            disabled={!canEdit || isPending}
            value={formData.businessPhoneNumber}
            onChange={e => handleFormChange('businessPhoneNumber', e.target.value)}
            placeholder="11-digit phone number"
            pattern="[0-9]{11}"
            maxLength={11}
          />
        </FormRow>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Contact Person *">
          <Input
            inputSize="sm"
            type="text"
            required
            disabled={!canEdit || isPending}
            value={formData.contactPerson}
            onChange={e => handleFormChange('contactPerson', e.target.value)}
            placeholder="Full name of contact person"
          />
        </FormRow>

        <FormRow label="Position *">
          <Input
            inputSize="sm"
            type="text"
            required
            disabled={!canEdit || isPending}
            value={formData.position}
            onChange={e => handleFormChange('position', e.target.value)}
            placeholder="Position in company"
          />
        </FormRow>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Contact Phone *">
          <Input
            inputSize="sm"
            type="tel"
            required
            disabled={!canEdit || isPending}
            value={formData.contactPhoneNumber}
            onChange={e => handleFormChange('contactPhoneNumber', e.target.value)}
            placeholder="11-digit phone number"
            pattern="[0-9]{11}"
            maxLength={11}
          />
        </FormRow>

        <FormRow label="TIN Number *">
          <Input
            inputSize="sm"
            type="text"
            required
            disabled={!canEdit || isPending}
            value={formData.tinNumber}
            onChange={e => handleFormChange('tinNumber', e.target.value)}
            placeholder="Tax Identification Number"
          />
        </FormRow>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormRow label="Account Number *">
          <Input
            inputSize="sm"
            type="text"
            required
            disabled={!canEdit || isPending}
            value={formData.accountNumber}
            onChange={e => handleFormChange('accountNumber', e.target.value)}
            placeholder="10-digit account number"
            maxLength={10}
            minLength={10}
          />
        </FormRow>

        <FormRow label="Account Name *">
          <Input
            inputSize="sm"
            type="text"
            required
            disabled={!canEdit || isPending}
            value={formData.accountName}
            onChange={e => handleFormChange('accountName', e.target.value)}
            placeholder="Enter account name"
          />
        </FormRow>
      </div>

      <FormRow label="Bank Name *">
        <Select
          value={formData.bankName || ''}
          onValueChange={value => handleFormChange('bankName', value)}
          disabled={!canEdit || isPending}
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

      {/* Approver Selection */}
      <FormRow label="Approved By *">
        {isLoadingAdmins ? (
          <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
        ) : (
          <Select
            value={formData.approvedBy || ''}
            onValueChange={value => handleFormChange('approvedBy', value)}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an approver" />
            </SelectTrigger>
            <SelectContent>
              {admins.map((admin: IUser) => (
                <SelectItem key={admin.id} value={admin.id}>
                  {admin.firstName} {admin.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </FormRow>

      {/* Consistent single submit button matching AdvanceRequestForm */}
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

export default VendorForm;
