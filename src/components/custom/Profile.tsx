// Profile.tsx - Rewritten with Radix UI
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, Shield, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { localStorageUser } from '../../utils/localStorageUser';
import { useLogout } from '../../features/authentication/authHooks/useLogout';
import { infoConfig } from '../../config/config-info';
import { cn } from '@/lib/utils';
import { useUserById } from '@/features/user/Hooks/useUsers';
import { getInitials } from '@/utils/getInitials';

const Profile = () => {
  const navigate = useNavigate();
  const { logout, isPending } = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const currentUser = localStorageUser();
  const user = currentUser;
  // const {data: userData} = useUser(currentUser.id)
  const {
    data: userData,
    // isLoading: isLoadingUser,
    // isError,
    // error,
  } = useUserById(currentUser.id!);

  const avatarUrl =
    userData?.data?.avatar?.url || user.avatar.url || infoConfig.profilePlaceHolder || '';

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded-full"
        >
          {/* Desktop view */}
          <div className="hidden md:flex items-center gap-3">
            <Badge variant="secondary" className="text-sm font-semibold">
              {user?.firstName?.toUpperCase()} {user?.lastName?.toUpperCase()}
            </Badge>
            <Avatar className="h-9 w-9 border-2 border-gray-200">
              <AvatarImage src={avatarUrl} alt={`${user?.firstName} ${user?.lastName}`} />

              <AvatarFallback className="bg-brand-100 text-brand-700 font-semibold">
                {getInitials(currentUser)}
              </AvatarFallback>
            </Avatar>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-gray-400 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </div>

          {/* Mobile view */}
          <div className="flex items-center gap-2 md:hidden">
            <Avatar className="h-10 w-10 bg-brand-100 text-brand-700 font-semibold">
              <AvatarImage src={avatarUrl} alt={`${user?.firstName} ${user?.lastName}`} />
              <AvatarFallback>{getInitials(currentUser)}</AvatarFallback>
            </Avatar>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-gray-400 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 p-0 rounded-xl shadow-2xl border border-gray-100/50 overflow-hidden"
      >
        {/* User Info */}
        <DropdownMenuLabel className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-gray-200">
              <AvatarImage src={avatarUrl} alt={`${user?.firstName} ${user?.lastName}`} />
              <AvatarFallback className="bg-brand-100 text-brand-700 font-semibold">
                {getInitials(currentUser)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              <Badge variant="outline" className="mt-1 text-xs">
                {user?.role || 'STAFF'}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>

        <div className="py-1">
          <DropdownMenuItem
            className="cursor-pointer px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50"
            onClick={() => {
              setIsOpen(false);
              navigate('/human-resources/staff-information/view');
            }}
          >
            <User className="w-4 h-4 mr-3 text-gray-400" />
            My Profile
          </DropdownMenuItem>

          {user?.role === 'SUPER-ADMIN' && (
            <DropdownMenuItem
              className="cursor-pointer px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50"
              onClick={() => {
                setIsOpen(false);
                navigate('/admin');
              }}
            >
              <Settings className="w-4 h-4 mr-3 text-gray-400" />
              Admin Settings
            </DropdownMenuItem>
          )}

          {user?.role === 'ADMIN' && (
            <DropdownMenuItem
              className="cursor-pointer px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50"
              onClick={() => {
                setIsOpen(false);
                navigate('/user-management');
              }}
            >
              <Shield className="w-4 h-4 mr-3 text-gray-400" />
              User Management
            </DropdownMenuItem>
          )}
        </div>

        <DropdownMenuSeparator />

        <div className="py-1">
          <DropdownMenuItem
            className="cursor-pointer px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
            onClick={handleLogout}
            disabled={isPending}
          >
            <LogOut className="w-4 h-4 mr-3" />
            {isPending ? 'Logging out...' : 'Logout'}
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Profile;
