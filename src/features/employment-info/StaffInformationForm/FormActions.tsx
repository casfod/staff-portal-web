// src/features/employment-info/StaffInformationForm/FormActions.tsx
import React from 'react';
import { Button } from '../../../components/ui/button';
import SpinnerMini from '../../../components/custom/SpinnerMini';
import { Save, X } from 'lucide-react';

interface FormActionsProps {
  onClose?: () => void;
  isPending: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({ onClose, isPending }) => {
  return (
    <div className="bg-white border-t border-gray-200 p-4 flex justify-end gap-3 rounded-b-xl">
      {onClose && (
        <Button
          size="sm"
          type="button"
          variant="secondary"
          onClick={onClose}
          className="flex items-center gap-2 px-6"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
      )}
      <Button
        size="sm"
        variant={'outline'}
        type="submit"
        disabled={isPending}
        className="flex items-center gap-2 px-6 text-blue-600 hover:text-blue-700"
      >
        {isPending ? (
          <>
            <SpinnerMini />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Save
          </>
        )}
      </Button>
    </div>
  );
};
