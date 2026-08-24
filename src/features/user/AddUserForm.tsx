// AddUserForm.tsx - Compact Version with Radix UI
import { FormEvent, useState } from 'react';
import { IUser } from '../../interfaces';
import { USER_ROLES, USER_POSITIONS } from '../../config/user.config';
import { useAddUser } from './Hooks/useUsers';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Label } from '../../components/ui/label';

interface AddUserFormProps {
  onSuccess?: () => void;
}

type AddUserFormData = Partial<IUser>;

const AddUserForm: React.FC<AddUserFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<AddUserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    role: '' as IUser['role'],
    position: '',
    procurementRole: { canCreate: false, canView: false, canUpdate: false, canDelete: false },
    financeRole: { canCreate: false, canView: false, canUpdate: false, canDelete: false },
  });

  const { addUser, isPending } = useAddUser();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: keyof AddUserFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    addUser(formData as Partial<IUser>, {
      onSuccess: () => onSuccess?.(),
    });
  };

  const canSubmit = !isPending;

  const roleOptions = USER_ROLES.map(r => r.value);
  const positionOptions = Array.from(USER_POSITIONS);

  return (
    <div className="w-full max-w-md p-4">
      <h2 className="text-lg font-bold text-center text-gray-900 mb-4">Add New User</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5">
              <Label htmlFor="firstName" className="text-xs">
                First Name
              </Label>
              <Input
                id="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                disabled={isPending}
                inputSize="sm"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-0.5">
              <Label htmlFor="lastName" className="text-xs">
                Last Name
              </Label>
              <Input
                id="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                disabled={isPending}
                inputSize="sm"
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="space-y-0.5">
            <Label htmlFor="email" className="text-xs">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isPending}
              inputSize="sm"
              className="h-8 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5">
              <Label htmlFor="position" className="text-xs">
                Position
              </Label>
              <Select
                value={formData.position || ''}
                onValueChange={handleSelectChange('position')}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {positionOptions.map(pos => (
                    <SelectItem key={pos} value={pos} className="text-sm">
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-0.5">
              <Label htmlFor="role" className="text-xs">
                User Role
              </Label>
              <Select value={formData.role || ''} onValueChange={handleSelectChange('role')}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map(role => (
                    <SelectItem key={role} value={role} className="text-sm">
                      {role.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          loading={isPending}
          disabled={!canSubmit}
          className="h-9 text-sm"
        >
          Add User
        </Button>
      </form>
    </div>
  );
};

export default AddUserForm;
