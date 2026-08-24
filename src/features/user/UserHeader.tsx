// src/features/user/UserHeader.tsx
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Mail, Briefcase } from 'lucide-react';
import { cn } from '../../lib/utils';
import { IUser } from '../../interfaces';
import { EditedUser } from './user-card.types';
import { infoConfig } from '@/config/config-info';

interface UserHeaderProps {
  user: IUser;
  isEditing: boolean;
  isPending: boolean;
  editedUser: EditedUser;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  getRoleColor: (role: string) => string;
}

export const UserHeader = ({
  user,
  isEditing,
  isPending,
  editedUser,
  onInputChange,
  getRoleColor,
}: UserHeaderProps) => {
  const avatarUrl = user.avatar?.url || infoConfig.profilePlaceHolder;

  return (
    <div className="bg-gradient-to-r from-brand-50 to-blue-50 px-4 sm:px-6 py-4 border-b border-gray-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        {/* Avatar - display only */}
        <div className="relative flex-shrink-0 self-center sm:self-auto">
          <img
            src={avatarUrl}
            alt={`${user.firstName} ${user.lastName}`}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-3 border-white shadow-md"
            loading="lazy"
          />

          {/* Status dot */}
          <div
            className={cn(
              'absolute bottom-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-white',
              user.isDeleted ? 'bg-red-500' : 'bg-green-500'
            )}
          />
        </div>

        <div className="flex-1 min-w-0 w-full">
          {isEditing ? (
            <div className="space-y-2 w-full">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="firstName" className="text-xs font-medium text-gray-600">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={editedUser.firstName}
                    onChange={onInputChange}
                    placeholder="First Name"
                    disabled={isPending}
                    inputSize="sm"
                    className="h-9 text-sm mt-0.5"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-xs font-medium text-gray-600">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={editedUser.lastName}
                    onChange={onInputChange}
                    placeholder="Last Name"
                    disabled={isPending}
                    inputSize="sm"
                    className="h-9 text-sm mt-0.5"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="text-xs font-medium text-gray-600">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={editedUser.email}
                  onChange={onInputChange}
                  placeholder="Email Address"
                  disabled={isPending}
                  inputSize="sm"
                  className="h-9 text-sm mt-0.5"
                />
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate flex flex-wrap items-center gap-2">
                <span className="truncate">{`${user.firstName} ${user.lastName}`}</span>
                <Badge
                  variant={user.isDeleted ? 'destructive' : 'success'}
                  className="text-xs px-2 py-0.5 flex-shrink-0"
                >
                  {user.isDeleted ? 'Inactive' : 'Active'}
                </Badge>
              </h2>
              <p className="text-sm text-gray-600 truncate flex items-center gap-1.5 mt-0.5">
                <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs px-2 py-0.5 border',
                    getRoleColor(user.role.toLowerCase())
                  )}
                >
                  {user.role.toLowerCase().replace('-', ' ')}
                </Badge>
                {user.position && (
                  <>
                    <span className="text-gray-300 hidden sm:inline">•</span>
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <Briefcase className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{user.position}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
