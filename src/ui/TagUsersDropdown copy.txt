import { useState, useEffect, useRef } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  CheckCheck,
  Circle,
} from "lucide-react";
import { UserType, VendorType } from "../interfaces";
import { AnimatePresence, motion } from "framer-motion";
import Button from "./Button";

interface GroupedUsers {
  [role: string]: UserType[];
}

interface TagUsersDropdownProps {
  users: UserType[] | VendorType[];
  isLoading: boolean;
  isError: boolean;
  onSelectUsers: (userIds: string[]) => Promise<void>;
  onClose: () => void;
}

const TagUsersDropdown = ({
  users,
  isLoading,
  isError,
  onSelectUsers,
  onClose,
}: TagUsersDropdownProps) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>(
    {}
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Group users by role
  const groupUsersByRole = (users: UserType[]): GroupedUsers => {
    return users.reduce((groups: GroupedUsers, user) => {
      const role = user.role || "Other";
      if (!groups[role]) {
        groups[role] = [];
      }
      groups[role].push(user);
      return groups;
    }, {});
  };

  const groupedUsers = groupUsersByRole(users as UserType[]);

  // Get all possible roles (even if filtered out by search)
  const allRoles = Object.keys(groupedUsers);

  // Initialize expanded state for all roles
  useEffect(() => {
    const initialExpandedState: Record<string, boolean> = {};
    allRoles.forEach((role) => {
      initialExpandedState[role] = true; // Start with all expanded
    });
    setExpandedRoles(initialExpandedState);
  }, []);

  // Filter users based on search term
  const filteredGroupedUsers: GroupedUsers = {};
  Object.keys(groupedUsers).forEach((role) => {
    filteredGroupedUsers[role] = groupedUsers[role].filter((user) =>
      `${user.first_name} ${user.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  // Toggle role expansion
  const toggleRoleExpansion = (role: string) => {
    setExpandedRoles((prev) => ({
      ...prev,
      [role]: !prev[role],
    }));
  };

  // Toggle user selection
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Toggle all users in a role
  const toggleAllInRole = (role: string) => {
    const roleUserIds = filteredGroupedUsers[role].map((user) => user.id);
    const allSelected = roleUserIds.every((id) => selectedUsers.includes(id!));

    if (allSelected) {
      // Remove all users of this role from selection
      setSelectedUsers((prev) =>
        prev.filter((id) => !roleUserIds.includes(id))
      );
    } else {
      // Add all users of this role to selection
      const currentSelectedIds = new Set(selectedUsers);
      roleUserIds.forEach((id) => currentSelectedIds.add(id!));
      setSelectedUsers(Array.from(currentSelectedIds));
    }
  };

  // Count selected users by role
  const getSelectedCountByRole = (role: string) => {
    return filteredGroupedUsers[role].filter((user) =>
      selectedUsers.includes(user.id!)
    ).length;
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleSubmit = async () => {
    await onSelectUsers(selectedUsers);
    onClose();
  };

  // Empty state
  const isEmpty = Object.values(filteredGroupedUsers).every(
    (users) => users?.length === 0
  );

  return (
    <motion.div
      className="absolute right-0 mt-2 w-72 rounded-md bg-white shadow-lg z-50 border border-gray-200 overflow-hidden"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      ref={dropdownRef}
    >
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-8 pr-8 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          {searchTerm && (
            <button
              className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {isError && (
        <div className="p-4 text-red-500 flex items-center justify-center">
          <X className="h-4 w-4 mr-2" />
          Error loading users
        </div>
      )}

      {isLoading ? (
        <div className="max-h-60 overflow-y-auto p-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse mb-4">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
              {[1, 2].map((j) => (
                <div key={j} className="flex items-center p-2">
                  <div className="w-4 h-4 rounded-sm bg-gray-200 mr-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : isEmpty && searchTerm ? (
        <div className="p-8 text-center text-gray-500 max-h-60 overflow-y-auto">
          <div className="flex justify-center mb-2">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm">No users found matching "{searchTerm}"</p>
          <button
            className="text-blue-500 text-sm mt-2 hover:underline"
            onClick={() => setSearchTerm("")}
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="max-h-60 overflow-y-auto">
          {Object.keys(filteredGroupedUsers).map((role) => {
            const usersInRole = filteredGroupedUsers[role];
            if (usersInRole.length === 0) return null;

            const selectedCount = getSelectedCountByRole(role);
            const allSelected =
              usersInRole.length > 0 && selectedCount === usersInRole.length;

            return (
              <div key={role} className="border-b last:border-b-0">
                <div
                  className="flex items-center px-3 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleRoleExpansion(role)}
                >
                  <button
                    className="p-1 rounded-sm hover:bg-gray-200 mr-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAllInRole(role);
                    }}
                  >
                    {allSelected ? (
                      <CheckCheck className="h-4 w-4 text-blue-500" />
                    ) : selectedCount > 0 ? (
                      <div className="relative">
                        <Circle className="h-4 w-4 text-blue-500" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        </div>
                      </div>
                    ) : (
                      <Circle className="h-4 w-4 text-gray-400" />
                    )}
                  </button>

                  <span className="text-sm font-medium flex-1">
                    {role}{" "}
                    {usersInRole.length > 0 && (
                      <span className="text-gray-500 text-xs ml-1">
                        ({usersInRole.length})
                      </span>
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
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {usersInRole.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center px-3 py-2 pl-8 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => toggleUserSelection(user.id!)}
                        >
                          <div
                            className={`w-4 h-4 rounded-sm border mr-3 flex items-center justify-center transition-colors ${
                              selectedUsers.includes(user.id!)
                                ? "bg-blue-500 border-blue-500"
                                : "border-gray-300 hover:border-blue-400"
                            }`}
                          >
                            {selectedUsers.includes(user?.id!) && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <span className="text-sm truncate">
                            {user.first_name} {user.last_name}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      <div className="p-3 border-t flex justify-between items-center bg-gray-50">
        <Button size="small" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="small"
          onClick={handleSubmit}
          disabled={selectedUsers.length === 0}
        >
          Add {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ""}
        </Button>
      </div>
    </motion.div>
  );
};

export default TagUsersDropdown;
