// TagUsersDropdown.tsx - Fixed all linting errors
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronRight, Search, X } from 'lucide-react';
import { IUser } from '../../interfaces';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface GroupedUsers {
  [role: string]: IUser[];
}

interface TagUsersDropdownProps {
  users: IUser[] | [];
  isLoading: boolean;
  isError: boolean;
  onSelectUsers: (recipients: string[]) => Promise<void>;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLDivElement>;
  errorMessage?: string;
  // Search now lives here only as a pass-through: the actual filtering
  // happens server-side (debounced) via useTagSharing, since `users` is
  // fetched a page at a time rather than in full.
  searchTerm: string;
  onSearchChange: (term: string) => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

const TagUsersDropdown = ({
  users,
  isLoading,
  isError,
  onSelectUsers,
  onClose,
  anchorRef,
  errorMessage,
  searchTerm,
  onSearchChange,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: TagUsersDropdownProps) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});
  const [coords, setCoords] = useState({ top: 0, right: 0, maxListHeight: 240 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isOpenRef = useRef(true);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Group users by role
  const groupedUsers = useRef<GroupedUsers>({});

  useEffect(() => {
    const groupUsersByRole = (users: IUser[]): GroupedUsers => {
      return users.reduce((groups: GroupedUsers, user) => {
        const role = user.role || 'Other';
        if (!groups[role]) {
          groups[role] = [];
        }
        groups[role].push(user);
        return groups;
      }, {});
    };

    groupedUsers.current = groupUsersByRole(users as IUser[]);
  }, [users]);

  const allRoles = Object.keys(groupedUsers.current);

  // Initialize expanded roles - only when roles change
  useEffect(() => {
    const initialExpandedState: Record<string, boolean> = {};
    allRoles.forEach(role => {
      initialExpandedState[role] = true;
    });
    setExpandedRoles(initialExpandedState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRoles.join(',')]); // Use stringified array as dependency

  // Calculate position + how much vertical space is actually available below
  // the anchor, so the list's scroll container never has to guess a fixed
  // height. `position: fixed` is viewport-relative, so `top` must NOT
  // include window.scrollY — adding it was pushing the dropdown further off
  // screen the more the page was scrolled, which is what made items look
  // "pushed" with no way to reach them.
  const computeCoords = useCallback(() => {
    if (!anchorRef?.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const OFFSET = 8;
    const BOTTOM_MARGIN = 16;
    const available = window.innerHeight - rect.bottom - OFFSET - BOTTOM_MARGIN;
    // Keep the whole card usable even on short viewports, but don't let the
    // list balloon past a sensible size on tall ones.
    const maxListHeight = Math.max(120, Math.min(available, 320));

    setCoords({
      top: rect.bottom + OFFSET,
      right: window.innerWidth - rect.right,
      maxListHeight,
    });
  }, [anchorRef]);

  useEffect(() => {
    computeCoords();
    setIsInitialized(true);
  }, [computeCoords]);

  // Recalculate on scroll/resize
  useEffect(() => {
    window.addEventListener('scroll', computeCoords, true);
    window.addEventListener('resize', computeCoords);
    return () => {
      window.removeEventListener('scroll', computeCoords, true);
      window.removeEventListener('resize', computeCoords);
    };
  }, [computeCoords]);

  // Handle click outside - fixed with proper cleanup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isOpenRef.current) return;

      const target = event.target as Node;
      const isInsideDropdown = dropdownRef.current?.contains(target);
      const isInsideAnchor = anchorRef?.current?.contains(target);
      const isInsidePortal = dropdownRef.current?.contains(target);

      if (!isInsideDropdown && !isInsideAnchor && !isInsidePortal) {
        isOpenRef.current = false;
        onClose();
      }
    };

    // Clear any existing timeout
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }

    if (isInitialized) {
      timeoutIdRef.current = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 200);
    }

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isInitialized, onClose, anchorRef]); // Include all dependencies

  // `users` arrives already filtered by the debounced server-side search
  // (see useTagSharing), so no client-side re-filtering is needed here.
  const filteredGroupedUsers: GroupedUsers = groupedUsers.current;

  const toggleRoleExpansion = (role: string) => {
    setExpandedRoles(prev => ({
      ...prev,
      [role]: !prev[role],
    }));
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
    setSubmitError(null);
  };

  const toggleAllInRole = (role: string) => {
    const roleUserIds = filteredGroupedUsers[role].map(user => user.id);
    const allSelected = roleUserIds.every(id => selectedUsers.includes(id!));

    if (allSelected) {
      setSelectedUsers(prev => prev.filter(id => !roleUserIds.includes(id)));
    } else {
      const currentSelectedIds = new Set(selectedUsers);
      roleUserIds.forEach(id => currentSelectedIds.add(id!));
      setSelectedUsers(Array.from(currentSelectedIds));
    }
    setSubmitError(null);
  };

  const getSelectedCountByRole = (role: string) => {
    return filteredGroupedUsers[role].filter(user => selectedUsers.includes(user.id!)).length;
  };

  const handleDropdownClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  }, []);

  const handleSubmit = async () => {
    if (selectedUsers.length === 0) {
      setSubmitError('Please select at least one user to share with.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSelectUsers(selectedUsers);
      isOpenRef.current = false;
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to share request. Please try again.';
      setSubmitError(message);
      console.error('[TagUsersDropdown] Submit failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset open state when dropdown mounts
  useEffect(() => {
    isOpenRef.current = true;
    return () => {
      isOpenRef.current = false;
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };
  }, []);

  const isEmpty = Object.values(filteredGroupedUsers).every(users => users?.length === 0);

  if (!isInitialized && anchorRef) {
    return null;
  }

  const hasError = isError || !!errorMessage || !!submitError;
  const displayError = submitError || errorMessage || 'Error loading users';

  const dropdownContent = (
    <div
      ref={dropdownRef}
      style={{
        position: anchorRef ? 'fixed' : 'absolute',
        top: anchorRef ? coords.top : undefined,
        right: anchorRef ? coords.right : 0,
        zIndex: 99999,
        ...(anchorRef ? {} : { marginTop: '8px' }),
      }}
      onClick={handleDropdownClick}
      onMouseDown={handleDropdownClick}
    >
      <motion.div
        className="w-72 rounded-md bg-white shadow-lg border border-gray-200 overflow-hidden"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              inputSize="sm"
              placeholder="Search users..."
              className="pl-9 pr-8"
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              autoFocus
              onClick={e => e.stopPropagation()}
              onMouseDown={e => e.stopPropagation()}
              disabled={isSubmitting}
            />
            {searchTerm && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={e => {
                  e.stopPropagation();
                  onSearchChange('');
                }}
                onMouseDown={e => e.stopPropagation()}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {hasError && (
          <div className="p-3 bg-red-50 border-b border-red-200">
            <div className="flex items-start text-red-600 text-sm">
              <X className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>{displayError}</span>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="overflow-y-auto p-2" style={{ maxHeight: coords.maxListHeight }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse mb-4">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                {[1, 2].map(j => (
                  <div key={j} className="flex items-center p-2">
                    <div className="w-4 h-4 rounded-sm bg-gray-200 mr-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : isEmpty && searchTerm ? (
          <div
            className="p-8 text-center text-gray-500 overflow-y-auto"
            style={{ maxHeight: coords.maxListHeight }}
          >
            <div className="flex justify-center mb-2">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm">No users found matching "{searchTerm}"</p>
            <button
              className="text-blue-500 text-sm mt-2 hover:underline"
              onClick={e => {
                e.stopPropagation();
                onSearchChange('');
              }}
              disabled={isSubmitting}
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="overflow-y-auto" style={{ maxHeight: coords.maxListHeight }}>
            {Object.keys(filteredGroupedUsers).map(role => {
              const usersInRole = filteredGroupedUsers[role];
              if (usersInRole.length === 0) return null;

              const selectedCount = getSelectedCountByRole(role);
              const allSelected = usersInRole.length > 0 && selectedCount === usersInRole.length;

              return (
                <div key={role} className="border-b last:border-b-0">
                  <div
                    className="flex items-center px-3 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={e => {
                      e.stopPropagation();
                      toggleRoleExpansion(role);
                    }}
                  >
                    <div
                      className="p-1 rounded-sm hover:bg-gray-200 mr-1 cursor-pointer"
                      onClick={e => {
                        e.stopPropagation();
                        toggleAllInRole(role);
                      }}
                      onMouseDown={e => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={allSelected}
                        className={cn(
                          'h-4 w-4',
                          allSelected && 'bg-blue-500 border-blue-500',
                          selectedCount > 0 && !allSelected && 'data-[state=checked]:bg-blue-500'
                        )}
                        disabled={isSubmitting}
                      />
                    </div>

                    <span className="text-sm font-medium flex-1">
                      {role}{' '}
                      {usersInRole.length > 0 && (
                        <span className="text-gray-500 text-xs ml-1">({usersInRole.length})</span>
                      )}
                    </span>

                    {selectedCount > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 mr-2">
                        {selectedCount} selected
                      </span>
                    )}

                    {expandedRoles[role] ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </div>

                  <AnimatePresence>
                    {expandedRoles[role] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {usersInRole.map(user => (
                          <div
                            key={user.id}
                            className="flex items-center px-3 py-2 pl-8 hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={e => {
                              e.stopPropagation();
                              toggleUserSelection(user.id!);
                            }}
                            onMouseDown={e => e.stopPropagation()}
                          >
                            <Checkbox
                              checked={selectedUsers.includes(user.id!)}
                              className="mr-3 h-4 w-4"
                              disabled={isSubmitting}
                            />
                            <span className="text-sm truncate">
                              {user.firstName} {user.lastName}
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {hasMore && (
              <div className="p-2 border-t">
                <button
                  className="w-full text-center text-sm text-blue-600 hover:underline py-1 disabled:text-gray-400 disabled:no-underline"
                  onClick={e => {
                    e.stopPropagation();
                    onLoadMore?.();
                  }}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? 'Loading more…' : 'Load more users'}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="p-3 border-t flex justify-between items-center bg-gray-50">
          <Button
            variant="outline"
            size="sm"
            onClick={e => {
              e.stopPropagation();
              isOpenRef.current = false;
              onClose();
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={e => {
              e.stopPropagation();
              handleSubmit();
            }}
            disabled={selectedUsers.length === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                Adding...
              </span>
            ) : (
              `Add ${selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}`
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );

  if (anchorRef) {
    return createPortal(dropdownContent, document.body);
  }

  return dropdownContent;
};

export default TagUsersDropdown;
