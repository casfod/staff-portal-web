// CopiedTo.tsx - Rewritten with Radix UI
import { IUser } from '../../interfaces';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface CopiedToProps {
  to: IUser[];
}

const CopiedTo = ({ to }: CopiedToProps) => {
  const getUserInitials = (user: IUser) => {
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`;
  };

  return (
    <div className="w-full p-4 bg-inherit rounded-lg shadow-sm">
      <h1 className="font-semibold text-gray-800 mb-4">SHARED WITH:</h1>

      {to.length === 0 ? (
        <p className="text-sm text-gray-400">No recipients</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3">
          {to.map(user => (
            <div key={user.id} className="p-3 border rounded-md hover:bg-gray-50 transition-colors">
              <div className="flex flex-col md:flex-row items-center gap-3 shadow-md md:shadow-none p-2 md:p-0 rounded-md">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-50 text-blue-600 text-xs font-medium">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-start min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {`${user.firstName} ${user.lastName}`}
                  </p>
                  <p className="text-xs text-gray-600 truncate">{user.email}</p>
                </div>
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  {user.role}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CopiedTo;
