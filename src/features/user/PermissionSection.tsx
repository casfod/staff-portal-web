import { useState, useCallback, memo, useMemo } from 'react';
import { Badge } from '../../components/ui/badge';
import { Shield, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PermissionCheckbox } from './PermissionCheckbox';
import {
  EditedUser,
  PermissionItem,
  PermissionRole,
  PermissionKey,
  getPermissionCount,
} from './user-card.types';

interface PermissionSectionProps {
  title: string;
  permissions: readonly PermissionItem[];
  roleType: PermissionRole;
  editedUser: EditedUser;
  isEditing: boolean;
  isMobile: boolean;
  onPermissionToggle: (roleType: PermissionRole, key: PermissionKey) => void;
}

export const PermissionSection = memo(
  ({
    title,
    permissions,
    roleType,
    editedUser,
    isEditing,
    isMobile,
    onPermissionToggle,
  }: PermissionSectionProps) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleSection = useCallback(() => {
      setIsExpanded(prev => !prev);
    }, []);

    // Memoize the permission count
    const activeCount = useMemo(() => {
      return getPermissionCount(editedUser[roleType]);
    }, [editedUser, roleType]);

    // Memoize the checkbox handlers with stable references
    const handleToggle = useCallback(
      (key: PermissionKey) => {
        if (!isEditing) return;
        onPermissionToggle(roleType, key);
      },
      [isEditing, onPermissionToggle, roleType]
    );

    // Memoize permission items render
    const permissionItems = useMemo(() => {
      return permissions.map(permission => (
        <PermissionCheckbox
          key={`${roleType}-${permission.key}`}
          label={permission.label}
          description={permission.description}
          checked={editedUser[roleType][permission.key]}
          disabled={!isEditing}
          onToggle={() => handleToggle(permission.key)}
        />
      ));
    }, [permissions, roleType, editedUser, isEditing, handleToggle]);

    return (
      <div className="mb-2">
        {isMobile && title && (
          <button
            onClick={toggleSection}
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-brand-500" />
              <span className="text-sm font-semibold text-gray-700">{title}</span>
              <Badge variant="secondary" className="text-xs">
                {activeCount}/{permissions.length}
              </Badge>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
        )}

        {!isMobile && title && (
          <h3 className="text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-500" />
            {title}
            <Badge variant="secondary" className="text-xs">
              {activeCount}/{permissions.length}
            </Badge>
          </h3>
        )}

        {(!isMobile || isExpanded) && (
          <div className={cn('grid grid-cols-2 sm:grid-cols-1 gap-2', isMobile && 'mt-2')}>
            {permissionItems}
          </div>
        )}
      </div>
    );
  }
);

PermissionSection.displayName = 'PermissionSection';
