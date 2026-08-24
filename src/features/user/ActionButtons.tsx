import { Button } from '../../components/ui/button';
import { Loader2, Save, X, Edit } from 'lucide-react';

interface ActionButtonsProps {
  isEditing: boolean;
  isPending: boolean;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
}

export const ActionButtons = ({
  isEditing,
  isPending,
  onSave,
  onCancel,
  onEdit,
}: ActionButtonsProps) => {
  if (isEditing) {
    return (
      <div className="flex sm:flex-row gap-3">
        <Button
          onClick={onSave}
          disabled={isPending}
          size="sm"
          className="flex-1 w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
          size="sm"
          className="flex-1 w-full sm:w-auto border-red-300 text-destructive hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={onEdit}
      size="sm"
      className="w-full bg-brand-600 hover:bg-brand-700 text-white"
    >
      <Edit className="mr-2 h-4 w-4" />
      Edit User
    </Button>
  );
};
