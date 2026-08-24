// AdminApprovalSection.tsx - Rewritten with Radix UI
import React from 'react';
import FormRow from './FormRow';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Generic form data interface that works with any request type
interface AdminApprovalFormData {
  approvedBy?: string | null;
  [key: string]: unknown;
}

interface AdminApprovalSectionProps {
  formData: AdminApprovalFormData;
  handleFormChange: (field: string, value: string) => void;
  admins: { id?: string; firstName?: string; lastName?: string }[];
  isLoadingAmins: boolean;
  isUpdating: boolean;
  handleSend: (e: React.FormEvent) => void;
}

const AdminApprovalSection = ({
  formData,
  handleFormChange,
  admins,
  isLoadingAmins,
  isUpdating,
  handleSend,
}: AdminApprovalSectionProps) => {
  // Safely get the approvedBy value
  const approvedByValue =
    typeof formData.approvedBy === 'string'
      ? formData.approvedBy
      : (formData.approvedBy as unknown as { id?: string })?.id || '';

  const handleValueChange = (value: string) => {
    handleFormChange('approvedBy', value);
  };

  return (
    <div className="relative z-10 mt-4">
      <FormRow label="Approved By *">
        {isLoadingAmins ? (
          <div className="flex items-center justify-center h-10">
            <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
          </div>
        ) : (
          <Select value={approvedByValue} onValueChange={handleValueChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an admin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Clear selection</SelectItem>
              {admins.map(admin => (
                <SelectItem key={admin.id} value={admin.id || ''}>
                  {admin.firstName} {admin.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </FormRow>

      <div className="flex w-full justify-center p-4">
        {approvedByValue && (
          <Button disabled={isUpdating} onClick={handleSend} className="min-w-[150px]">
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Request Approval'
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdminApprovalSection;
