// StatusUpdateForm.tsx - Rewritten with Radix UI
import { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface StatusUpdateFormProps {
  requestStatus: string;
  status: string;
  setStatus: (value: string) => void;
  isUpdatingStatus: boolean;
  handleStatusChange: () => void;
  statusOptions?: Array<{ value: string; label: string }>;
  isFinanceReviewer?: boolean;
  isProcurementReviewer?: boolean;
  isApprover?: boolean;
}

const StatusUpdateForm = ({
  requestStatus,
  status,
  setStatus,
  isUpdatingStatus,
  handleStatusChange,
  statusOptions,
  isFinanceReviewer = false,
  isProcurementReviewer = false,
  isApprover = false,
}: StatusUpdateFormProps) => {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleStatusChange();
  };

  const defaultStatusOptions =
    statusOptions ||
    (() => {
      const options = [];

      if (isFinanceReviewer) {
        options.push(
          { value: 'approved', label: 'Approve Finance Review' },
          { value: 'rejected', label: 'Reject Finance Review' }
        );
      } else if (isProcurementReviewer) {
        options.push(
          { value: 'approved', label: 'Approve Procurement Review' },
          { value: 'rejected', label: 'Reject Procurement Review' }
        );
      } else if (isApprover) {
        options.push(
          { value: 'approved', label: 'Approve Request' },
          { value: 'rejected', label: 'Reject Request' }
        );
      } else {
        if (requestStatus === 'pending') {
          options.push({ value: 'reviewed', label: 'Approve Review' });
        }
        if (requestStatus === 'reviewed') {
          options.push({ value: 'approved', label: 'Approve Request' });
        }
        options.push({ value: 'rejected', label: 'Reject' });
      }

      return options;
    })();

  const displayOptions = statusOptions || defaultStatusOptions;

  return (
    <form className="flex flex-col w-full gap-4 tracking-wide" onSubmit={handleSubmit}>

      <div className="w-full max-w-xs">
        <Select value={status} onValueChange={setStatus} disabled={isUpdatingStatus}>
          <SelectTrigger className="border-gray-700">
            <SelectValue placeholder="ACTIONS" />
          </SelectTrigger>
          <SelectContent>
            {displayOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {status && (
        <div className="flex w-full justify-center p-4">
          <Button
            type="submit"
            variant="primary"
            disabled={isUpdatingStatus}
            className="min-w-[150px]"
          >
            {isUpdatingStatus ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Status'
            )}
          </Button>
        </div>
      )}
    </form>
  );
};

export default StatusUpdateForm;
