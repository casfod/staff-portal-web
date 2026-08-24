// BasicInfoTab.tsx - Updated to use isActive
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { AlertCircle } from 'lucide-react';
import { IUser } from '../../interfaces';
import { EditedUser } from './user-card.types';

interface BasicInfoTabProps {
  isEditing: boolean;
  isPending: boolean;
  editedUser: EditedUser;
  user: IUser;
  roleOptions: string[];
  positionOptions: string[];
  onSelectChange: (field: string) => (value: string) => void;
  onCheckboxChange: (checked: boolean) => void;
}

export const BasicInfoTab = ({
  isEditing,
  isPending,
  editedUser,
  user,
  roleOptions,
  positionOptions,
  onSelectChange,
  onCheckboxChange,
}: BasicInfoTabProps) => {
  return (
    <div className="mt-3 sm:mt-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-medium text-gray-600">User Role</Label>
          {isEditing ? (
            <Select
              value={editedUser.role}
              onValueChange={onSelectChange('role')}
              disabled={isPending}
            >
              <SelectTrigger className="h-9 text-sm mt-0.5">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map(role => (
                  <SelectItem key={role} value={role} className="text-sm">
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="mt-0.5 p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-900 capitalize">
              {user.role.toLowerCase().replace('-', ' ')}
            </div>
          )}
        </div>
        <div>
          <Label className="text-xs font-medium text-gray-600">Position</Label>
          {isEditing ? (
            <Select
              value={editedUser.position}
              onValueChange={onSelectChange('position')}
              disabled={isPending}
            >
              <SelectTrigger className="h-9 text-sm mt-0.5">
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
          ) : (
            <div className="mt-0.5 p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-900">
              {user.position || 'Not specified'}
            </div>
          )}
        </div>
      </div>

      {/* Reactivation option - shown when user is NOT active */}
      {!user.isActive && isEditing && (
        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <div className="flex items-center gap-3 flex-wrap">
            <Checkbox
              id="reactivateAccount"
              checked={editedUser.isActive || false}
              onCheckedChange={onCheckboxChange}
              disabled={isPending}
              className="h-4 w-4"
            />
            <Label htmlFor="reactivateAccount" className="text-sm text-gray-700 cursor-pointer">
              Reactivate this account
            </Label>
          </div>
        </div>
      )}

      {/* Show status badge for inactive users */}
      {!user.isActive && !isEditing && (
        <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
          <div className="h-2 w-2 rounded-full bg-red-500"></div>
          <span className="text-sm font-medium text-red-700">Account is deactivated</span>
        </div>
      )}
    </div>
  );
};
