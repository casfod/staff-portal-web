// UsersTableRow.tsx - With Dropdown Effect for StaffDetails
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { IUser } from '../../interfaces';
import { localStorageUser } from '../../utils/localStorageUser';
import { USER_TABLE_HEADERS } from '../../config/user.config';
import { openModal } from '../../store/modalSlice';

// Radix UI Components
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { ChevronDown, ChevronRight, ChevronUp, Trash2, UserCog } from 'lucide-react';

// Custom Components
import StaffDetails from '../employment-info/StaffDetails';

interface UserTableRowProps {
  user: IUser;
  onEdit: (user: IUser) => void;
  onDelete: (id: string) => void;
  onInspect?: (user: IUser) => void;
}

const UserTableRow: React.FC<UserTableRowProps> = ({ user, onDelete }) => {
  const dispatch = useDispatch();
  const currentUser = localStorageUser();
  const isSuperAdmin = currentUser?.role === 'SUPER-ADMIN';
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusBadge = () => {
    if (user.isDeleted) {
      return (
        <Badge variant="destructive" className="text-xs">
          Inactive
        </Badge>
      );
    }
    return (
      <Badge variant="success" className="text-xs">
        Active
      </Badge>
    );
  };

  // Opens the Modal.Window with name={`userCog-${user.id}`} that's already
  // defined in AllUsers.tsx (with noBorder / customPadding / showCloseButton
  // props). Do NOT render a separate local <Dialog> here — that bypasses
  // those props entirely and is how the styling mismatch happened before.
  const handleOpenUserCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(openModal(`userCog-${user.id}`));
  };

  const actionsContent = isSuperAdmin ? (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="text-brand-600 hover:text-brand-800 hover:bg-brand-50 p-1 h-8 w-8"
        onClick={handleOpenUserCard}
        aria-label="Edit user"
      >
        <UserCog className="h-5 w-5" />
      </Button>

      {!user.isDeleted && user.role !== 'SUPER-ADMIN' && (
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 h-8 w-8"
          onClick={e => {
            e.stopPropagation();
            onDelete(user.id);
          }}
          aria-label="Delete user"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      )}
    </div>
  ) : null;

  return (
    <>
      {/* Desktop/Tablet View */}
      <tr
        onClick={() => setIsExpanded(!isExpanded)}
        className="hidden md:table-row hover:bg-gray-50/50 transition-colors"
      >
        {/* Name with Expand/Collapse Button */}
        <td className="px-3 py-2.5 md:px-4 md:py-3 text-sm">
          <div className="flex items-center gap-2">
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <span className="font-medium">
              {user.firstName} {user.lastName}
            </span>
          </div>
        </td>
        <td className="px-3 py-2.5 md:px-4 md:py-3 text-sm">{user.email}</td>
        <td className="px-3 py-2.5 md:px-4 md:py-3 text-sm capitalize">
          {user.role.toLowerCase().replace('-', ' ')}
        </td>
        <td className="px-3 py-2.5 md:px-4 md:py-3 table-cell">{getStatusBadge()}</td>
        {actionsContent && <td className="px-3 py-2.5 md:px-4 md:py-3">{actionsContent}</td>}
      </tr>

      {/* Expanded Details Row */}
      {isExpanded && (
        <tr className="hidden md:table-row">
          <td colSpan={USER_TABLE_HEADERS.length} className="px-3 py-4 md:px-6 bg-gray-50/50">
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <StaffDetails staffInfo={user} />
            </div>
          </td>
        </tr>
      )}

      {/* Mobile View */}
      <tr className="md:hidden">
        <td colSpan={USER_TABLE_HEADERS.length} className="p-2 sm:p-4 border-b border-gray-200">
          <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-4 shadow-sm space-y-3">
            {/* Header with expand button */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-1 items-center justify-between">
              <div className="w-full flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="hidden md:block text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              {getStatusBadge()}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-sm text-gray-600 capitalize">
                {user.role.toLowerCase().replace('-', ' ')}
              </span>
              {actionsContent && <div className="flex items-center gap-2">{actionsContent}</div>}
            </div>

            <div className="w-full flex justify-center">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Expanded Mobile Details */}
            {isExpanded && (
              <div className="pt-3 mt-3 border-t border-gray-200">
                <StaffDetails staffInfo={user} />
              </div>
            )}
          </div>
        </td>
      </tr>
    </>
  );
};

export default UserTableRow;
